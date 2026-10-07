from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without CSRF enforcement for REST API endpoints.
    Allows easy interaction from the React frontend SPA.
    """
    def enforce_csrf(self, request):
        return  # Do not perform CSRF check
