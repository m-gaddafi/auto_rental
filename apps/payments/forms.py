from django import forms


class PaymentIngestForm(forms.Form):
    raw_text = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 12, 'placeholder': 'Paste MTN payment summary here'}),
        label='MTN payment text',
        required=False,
    )
    raw_file = forms.FileField(
        required=False,
        label='Word or Excel file',
        help_text='Upload a .docx or .xlsx file instead of pasting text.',
    )

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('raw_text', '').strip() and not cleaned_data.get('raw_file'):
            raise forms.ValidationError('Paste payment text or upload a Word/Excel file.')
        return cleaned_data
