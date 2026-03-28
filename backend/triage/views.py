from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.contrib.auth.models import User
from .models import Doctor, TriageHistory
from .serializers import DoctorSerializer, TriageHistorySerializer
from ai_service import analyze_symptoms

class RegisterUserAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '') 

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'This username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AnalyzeSymptomAPIView(APIView):
    # Allow guests to use it, but only auth users can save history
    permission_classes = [IsAuthenticatedOrReadOnly] 
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        symptoms_text = request.data.get('symptoms', '')

        if not symptoms_text.strip():
            return Response(
                {'error': 'A description of your symptoms is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # STEP 1: Secure Image Parsing
        image_bytes = None
        mime_type = None
        if image_file:
            try:
                image_bytes = image_file.read()
                mime_type = image_file.content_type
            except Exception as e:
                print(f"Image Parse Error: {str(e)}")
                return Response({'error': 'Failed to process the uploaded image.'}, status=status.HTTP_400_BAD_REQUEST)

        # STEP 2: Call Gemini AI Service securely
        try:
            ai_result = analyze_symptoms(image_bytes, mime_type, symptoms_text)
        except Exception as e:
            print(f"Gemini Engine Error: {str(e)}") # This will now show up in Render Logs!
            return Response({'error': f'AI Service failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # STEP 3: Process the AI Result & Query Doctors
        try:
            # Safely get values using .get() to prevent KeyErrors if Gemini alters the schema slightly
            specialty = ai_result.get('suggested_specialty', 'General Practice')
            urgency = ai_result.get('urgency_level', 'Yellow')

            doctors = Doctor.objects.filter(specialty__icontains=specialty)[:5]
            serialized_doctors = DoctorSerializer(doctors, many=True).data

            final_response = {
                "ai_analysis": ai_result,
                "recommended_doctors": serialized_doctors
            }
        except Exception as e:
            print(f"Data Formatting Error: {str(e)}")
            return Response({'error': f'Failed to structure response: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # STEP 4: Save to Database (If logged in)
        if request.user.is_authenticated:
            try:
                TriageHistory.objects.create(
                    user=request.user,
                    symptoms=symptoms_text,
                    urgency=urgency,
                    specialty=specialty
                )
            except Exception as e:
                # If saving to history fails, we print it to logs but we DON'T crash the whole app.
                print(f"TiDB Database Save Error: {str(e)}")

        # Finally, return the success payload!
        return Response(final_response, status=status.HTTP_200_OK)


class TriageHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch history for this specific user, newest first
        history = TriageHistory.objects.filter(user=request.user).order_by('-created_at')
        serializer = TriageHistorySerializer(history, many=True)
        return Response(serializer.data)