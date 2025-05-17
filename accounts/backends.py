import jwt
import requests
from django.conf import settings
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

from accounts.models import User

_jwks = requests.get(settings.SUPABASE_JWKS_URL).json()["keys"]


class SupabaseBackend(BaseBackend):
    def authenticate(self, request, token=None):
        if not token:
            return None
        try:
            payload = jwt.decode(
                token,
                key=_jwks,
                algorithms=["RS256"],
                audience=settings.SUPABASE_URL,
                options={"verify_exp": True},
            )
        except jwt.PyJWTError:
            return None
        user_id = payload.get("sub")
        try:
            return User.objects.get(username=user_id)
        except User.DoesNotExist:
            return None

    def get_user(self, user_pk):
        try:
            return User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            return None
