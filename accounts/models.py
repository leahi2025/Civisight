from django.contrib.auth.models import AbstractUser
from django.db import models
from forms.models import Form


# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = [(0, "state"), (1, "county")]

    role = models.CharField(choices=ROLE_CHOICES)

    email = models.EmailField()


class CountyOfficial(User):
    class Meta:
        verbose_name = "County Official"
        verbose_name_plural = "County Officials"

    county = models.ForeignKey(
        'counties.County',
        on_delete=models.CASCADE,
        related_name="users"
    )

    incomplete_forms = models.ManyToManyField(Form, related_name="countyofficial_incomplete")
    completed_forms = models.ManyToManyField(Form, related_name="countyofficial_complete")

    def save(self, *args, **kwargs):
        self.role = 1
        super().save(*args, **kwargs)


class StateOfficial(User):
    class Meta:
        verbose_name = "State Official"
        verbose_name_plural = "State Officials"

    state = models.ForeignKey(
        'states.State',
        on_delete=models.CASCADE,
        related_name="users"
    )

    def save(self, *args, **kwargs):
        self.role = 0
        super().save(*args, **kwargs)
