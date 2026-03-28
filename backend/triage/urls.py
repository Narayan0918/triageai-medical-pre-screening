from django.urls import path
from .views import AnalyzeSymptomAPIView, RegisterUserAPIView, TriageHistoryAPIView

urlpatterns = [
    path('analyze/', AnalyzeSymptomAPIView.as_view(), name='analyze'),
    path('register/', RegisterUserAPIView.as_view(), name='register'),
    path('history/', TriageHistoryAPIView.as_view(), name='history'), # ADD THIS
]