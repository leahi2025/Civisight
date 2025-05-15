from django.db import models
from django.core.validators import FileExtensionValidator


# Create your models here.
class Form(models.Model):
    name = models.CharField(max_length=100, unique=True)

    finish_by = models.DateTimeField()

    file = models.FileField(upload_to="forms/%Y/%m/%d/",
                            validators=[
                                FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])
                            ], null=True, blank=True)