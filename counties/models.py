from django.db import models

# Create your models here.
class County(models.Model):
    name = models.CharField(max_length=20, unique=True)

    state = models.ForeignKey(
        'states.State',
        on_delete=models.CASCADE,
        related_name="counties",
        null=True
    )

    def __str__(self):
        return self.name