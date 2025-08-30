import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS } from '../config/apiConfig';

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// Variable global para almacenar el token actual
let currentToken: string | null = null;

// Función para establecer el token actual
export const setAuthToken = (token: string | null) => {
  currentToken = token;
};

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Usar el token actual si está disponible
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable global para almacenar la función de logout
let globalLogout: (() => Promise<void>) | null = null;

// Función para establecer la función de logout global
export const setGlobalLogout = (logoutFunction: () => Promise<void>) => {
  globalLogout = logoutFunction;
};

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log('🔐 Token expirado o inválido - Redirigiendo al login');
      
      // Limpiar el token actual
      setAuthToken(null);
      
      // Llamar a la función de logout global si está disponible
      if (globalLogout) {
        try {
          await globalLogout();
        } catch (logoutError) {
          console.error('Error durante logout automático:', logoutError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Tipos de respuesta del API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Tipos de cuenta
export interface Account {
  _id: string;
  nombre: string;
  razonSocial: string;
}

// Tipos de usuario
export interface User {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  status: string;
}

// Tipos para registro mobile
export interface RegisterMobileRequest {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
}

export interface RegisterMobileResponse {
  user: User;
  associationsCreated?: number;
  message?: string;
  // No incluir token ya que el registro mobile no debe loguear automáticamente
}

// Tipos para login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface Association {
  _id: string;
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
    activo: boolean;
  };
  division?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  student?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
  role?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  associations: Association[];
} 