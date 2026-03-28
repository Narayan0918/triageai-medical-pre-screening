from django.contrib import admin
from .models import Doctor
# Register your models here.

class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name','specialty','hospital','shift_hours','credentials','created_at')

admin.site.register(Doctor,DoctorAdmin)