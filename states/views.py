from rest_framework import viewsets
from .models import State
from .serializers import StateSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class StateViewSet(viewsets.ModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]