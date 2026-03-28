from rest_framework import serializers
from .models import Doctor,TriageHistory

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialty', 'hospital', 'shift_hours', 'credentials']


class TriageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TriageHistory
        fields = ['id', 'symptoms', 'urgency', 'specialty', 'created_at']