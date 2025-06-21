from django.db import models


# Create your models here.
class State(models.Model):
    name = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True, default='no-email@example.com')
    phone = models.CharField(max_length=15, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return self.name