from django.contrib.auth.models import AbstractUser
from django.db import models
from forms.models import Form

# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = [(0, "state"), (1, "county")]
    
    role = models.CharField(choices=ROLE_CHOICES)


class CountyOfficial(User):

    county = models.ForeignKey(
        'counties.County',
        on_delete=models.CASCADE,
        related_name="users"
    )

    forms = models.ManyToManyField(Form)

    def save(self, *args, **kwargs):
        self.role = 1
        super().save(*args, **kwargs)

class StateOfficial(User):

    state = models.ForeignKey(
        'states.State',
        on_delete=models.CASCADE,
        related_name="users"
    )

    def save(self, *args, **kwargs):
        self.role = 0
        super().save(*args, **kwargs)
