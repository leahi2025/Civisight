from rest_framework.routers import DefaultRouter
from .views import CountyFormViewSet, FormViewSet

router = DefaultRouter()
router.register(r"", FormViewSet, basename="form")
router.register(r"county-forms", CountyFormViewSet, basename="county-form")

urlpatterns = router.urls
