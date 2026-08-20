import re
from datetime import datetime
from decimal import Decimal


def parse_single_mtn_text(text: str):
    data = {
        'transaction_id': '',
        'payment_date': None,
        'payment_time': None,
        'sender_name': '',
        'sender_phone': '',
        'amount': Decimal('0'),
        'raw_text': text,
    }

    txn_match = re.search(r'TxnID:\s*([^\s]+)', text, re.I)
    if txn_match:
        data['transaction_id'] = txn_match.group(1).strip()

    date_match = re.search(r'Date:\s*(\d{2}/\d{2}/\d{4})', text)
    if date_match:
        data['payment_date'] = datetime.strptime(date_match.group(1), '%d/%m/%Y').date()

    time_match = re.search(r'Time:\s*(\d{1,2}:\d{2})', text)
    if time_match:
        data['payment_time'] = datetime.strptime(time_match.group(1), '%H:%M').time()

    sender_match = re.search(r'From:\s*([^\n]+)', text, re.I)
    if sender_match:
        data['sender_name'] = sender_match.group(1).strip()

    phone_match = re.search(r'Tel:\s*([0-9+\s]+)', text, re.I)
    if phone_match:
        data['sender_phone'] = phone_match.group(1).strip()

    amount_match = re.search(r'Amount:\s*UGX\s*([0-9,\.]+)', text, re.I)
    if amount_match:
        data['amount'] = Decimal(amount_match.group(1).replace(',', ''))

    return data


def parse_mtn_text(raw_text: str):
    payments = parse_mtn_texts(raw_text)
    return payments[0] if payments else parse_single_mtn_text(raw_text)


def parse_mtn_texts(raw_text: str):
    text = raw_text or ''
    blocks = re.split(r'(?=TxnID:\s*)', text.strip())
    parsed = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        parsed.append(parse_single_mtn_text(block))
    if not parsed and text:
        parsed.append(parse_single_mtn_text(text))
    return parsed
