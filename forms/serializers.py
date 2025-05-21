from rest_framework import serializers
from .models import Form


class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = [
            "id",
            "date_uploaded",
            "finish_by",
            "file",
            "is_completed",
            "completed_at"
        ]
        read_only_fields = ["date_uploaded"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
