import axios from 'axios';

const BASE_URL = 'https://triageai-medical-pre-screening.onrender.com/api/triage/';

// 1. UPDATED: Now sends the token if the user is logged in
export const analyzeSymptoms = async (imageFile, symptomsText) => {
  const formData = new FormData();
  if (imageFile) formData.append('image', imageFile);
  formData.append('symptoms', symptomsText);

  // Check for token to authenticate the request
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'multipart/form-data' };
  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.post(`${BASE_URL}analyze/`, formData, { headers });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to connect to the server.');
  }
};

// 2. NEW: Fetch User History
export const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token found");

    const response = await axios.get(`${BASE_URL}history/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};