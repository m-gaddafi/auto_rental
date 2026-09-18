from django.test import TestCase

from apps.units.forms import PropertyForm, UnitForm
from apps.units.models import Property
from apps.units.models import Unit
from apps.masterlog.services import MONTHS, build_rent_sheet


class PropertyUnitTest(TestCase):
    def test_unit_can_be_created_under_property(self):
        property_form = PropertyForm(data={'name': 'Sunrise Apartments', 'is_active': 'on'})
        self.assertTrue(property_form.is_valid())
        property_obj = property_form.save()

        unit_form = UnitForm(data={
            'property': property_obj.pk,
            'unit_id': 'A-101',
            'tenant_name': '',
            'tenant_phone': '',
            'monthly_rate': '500000',
            'is_active': 'on',
        })

        self.assertTrue(unit_form.is_valid())
        self.assertEqual(unit_form.save().property, property_obj)

    def test_new_unit_is_included_in_all_twelve_accounting_months(self):
        Unit.objects.create(unit_id='A-102', monthly_rate='500000')

        sheet = build_rent_sheet(2026)

        self.assertEqual(len(MONTHS), 12)
        self.assertEqual(len(sheet['rows'][0]['cells']), 12)
        self.assertTrue(all(cell['state'] == 'not-paid' for cell in sheet['rows'][0]['cells']))

    def test_property_sheet_only_contains_its_own_units(self):
        msj = Property.objects.create(name='Test MSJ')
        kcv = Property.objects.create(name='Test KCV')
        Unit.objects.create(property=msj, unit_id='TEST-MSJ-1', monthly_rate='250000')
        Unit.objects.create(property=kcv, unit_id='TEST-KCV-1', monthly_rate='300000')

        sheet = build_rent_sheet(2026, msj)

        self.assertEqual([row['unit'].unit_id for row in sheet['rows']], ['TEST-MSJ-1'])
