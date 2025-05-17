from supabase import create_client
from django.shortcuts import render, redirect
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def signup(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]
        result = supabase.auth.sign_up({"email": email, "password": password})
        return redirect("login")
    return render(request, "signup.html")
