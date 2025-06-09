from rest_framework import viewsets
from .models import Form
from .serializers import FormSerializer
from Civisight.permissions import FormPermission, IsStateOfficial
from django.db.models import Q


class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [FormPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        if IsStateOfficial().has_permission(self.request, self):
            return qs
        return qs.filter(
            Q(countyofficials_completed=self.request.user) |
            Q(countyofficials_incomplete=self.request.user)
        )
