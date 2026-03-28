from django.db import models

# Create your models here.

class Doctor(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255, db_index=True) # Indexed for faster AI matching
    hospital = models.CharField(max_length=255)
    shift_hours = models.CharField(max_length=100)
    credentials = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.specialty}"