from django.db import models


# Create your models here.
class County(models.Model):
    class Meta:
        verbose_name_plural = "Counties"

    name = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True, default='no-email@example.com')  # with default
    phone = models.CharField(max_length=15, default='')  # with default
    created_at = models.DateTimeField(auto_now_add=True)
    task_count = models.IntegerField(default=0)

    state = models.ForeignKey(
        'states.State',
        on_delete=models.CASCADE,
        related_name="counties",
        null=True
    )

    def __str__(self):
        return self.name