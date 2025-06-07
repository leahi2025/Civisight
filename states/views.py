from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from ..Civisight.permissions import IsStateOfficial
from rest_framework import status
from rest_framework.response import Response
from supabase import create_client
from django.shortcuts import render, redirect
from django.conf import settings
from states.models import State
from counties.models import County
from accounts.models import StateOfficial, CountyOfficial, User
from django.contrib import messages

@api_view(['POST'])
@permission_classes([IsStateOfficial])
def send_email(request):
    data = request.data
    send_to = data["receiver"]