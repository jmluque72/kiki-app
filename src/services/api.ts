import axios from 'axios';
import AsyncStorage from '../utils/storage';
import { API_FULL_URL, API_TIMEOUT, API_UPLOAD_TIMEOUT, DEFAULT_HEADERS } from '../config/apiConfig';
import RefreshTokenService from './refreshTokenService';

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: API_FULL_URL,
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
    
    // Si el data es FormData, NO establecer Content-Type (axios lo hará automáticamente con el boundary)
    // Esto es crítico para uploads de archivos
    // En React Native, FormData puede no ser una instancia estándar, así que verificamos de múltiples formas
    const isFormData = config.data instanceof FormData || 
                       (config.data && typeof config.data === 'object' && 
                        (config.data.constructor?.name === 'FormData' || 
                         config.data._parts || 
                         config.data.append));
    
    if (isFormData) {
      // Eliminar Content-Type para que axios lo establezca automáticamente con el boundary correcto
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      
      // Si es un endpoint de upload y no se especificó timeout, usar el timeout extendido
      const isUploadEndpoint = config.url?.includes('/upload/');
      if (isUploadEndpoint) {
        if (!config.timeout || config.timeout === API_TIMEOUT) {
          config.timeout = API_UPLOAD_TIMEOUT;
          console.log(`📤 [API] FormData detectado en endpoint de upload, timeout extendido a ${API_UPLOAD_TIMEOUT}ms (${API_UPLOAD_TIMEOUT / 1000}s)`);
        } else {
          console.log(`📤 [API] FormData detectado en endpoint de upload, timeout personalizado: ${config.timeout}ms (${config.timeout / 1000}s)`);
        }
      } else {
        console.log('📤 [API] FormData detectado, Content-Type será establecido automáticamente por axios');
      }
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

// Interceptor para manejar errores de respuesta con refresh automático
apiClient.interceptors.response.use(
  (response) => {
    // Verificar si el servidor envió un nuevo token
    const newToken = response.headers['x-new-access-token'];
    if (newToken) {
      console.log('🔄 [API] Nuevo access token recibido del servidor');
      setAuthToken(newToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Solo manejar refresh automático para errores 401 en endpoints autenticados
    // No interferir con errores de login (que también devuelven 401)
    if (error.response?.status === 401 && 
        error.config?.url !== '/users/login' && 
        error.config?.url !== '/auth/refresh' &&
        !originalRequest._retry) {
      
      console.log('🔄 [API] Token expirado, intentando refresh automático...');
      
      try {
        // Marcar la request como retry para evitar loops
        originalRequest._retry = true;
        
        // Intentar refresh del token
        const newAccessToken = await RefreshTokenService.refreshAccessToken();
        
        if (newAccessToken) {
          console.log('✅ [API] Token renovado exitosamente');
          
          // Actualizar el token en la request original
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          setAuthToken(newAccessToken);
          
          // Reintentar la request original
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ [API] Error en refresh automático:', refreshError);
        
        // Si el refresh falla, hacer logout
        console.log('🔐 [API] Refresh falló - Redirigiendo al login');
        
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