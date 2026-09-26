from django import forms


class PaymentIngestForm(forms.Form):
    raw_text = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 12, 'placeholder': 'Paste receipt summary here'}),
        label='Receipt text',
        required=False,
    )
    raw_file = forms.FileField(
        required=False,
        label='Receipt list file',
        help_text='Upload a .docx or .xlsx file instead of pasting text.',
    )

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('raw_text', '').strip() and not cleaned_data.get('raw_file'):
            raise forms.ValidationError('Paste receipt text or upload a receipt file.')
        return cleaned_data
