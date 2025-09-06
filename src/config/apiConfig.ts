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
    return 'http://192.168.68.102:3000';
  } else if (Platform.OS === 'ios') {
    // Para emulador iOS o dispositivo físico iOS
    return 'http://192.168.68.102:3000';
  }
  
  // Fallback
  return 'http://192.168.68.102:3000';
};


// Configuración base del API
export const getApiBaseUrlServer = () => {
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

// Configuración de timeout
export const API_TIMEOUT = 10000;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Configuración exportada para usar en api.ts 