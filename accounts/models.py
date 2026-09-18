from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    role = models.CharField(max_length=20, default='user')
    can_paste_payments = models.BooleanField(default=False)
    can_verify_payments = models.BooleanField(default=False)

    def __str__(self):
        return self.username
