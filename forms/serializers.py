from rest_framework import serializers
from .models import Form
from accounts.models import CountyOfficial
from .models import CountyForm
from django.conf import settings
import os
from counties.models import County


class CountyBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = County
        fields = ("id", "name")


class CountyFormStatusSerializer(serializers.ModelSerializer):
    county_id = serializers.IntegerField(source='county.id')
    county_name = serializers.CharField(source='county.name')

    class Meta:
        model = CountyForm
        fields = ("id", "county_id", "county_name", "status", "created_at", "updated_at")



class FormSerializer(serializers.ModelSerializer):
    # incomplete_user_ids = serializers.SlugRelatedField(
    #     many=True,
    #     read_only=True,
    #     slug_field="email",
    #     source="countyofficial_incomplete"
    # )
    resolved_url = serializers.SerializerMethodField()
    county_statuses = serializers.SerializerMethodField()

    class Meta:
        model = Form
        fields = [
            "name",
            "id",
            # allow clients to submit a list of county ids to assign this form to
            "counties",
            "counties_details",
            "county_statuses",
            "date_uploaded",
            "finish_by",
            "file",
            "url",
            "resolved_url",
            "is_completed",
            "completed_at",
            "notify_every",
            "next_notify_date",
            # "incomplete_user_ids"
        ]
        read_only_fields = ["date_uploaded"]

    # Accept a list of county ids on create/update
    counties = serializers.PrimaryKeyRelatedField(queryset=County.objects.all(), many=True, required=False)
    # Provide a read-only resolved list of county objects for convenience
    counties_details = serializers.SerializerMethodField()

    def get_resolved_url(self, obj):
        # If already full URL, return it
        if obj.url and isinstance(obj.url, str) and obj.url.startswith("http"):
            return obj.url
        # If we have an object key, generate a signed or public URL
        key = obj.url
        if not key:
            return None
        bucket = os.getenv('SUPABASE_S3_BUCKET_NAME') or 'forms'
        sb = getattr(settings, 'SUPABASE_CLIENT', None)
        if sb is None:
            return None
        # Prefer a signed URL to avoid 404s on private buckets
        try:
            signed = sb.storage.from_(bucket).create_signed_url(key, 60 * 60 * 24 * 7)  # 7 days
            if isinstance(signed, dict):
                data_block = signed.get('data') or {}
                return data_block.get('signedUrl') or signed.get('signedURL') or signed.get('signedUrl')
            return getattr(signed, 'signed_url', None) or str(signed)
        except Exception:
            # Fallback to public URL if signing fails
            try:
                pub = sb.storage.from_(bucket).get_public_url(key)
                if isinstance(pub, dict):
                    data_block = pub.get('data') or {}
                    return data_block.get('publicUrl') or pub.get('publicURL') or pub.get('publicUrl') or pub.get('url')
                return getattr(pub, 'public_url', None) or str(pub)
            except Exception:
                return None

    def get_counties_details(self, obj):
        # return a list of {id,name} for assigned counties
        try:
            qs = obj.counties.all()
            return CountyBriefSerializer(qs, many=True).data
        except Exception:
            return []

    def get_county_statuses(self, obj):
        # return a list of county statuses for this form
        try:
            county_forms = CountyForm.objects.filter(form=obj)
            return CountyFormStatusSerializer(county_forms, many=True).data
        except Exception:
            return []

    def to_representation(self, instance):
        # include default fields then inject counties_details for read operations
        data = super().to_representation(instance)
        data["counties"] = self.get_counties_details(instance)
        return data

class CountyFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = CountyForm
        fields = '__all__'