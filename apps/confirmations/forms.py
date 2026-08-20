from datetime import datetime
from decimal import Decimal, InvalidOperation
import re

from django import forms


class ConfirmationForm(forms.Form):
    ALLOCATION_TAG_CHOICES = [
        ('full', 'Full'),
        ('part', 'Part'),
        ('bal', 'Bal'),
    ]

    MONTH_CHOICES = [
        ('', 'Select month'),
        ('january', 'January'),
        ('february', 'February'),
        ('march', 'March'),
        ('april', 'April'),
        ('may', 'May'),
        ('june', 'June'),
        ('july', 'July'),
        ('august', 'August'),
        ('september', 'September'),
        ('october', 'October'),
        ('november', 'November'),
        ('december', 'December'),
    ]

    payment_id = forms.IntegerField(widget=forms.HiddenInput())
    confirmation_comment = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3}),
        max_length=200,
        required=True,
        label='Manager comment',
        help_text='Add the manager note before submitting the confirmation.',
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        current_year = datetime.now().year
        year_choices = [('', 'Select year')] + [(str(y), str(y)) for y in range(current_year - 2, current_year + 3)]
        submitted_indexes = {
            int(match.group(1))
            for key in self.data.keys()
            if (match := re.fullmatch(r'allocation_unit_(\d+)', key)) and int(match.group(1)) <= 50
        }
        self.allocation_indexes = sorted(submitted_indexes or {1})
        self.allocation_rows = []
        for index in self.allocation_indexes:
            self._add_allocation_fields(index, year_choices)
            self.allocation_rows.append({
                'index': index,
                'unit': self[f'allocation_unit_{index}'],
                'amount': self[f'allocation_amount_{index}'],
                'tag': self[f'allocation_tag_{index}'],
                'month': self[f'allocation_month_{index}'],
                'year': self[f'allocation_year_{index}'],
            })

    def _add_allocation_fields(self, index, year_choices):
        self.fields[f'allocation_unit_{index}'] = forms.CharField(max_length=50, required=False, label='Unit')
        self.fields[f'allocation_amount_{index}'] = forms.DecimalField(max_digits=12, decimal_places=2, min_value=0, required=False, label='Amount')
        self.fields[f'allocation_tag_{index}'] = forms.ChoiceField(choices=self.ALLOCATION_TAG_CHOICES, required=False, label='Tag')
        self.fields[f'allocation_month_{index}'] = forms.ChoiceField(choices=self.MONTH_CHOICES, required=False, label='Month')
        self.fields[f'allocation_year_{index}'] = forms.ChoiceField(choices=year_choices, required=False, label='Year')

    def get_allocation_rows(self):
        rows = []
        for index in self.allocation_indexes:
            unit = (self.cleaned_data.get(f'allocation_unit_{index}') or '').strip()
            amount = self.cleaned_data.get(f'allocation_amount_{index}')
            tag = (self.cleaned_data.get(f'allocation_tag_{index}') or '').strip()
            month = (self.cleaned_data.get(f'allocation_month_{index}') or '').strip()
            year = self.cleaned_data.get(f'allocation_year_{index}')

            if not any([unit, amount, tag, month, year]):
                continue

            if not unit or amount in (None, '') or not tag or not month or not year:
                self.add_error(None, f'Please complete every field for allocation row {index}.')
                continue

            try:
                amount_value = Decimal(str(amount))
            except (InvalidOperation, TypeError, ValueError):
                self.add_error(None, f'Invalid amount for allocation row {index}.')
                continue

            rows.append({
                'unit': unit,
                'amount': amount_value,
                'tag': tag or 'part',
                'month': month,
                'year': int(year) if year else None,
            })
        return rows
