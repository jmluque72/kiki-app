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
export const getApiBaseUrlLoca = () => {
  // Para desarrollo, usar la IP de la máquina de desarrollo
  // En emulador Android: 10.0.2.2
  // En emulador iOS: localhost
  // En dispositivo físico: IP de la máquina de desarrollo
  
  if (Platform.OS === 'android') {
    // Para emulador Android - usar 10.0.2.2 que es la IP del host desde el emulador
    return __DEV__ ? 'http://192.168.68.113:3000' : 'https://api.kiki.com.ar';
  } else if (Platform.OS === 'ios') {
    // Para emulador iOS o dispositivo físico iOS
    return __DEV__ ? 'http://192.168.68.113:3000' : 'https://api.kiki.com.ar';
  }
  
  // Fallback
  return __DEV__ ? 'http://192.168.68.113' : 'https://api.kiki.com.ar';
};


// Configuración base del API
export const getApiBaseUrl = () => {
  // Para desarrollo, usar la IP de la máquina de desarrollo
  // En emulador Android: 10.0.2.2
  // En emulador iOS: localhost
  // En dispositivo físico: IP de la máquina de desarrollo
  
  if (Platform.OS === 'android') {
    // Para emulador Android
    return 'https://api.kiki.com.ar';
  } else if (Platform.OS === 'ios') {
    // Para emulador iOS o dispositivo físico iOS
    return 'https://api.kiki.com.ar';
  }
  
  // Fallback
  return 'https://api.kiki.com.ar';
};


// URL base del servidor
export const API_BASE_URL = getApiBaseUrl();

// Ruta base del API
export const API_PATH = '/api';

// URL completa del API (base + path)
export const API_FULL_URL = `${API_BASE_URL}${API_PATH}`;

// Configuración de timeout (30 segundos para operaciones que requieren múltiples consultas a la DB)
export const API_TIMEOUT = 30000;

// Timeout extendido para operaciones de upload de archivos grandes (videos, etc.)
export const API_UPLOAD_TIMEOUT = 300000; // 5 minutos para uploads

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Configuración exportada para usar en api.ts 