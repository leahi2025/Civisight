from django.contrib import admin
from .models import CountyOfficial, StateOfficial


# Register your models here.

@admin.register(CountyOfficial)
class CountyOfficialAdmin(admin.ModelAdmin):
    list_display = ("county",)


@admin.register(StateOfficial)
class StateOfficialAdmin(admin.ModelAdmin):
    list_display = ("state",)
