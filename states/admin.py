from django.contrib import admin
from .models import State


# Register your models here.

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ("name",)

