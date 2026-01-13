from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class AccountSerializer(serializers.Serializer):
    email = serializers.EmailField()
    user_type = serializers.CharField()
    # include county_id for county officials when available
    county_id = serializers.IntegerField(required=False, allow_null=True)
    state_id = serializers.IntegerField(required=False, allow_null=True)

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
            # try to fetch county id for county officials
            county_id = None
            try:
                if user_type == 'county':
                    co = CountyOfficial.objects.get(pk=instance.pk)
                    county_id = co.county.id if getattr(co, 'county', None) else None
            except Exception:
                county_id = None

            state_id = None
            try:
                if user_type == 'state':
                    co = StateOfficial.objects.get(pk=instance.pk)
                    state_id = co.state.id if getattr(co, 'state', None) else None
            except Exception:
                state_id = None

        except Exception:
            # Fallback to role if imports fail
            role = getattr(instance, 'role', None)
            if str(role) == '0':
                user_type = 'state'
            elif str(role) == '1':
                user_type = 'county'
            county_id = None
            state_id = None

        return {
            'email': email,
            'user_type': user_type,
            'county_id': county_id,
            'state_id': state_id,
        }

