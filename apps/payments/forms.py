from django import forms


class PaymentIngestForm(forms.Form):
    raw_text = forms.CharField(widget=forms.Textarea(attrs={'rows': 12, 'placeholder': 'Paste MTN payment summary here'}), label='MTN payment text')
