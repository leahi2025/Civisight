from rest_framework import serializers
from .models import County
from forms.models import CountyForm
from forms.serializers import FormSerializer

class CountyFormDetailSerializer(serializers.ModelSerializer):
    form = FormSerializer(read_only=True)
    
    class Meta:
        model = CountyForm
        fields = ['id', 'form', 'status', 'created_at', 'updated_at']

class CountySerializer(serializers.ModelSerializer):
    forms = CountyFormDetailSerializer(source='countyform_set', many=True, read_only=True)
    
    class Meta:
        model = County
        fields = '__all__'