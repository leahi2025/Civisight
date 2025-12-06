from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from supabase import create_client, create_async_client
from django.shortcuts import render, redirect
from django.conf import settings
from states.models import State
from counties.models import County
from accounts.models import StateOfficial, CountyOfficial, User
from django.contrib import messages
from Civisight.settings import supabase
from .serializers import AccountSerializer

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    data = request.data
    username = data["username"]
    email = data["email"].strip()
    password = data["password"].strip()
    role = int(data["role"])
        
    if User.objects.filter(email=email).exists():
        #messages.error(request, "That email is already registered.")
        return Response({"error": "That email is already registered."}, status=status.HTTP_400_BAD_REQUEST)
        #return render(request, "signup.html")

    if role == 0:
        state_name = data["name"]
        state = State.objects.get(name=state_name)
        StateOfficial.objects.create_user(username=username, email=email, password=password, state=state)
    else:
        county_name = data["name"]
        county = County.objects.get(name=county_name)
        CountyOfficial.objects.create_user(username=username, email=email, password=password, county=county)

    
    
    result = supabase.auth.sign_up({"email": email, "password": password})
    return Response({"message": "ok"}, status=status.HTTP_201_CREATED)
        #return redirect("login")
    #return render(request, "signup.html")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    data = request.data
    

    email = data["email"].strip()
    password = data["password"].strip()
    auth = supabase.auth.sign_in_with_password({"email": email, "password": password})
    token = auth.session.access_token
    
    if not token:
        # handle invalid creds
        return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)
            #return render(request, "signin.html", {"error": "Invalid"})
        # Authenticate via our backend
    user = authenticate(request, token=token)
    
    user_obj = User.objects.get(email=email)
    if user:
        login(request, user)  # creates a Django session
        request.session["supabase_jwt"] = token
        
        response_data = {"message": "ok", "role": user_obj.role}
        
        # If county official, include their county ID
        if user_obj.role == "1":
            try:
                county_official = CountyOfficial.objects.get(email=email)
                response_data["county_id"] = county_official.county.id
            except CountyOfficial.DoesNotExist:
                pass
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        #return redirect("dashboard")

    return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def account_me(request):
    """Return the authenticated user's account info (email, user_type)."""
    if not request.user or not request.user.is_authenticated:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    data = AccountSerializer(request.user).data
    return Response(data)


# Helper endpoint: ensure Django issues a CSRF cookie for cross-site clients.
# Call this with a simple GET from the frontend before making POST requests.
@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def ensure_csrf(request):
    return Response({"detail": "CSRF cookie set"})
