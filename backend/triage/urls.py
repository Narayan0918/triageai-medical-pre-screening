from django.urls import path
from .views import AnalyzeSymptomAPIView

urlpatterns = [
    path('analyze/', AnalyzeSymptomAPIView.as_view(), name='analyze_symptom'),
]