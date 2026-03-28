import random
from django.core.management.base import BaseCommand
from triage.models import Doctor
from faker import Faker

class Command(BaseCommand):
    help = 'Seeds the database with mock doctor profiles'

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        # We need these specific specialties to match the AI's predictions
        specialties = [
            'Dermatology', 'Orthopedics', 'General Practice', 
            'Cardiology', 'Neurology', 'Pediatrics', 'Emergency Medicine'
        ]

        Doctor.objects.all().delete() # Clear existing data
        self.stdout.write('Clearing old doctors...')

        doctors_to_create = []
        for _ in range(100):
            doctor = Doctor(
                name=f"Dr. {fake.last_name()}",
                specialty=random.choice(specialties),
                hospital=f"{fake.city()} Medical Center",
                shift_hours=random.choice(["08:00 AM - 04:00 PM", "12:00 PM - 08:00 PM", "Night Shift: 10:00 PM - 06:00 AM"]),
                credentials=random.choice(["MD, FAAD", "MBBS, MS", "DO, Board Certified", "MD, PhD"])
            )
            doctors_to_create.append(doctor)

        # Bulk create is much faster than saving one by one
        Doctor.objects.bulk_create(doctors_to_create)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded 100 mock doctors!'))