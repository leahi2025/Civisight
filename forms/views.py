from rest_framework import viewsets
from .models import CountyForm, Form
from .serializers import CountyFormSerializer, FormSerializer
from Civisight.permissions import FormPermission, IsStateOfficial, IsCountyOfficial
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.decorators import permission_classes as p_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from counties.models import County

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [AllowAny] # TODO: change to IsCountyOfficial

    def get_queryset(self):
        qs = super().get_queryset()
        # if IsStateOfficial().has_permission(self.request, self):
        #     return qs
        # return qs.filter(
        #     Q(countyofficial_complete=self.request.user) |
        #     Q(countyofficial_incomplete=self.request.user)
        # )
        return qs
    
    def create(self, request, *args, **kwargs):
        # Extract counties from request data
        counties_data = request.data.pop('counties', [])
        
        # Create the form
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        form = serializer.save()
        
        # Create CountyForm relationships
        for county_id in counties_data:
            try:
                county = County.objects.get(id=county_id)
                CountyForm.objects.create(
                    county=county,
                    form=form,
                    status='pending'
                )
            except County.DoesNotExist:
                pass  # Skip if county doesn't exist
        
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"])
    @p_classes(IsStateOfficial)
    def remind(self, request, pk=None):
        """
        POST /api/forms/{pk}/remind/
        """
        form = self.get_object()
        user_emails = request.data.get("user_emails", [])
        # filter only those who truly are incomplete for this form
        for u in user_emails:
            send_mail(
                subject=f"Reminder: please complete form #{form.id}",
                message="Please finish your assigned form.",
                from_email="no-reply@yourdomain.com",
                recipient_list=[u],
            )
        return Response({"sent_to": [u for u in user_emails]})
    
class CountyFormViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # TODO: change to IsCountyOfficial
    queryset = CountyForm.objects.all()
    serializer_class = CountyFormSerializer