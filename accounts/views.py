from django.contrib.auth import authenticate, login
from supabase import create_client
from django.shortcuts import render, redirect
from django.conf import settings
from states.models import State
from counties.models import County
from accounts.models import StateOfficial, CountyOfficial, User
from django.contrib import messages

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_API_KEY)


def signup(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        role = int(request.POST["role"])
        
        if User.objects.filter(email=email).exists():
            messages.error(request, "That email is already registered.")
            return "invalid"
            #return render(request, "signup.html")

        if role == 0:
            state_name = request.POST["state"]
            state = State.objects.get(name=state_name)
            StateOfficial.objects.create_user(username=username, email=email, password=password, state=state)
        else:
            county_name = request.POST["county"]
            county = County.objects.get(name=county_name)
            CountyOfficial.objects.create_user(username=username, email=email, password=password, county=county)

        result = supabase.auth.sign_up({"email": email, "password": password})
        return "hello world"
        #return redirect("login")
    return render(request, "signup.html")


def signin(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]
        auth = supabase.auth.sign_in_with_password({"email": email, "password": password})
        token = auth.get("session", {}).get("access_token")
        if not token:
            # handle invalid creds
            return "invalid"
            #return render(request, "signin.html", {"error": "Invalid"})
        # Authenticate via our backend
        user = authenticate(request, token=token)
        if user:
            login(request, user)  # creates a Django session
            request.session["supabase_jwt"] = token
            return "authenticated"
            #return redirect("dashboard")
    return render(request, "signin.html")
