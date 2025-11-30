from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class AccountSerializer(serializers.Serializer):
    email = serializers.EmailField()
    user_type = serializers.CharField()

    def to_representation(self, instance):
        # instance is a User
        email = getattr(instance, 'email', '')

        # Determine user type using subclasses or role
        user_type = 'user'
        try:
            from accounts.models import StateOfficial, CountyOfficial
            if StateOfficial.objects.filter(pk=instance.pk).exists():
                user_type = 'state'
            elif CountyOfficial.objects.filter(pk=instance.pk).exists():
                user_type = 'county'
            else:
                role = getattr(instance, 'role', None)
                if str(role) == '0':
                    user_type = 'state'
                elif str(role) == '1':
                    user_type = 'county'
        except Exception:
            # Fallback to role if imports fail
            role = getattr(instance, 'role', None)
            if str(role) == '0':
                user_type = 'state'
            elif str(role) == '1':
                user_type = 'county'

        return {
            'email': email,
            'user_type': user_type,
        }
