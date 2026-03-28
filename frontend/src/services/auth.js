import axios from 'axios';

const BASE_URL = 'https://triage-ai-api-2vlf.onrender.com/api/';

export const login = async (username, password) => {
    const response = await axios.post(`${BASE_URL}token/`, { username, password });
    if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
    }
    return response.data;
};

// src/services/auth.js
export const register = async (username, password, email) => {
    const response = await axios.post(`${BASE_URL}register/`, { username, password, email });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
};