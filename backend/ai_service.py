import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# 1. Define the exact JSON structure we want the AI to return
class TriageResult(BaseModel):
    urgency_level: str = Field(description="Must be exactly 'Red', 'Yellow', or 'Green'. Red = Emergency, Yellow = Urgent, Green = Routine.")
    suggested_specialty: str = Field(description="Must exactly match one of: Dermatology, Orthopedics, General Practice, Cardiology, Neurology, Pediatrics, Emergency Medicine")
    possible_causes: list[str] = Field(description="List of 2-3 highly probable causes based on the image and text.")
    precautions: list[str] = Field(description="List of 3-5 immediate first-aid steps or precautions the user should take right now.")
    watch_out_symptoms: list[str] = Field(description="List of 2-3 severe symptoms that, if they appear, mean the user should go to the ER immediately.")

# 2. The main processing function
def analyze_symptoms(image_bytes: bytes, mime_type: str, text_description: str) -> dict:
    """
    Takes an image and text description, sends it to Gemini 2.5 Flash, 
    and returns a strictly formatted dictionary.
    """
    # Initialize the client using the API key from your .env
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # Construct the image part for the multimodal prompt
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    # Construct the strict system prompt
    system_instruction = """
    You are an expert, highly conservative medical pre-screening triage assistant. 
    Your job is to analyze the provided image of a patient's physical symptom alongside their text description.
    You DO NOT diagnose rare or catastrophic diseases for minor symptoms. You prioritize patient safety.
    If the image or text implies an immediate threat to life (e.g., severe bleeding, chest pain), escalate urgency to 'Red' and route to 'Emergency Medicine'.
    Always use a calm, objective tone.
    """
    
    prompt = f"Patient Description: {text_description}\nAnalyze this description and the attached image."

    try:
        # Call the Gemini 2.5 Flash model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=TriageResult,
                temperature=0.2, # Keep it low so the AI doesn't get too "creative" with medical advice
            ),
        )
        
        # The response.text is guaranteed to be a JSON string matching our Pydantic model
        import json
        return json.loads(response.text)
        
    except Exception as e:
        # Fallback safety net in case the API times out or fails
        print(f"AI API Error: {e}")
        return {
            "urgency_level": "Yellow",
            "suggested_specialty": "General Practice",
            "possible_causes": ["Unable to analyze at this time. Please consult a doctor for an accurate assessment."],
            "precautions": ["Keep the area clean.", "Do not apply harsh chemicals.", "Seek professional medical evaluation."],
            "watch_out_symptoms": ["Severe pain", "Spreading redness", "Fever"]
        }