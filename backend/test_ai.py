# test_ai.py
import os
from dotenv import load_dotenv

# Load the API key from .env
load_dotenv()

# Import our new AI function
from ai_service import analyze_symptoms

def run_test():
    print("Loading image...")
    try:
        with open("test.jpg", "rb") as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print("Error: Could not find 'test.jpg' in the backend folder.")
        return

    text_description = "I have a red, itchy rash on my arm that started yesterday after hiking. It looks like small blisters."
    
    print("Sending to Gemini 2.5 Flash... (Waiting for JSON response)")
    
    # Call the AI
    result = analyze_symptoms(image_bytes, "image/jpeg", text_description)
    
    print("\n--- AI RESPONSE ---")
    import json
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    run_test()