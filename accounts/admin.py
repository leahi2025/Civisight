from django.contrib import admin 
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
# from models import User
from .models import CountyOfficial, StateOfficial
from .models import User


# Register your models here.

@admin.register(CountyOfficial)
class CountyOfficialAdmin(admin.ModelAdmin):
    list_display = ("county",)


@admin.register(StateOfficial)
class StateOfficialAdmin(admin.ModelAdmin):
    list_display = ("state",)

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets