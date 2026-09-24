import axios from 'axios';

export const API_BASE_URL = 'https://javacontrolproyectosapi2026.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});
