from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
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

@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    print("RAW BODY:", request.body)
    data = request.data
    

    email = data["email"].strip()
    password = data["password"].strip()
    print(email, password)
    auth = supabase.auth.sign_in_with_password({"email": email, "password": password})
    token = auth.session.access_token
    
    if not token:
        # handle invalid creds
        return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)
            #return render(request, "signin.html", {"error": "Invalid"})
        # Authenticate via our backend
    user = authenticate(request, token=token)
    if user:
        login(request, user)  # creates a Django session
        
        request.session["supabase_jwt"] = token
        return Response({"message": "ok"}, status=status.HTTP_201_CREATED)
        #return redirect("dashboard")

    return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)
