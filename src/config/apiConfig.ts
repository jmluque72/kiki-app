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
    return 'http://192.168.68.103:3000/api';
  } else if (Platform.OS === 'ios') {
    // Para emulador iOS o dispositivo físico iOS
    return 'http://192.168.68.103:3000/api';
  }
  
  // Fallback
  return 'http://192.168.68.103:3000/api';
};

// URL base del API
export const API_BASE_URL = getApiBaseUrl();

// Configuración de timeout
export const API_TIMEOUT = 10000;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Configuración exportada para usar en api.ts 