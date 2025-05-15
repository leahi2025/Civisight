from django.contrib import admin
from .models import County


# Register your models here.

@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ("name", "state")
