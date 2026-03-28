from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from ai_service import analyze_symptoms
from .models import Doctor
from .serializers import DoctorSerializer

class AnalyzeSymptomAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # image_file will be None if the frontend didn't upload anything
        image_file = request.FILES.get('image')
        symptoms_text = request.data.get('symptoms', '')

        # Basic validation: Now only require text
        if not symptoms_text.strip():
            return Response(
                {'error': 'A description of your symptoms is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Handle image data dynamically
            image_bytes = None
            mime_type = None
            if image_file:
                image_bytes = image_file.read()
                mime_type = image_file.content_type

            # 2. call ai service (image data can be None)
            ai_result = analyze_symptoms(image_bytes, mime_type, symptoms_text)

            # 3. rest fine (query doctors etc)
            specialty = ai_result.get('suggested_specialty', '')
            doctors = Doctor.objects.filter(specialty__icontains=specialty)[:5]
            serialized_doctors = DoctorSerializer(doctors, many=True).data

            final_response = {
                "ai_analysis": ai_result,
                "recommended_doctors": serialized_doctors
            }

            return Response(final_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)