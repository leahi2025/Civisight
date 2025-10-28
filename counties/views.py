from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import County
from .serializers import CountySerializer

@api_view(['GET', 'POST'])
def test_county_view(request):
    print("=== TEST COUNTY VIEW CALLED ===")
    print("Method:", request.method)
    print("Data:", request.data)
    
    if request.method == 'POST':
        return Response({"message": "POST works!", "data": request.data}, status=status.HTTP_201_CREATED)
    else:
        return Response({"message": "GET works!"})

class CountyViewSet(viewsets.ModelViewSet):
    queryset = County.objects.all()
    serializer_class = CountySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Return counties scoped to the authenticated user's state or county when possible.

        Behavior:
        - If the request has an authenticated user who is a StateOfficial, return counties for that state.
        - If the user is a CountyOfficial, return only that county.
        - Otherwise return the full queryset (default behavior).

        This relies on Django session authentication: the signin view calls `login(request, user)`
        and the frontend sends the `sessionid` cookie with requests (axios.withCredentials=true),
        so `request.user` will be populated.
        """
        user = getattr(self.request, 'user', None)
        qs = super().get_queryset()

        if not user or not user.is_authenticated:
            return qs

        # import here to avoid potential circular imports at module load time
        try:
            from accounts.models import StateOfficial, CountyOfficial
        except Exception:
            # if accounts app not available for some reason, fall back to full queryset
            return qs

        # If user is a StateOfficial (multi-table inheritance), try to access the related subclass
        state_official = StateOfficial.objects.filter(pk=user.pk).first()
        if state_official:
            if state_official.state_id:
                return qs.filter(state_id=state_official.state_id)
            return qs.none()

        # If user is a CountyOfficial, return only that county
        county_official = CountyOfficial.objects.filter(pk=user.pk).first()
        if county_official:
            if county_official.county_id:
                return qs.filter(pk=county_official.county_id)
            return qs.none()

        return qs

    def __init__(self, *args, **kwargs):
        print("=== COUNTYVIEWSET INITIALIZED ===")
        super().__init__(*args, **kwargs)

    def dispatch(self, request, *args, **kwargs):
        print("=== DISPATCH CALLED ===")
        print("Request method:", request.method)
        print("Request path:", request.path)
        return super().dispatch(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        print("=== COUNTY CREATE METHOD CALLED ===")
        print("Request method:", request.method)
        print("Request data:", request.data)
        
        county_data = request.data.copy()
        serializer = self.get_serializer(data=county_data)
        
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)