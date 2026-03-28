from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from ai_service import analyze_symptoms
from .models import Doctor
from .serializers import DoctorSerializer

class AnalyzeSymptomAPIView(APIView):
    # This tells Django to accept file uploads (multipart/form-data)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        symptoms_text = request.data.get('symptoms', '')

        # Basic validation
        if not image_file or not symptoms_text:
            return Response(
                {'error': 'Both an image and a symptom description are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Read image data
            image_bytes = image_file.read()
            mime_type = image_file.content_type

            # 2. Get the structured JSON from Gemini
            ai_result = analyze_symptoms(image_bytes, mime_type, symptoms_text)

            # 3. Find matching doctors in the database
            specialty = ai_result.get('suggested_specialty', '')
            # Filter doctors by specialty (case-insensitive) and limit to 5 results
            doctors = Doctor.objects.filter(specialty__icontains=specialty)[:5]
            serialized_doctors = DoctorSerializer(doctors, many=True).data

            # 4. Package it all up for React
            final_response = {
                "ai_analysis": ai_result,
                "recommended_doctors": serialized_doctors
            }

            return Response(final_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)