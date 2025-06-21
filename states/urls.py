from django.urls import path
from .views import StateViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'states', StateViewSet, basename='state')

urlpatterns = router.urls