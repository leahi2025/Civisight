from django.db import models
from django.core.validators import FileExtensionValidator

from Civisight import settings

User = settings.AUTH_USER_MODEL


# Create your models here.
class Form(models.Model):
    name = models.CharField(max_length=100, unique=True)

    date_uploaded = models.DateTimeField(auto_now_add=True)
    finish_by = models.DateTimeField()

    county = models.ForeignKey("counties.County",
                               on_delete=models.CASCADE,
                               related_name="forms")

    file = models.FileField(upload_to="forms/completed",
                            validators=[
                                FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])
                            ], null=True, blank=True)

    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        # What shows up in the admin and shell when you print a PDFForm
        return self.name
