// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8081/api'; // Порт твоего бэкенда

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматически добавляем токен к каждому запросу, если он есть в localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;