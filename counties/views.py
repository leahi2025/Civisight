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