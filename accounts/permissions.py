def is_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_staff or user.role == 'admin')


def can_paste_payments(user):
    return is_admin(user) or (user.is_authenticated and user.role == 'manager' and user.can_paste_payments)


def can_verify_payments(user):
    return is_admin(user) or (user.is_authenticated and user.role == 'manager' and user.can_verify_payments)