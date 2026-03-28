from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from ai_service import analyze_symptoms
from rest_framework.permissions import IsAuthenticatedOrReadOnly,IsAuthenticated
from .models import Doctor,TriageHistory
from .serializers import DoctorSerializer,TriageHistorySerializer



# backend/triage/views.py
from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# backend/triage/views.py
class RegisterUserAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '') # Default to empty string

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'This username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Using create_user handles password hashing automatically
            user = User.objects.create_user(username=username, password=password, email=email)
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

            if request.user.is_authenticated:
                TriageHistory.objects.create(
                    user=request.user,
                    symptoms=symptoms_text,
                    urgency=ai_result['urgency_level'],
                    specialty=ai_result['suggested_specialty']
                )

            return Response(final_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TriageHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch history for this specific user, newest first
        history = TriageHistory.objects.filter(user=request.user).order_by('-created_at')
        serializer = TriageHistorySerializer(history, many=True)
        return Response(serializer.data)