from io import BytesIO
from decimal import Decimal
from zipfile import ZIP_DEFLATED, ZipFile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from apps.payments.utils import parse_uploaded_payments


class PaymentImportTest(TestCase):

    def test_word_table_import_reads_each_transaction_row(self):
        xml = '''<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
        <w:tbl>
          <w:tr><w:tc><w:p><w:r><w:t>Id</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Date</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>From handler name</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Amount</w:t></w:r></w:p></w:tc></w:tr>
          <w:tr><w:tc><w:p><w:r><w:t>42503485523</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>08/03/2026, 10:25:06</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>ROBERT HIGENYI</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>UGX 1,050,000</w:t></w:r></w:p></w:tc></w:tr>
          <w:tr><w:tc><w:p><w:r><w:t>42502556654</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>08/03/2026, 09:40:10</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>HANIFAH NAKABALA</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>UGX 100,000</w:t></w:r></w:p></w:tc></w:tr>
        </w:tbl></w:body></w:document>'''
        output = BytesIO()
        with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
            archive.writestr('word/document.xml', xml)

        payments = parse_uploaded_payments(SimpleUploadedFile('transactions.docx', output.getvalue()))

        self.assertEqual(len(payments), 2)
        self.assertEqual(payments[0]['transaction_id'], '42503485523')
        self.assertEqual(payments[0]['sender_name'], 'ROBERT HIGENYI')
        self.assertEqual(payments[0]['amount'], Decimal('1050000'))
        self.assertEqual(payments[0]['payment_time'].strftime('%H:%M:%S'), '10:25:06')

    def test_excel_import_returns_one_payment_per_transaction_row(self):
        from openpyxl import Workbook

        workbook = Workbook()
        sheet = workbook.active
        sheet.append(['TxnID', 'Date', 'Time', 'From', 'Tel', 'Amount'])
        sheet.append(['TX-001', '05/08/2026', '14:22', 'Jane Doe', '+256712345678', '500000'])
        sheet.append(['TX-002', '06/08/2026', '15:30', 'John Doe', '+256700000000', '300000'])
        output = BytesIO()
        workbook.save(output)

        payments = parse_uploaded_payments(SimpleUploadedFile('payments.xlsx', output.getvalue()))

        self.assertEqual(len(payments), 2)
        self.assertEqual([payment['transaction_id'] for payment in payments], ['TX-001', 'TX-002'])
        self.assertEqual(payments[0]['amount'], Decimal('500000'))

    def test_word_import_keeps_labeled_paragraphs_as_one_transaction(self):
        xml = '''<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body><w:p><w:r><w:t>TxnID: TX-003</w:t></w:r></w:p>
          <w:p><w:r><w:t>Date: 07/08/2026</w:t></w:r></w:p>
          <w:p><w:r><w:t>Time: 10:15</w:t></w:r></w:p>
          <w:p><w:r><w:t>From: Jane Doe</w:t></w:r></w:p>
          <w:p><w:r><w:t>Tel: +256712345678</w:t></w:r></w:p>
          <w:p><w:r><w:t>Amount: UGX 250000</w:t></w:r></w:p>
          </w:body>
        </w:document>'''
        output = BytesIO()
        with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
            archive.writestr('word/document.xml', xml)

        payments = parse_uploaded_payments(SimpleUploadedFile('payments.docx', output.getvalue()))

        self.assertEqual(len(payments), 1)
        self.assertEqual(payments[0]['transaction_id'], 'TX-003')
        self.assertEqual(payments[0]['amount'], Decimal('250000'))
