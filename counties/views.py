from rest_framework import viewsets
from .models import County
from .serializers import CountySerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class CountyViewSet(viewsets.ModelViewSet):
    queryset = County.objects.all()
    serializer_class = CountySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]