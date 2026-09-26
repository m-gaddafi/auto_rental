from django.template.loader import render_to_string
from django.test import SimpleTestCase


class RentSheetTemplateTest(SimpleTestCase):
    def test_master_log_sheet_hides_property_and_keeps_unit_rate_columns(self):
        html = render_to_string('includes/rent_sheet.html', {
            'hide_property_column': True,
            'sheet': {
                'property': None,
                'months': [],
                'rows': [],
                'monthly_totals': [],
                'maximum_possible': 0,
                'recovery': [],
            },
        })

        self.assertIn('Unit ID', html)
        self.assertIn('Rate', html)
        self.assertNotIn('Property</th>', html)
        self.assertIn('rent-sheet--frozen', html)
        self.assertIn('colspan="2"', html)
