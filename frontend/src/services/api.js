import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/triage/analyze/';

export const analyzeSymptoms = async (imageFile, symptomsText) => {
  const formData = new FormData();
  if (imageFile) formData.append('image', imageFile);
  formData.append('symptoms', symptomsText);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to connect to the server.');
  }
};