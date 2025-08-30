import { Platform } from 'react-native';

// Detectar si estamos en emulador o dispositivo físico
const isEmulator = () => {
  if (Platform.OS === 'android') {
    // En Android, si estamos en emulador, usamos 10.0.2.2
    // En dispositivo físico, usamos la IP del servidor
    // Por ahora, usamos la IP de la red local para ambos casos
    return false; // Cambiado para usar IP de red local
  }
  return false;
};

// Configuración base del API
export const getApiBaseUrl = () => {
  // Para desarrollo, usar la IP de la máquina de desarrollo
  // En emulador Android: 10.0.2.2
  // En emulador iOS: localhost
  // En dispositivo físico: IP de la máquina de desarrollo
  
  if (Platform.OS === 'android') {
    // Para emulador Android
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // Para emulador iOS o dispositivo físico iOS
    return 'http://localhost:3000/api';
  }
  
  // Fallback
  return 'http://localhost:3000/api';
};

// URL base del API
export const API_BASE_URL = getApiBaseUrl();

// Configuración de timeout
export const API_TIMEOUT = 10000;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Importar axios
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient; 