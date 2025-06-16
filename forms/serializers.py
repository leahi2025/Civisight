from rest_framework import serializers
from .models import Form
from accounts.models import CountyOfficial


class FormSerializer(serializers.ModelSerializer):
    incomplete_user_ids = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="email",
        source="countyofficial_incomplete"
    )
    class Meta:
        
        model = Form
        fields = [
            "id",
            "date_uploaded",
            "finish_by",
            "file",
            "is_completed",
            "completed_at",
            "incomplete_user_ids"
        ]
        read_only_fields = ["date_uploaded"]