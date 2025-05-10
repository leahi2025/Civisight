from django.db import models

# Create your models here.
class County(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name