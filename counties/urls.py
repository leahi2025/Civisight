from django.urls import path
from .views import CountyViewSet, test_county_view
from rest_framework.routers import DefaultRouter

print("=== LOADING COUNTIES URLS ===")

router = DefaultRouter()
router.register(r'', CountyViewSet, basename='county')

urlpatterns = [
    path('test/', test_county_view, name='test_county'),
] + router.urls

print("=== FINAL URLPATTERNS ===")
for url in urlpatterns:
    print(f"URL: {url}")