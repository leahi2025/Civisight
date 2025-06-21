from django.urls import path
from .views import CountyViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'counties', CountyViewSet, basename='county')

urlpatterns = router.urls