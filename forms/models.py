from django.db import models
from django.core.validators import FileExtensionValidator
from counties.models import County
import uuid

from Civisight import settings

User = settings.AUTH_USER_MODEL


# Creates the actual form that is uploaded to the database
class Form(models.Model):
    name = models.CharField(max_length=100, unique=True)

    date_uploaded = models.DateTimeField(auto_now_add=True)
    finish_by = models.DateTimeField()
    file = models.FileField(upload_to="forms/completed",
                            validators=[
                                FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])
                            ], null=True, blank=True)

    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

# CountyForm tracks assignments of that form to specific counties, including status, timestamps, and per-county progress
class CountyForm(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('cancelled', 'Cancelled'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    county = models.ForeignKey(County, on_delete=models.CASCADE)
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # What shows up in the admin and shell when you print a CountyForm
        return f"{self.county.name} - {self.form.name}"
