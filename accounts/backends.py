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
                key=settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_exp": True},
                leeway=60,
                audience="authenticated"
            )
            
        except jwt.PyJWTError as e:
            print(e)
            return None
        user_email = payload.get("email")
        try:
            return User.objects.get(email=user_email)
        except User.DoesNotExist:
            return None

    def get_user(self, user_pk):
        try:
            return User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            return None
