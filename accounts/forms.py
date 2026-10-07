from django import forms

from .models import CustomUser


class ManagerCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(), label='Password')

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']
        labels = {
            'username': 'Username',
            'email': 'Email address',
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        user.role = 'manager'
        if commit:
            user.save()
        return user
