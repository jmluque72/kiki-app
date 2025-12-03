import { Platform } from 'react-native';
import Config from 'react-native-config';

type ApiEnv = 'local' | 'uat' | 'prod';

// Elegir entorno a partir de variable de entorno o del modo (__DEV__)
const API_ENV: ApiEnv =
  (Config.API_ENV as ApiEnv) || (__DEV__ ? 'local' : 'prod');

// Valores por defecto (se pueden sobreescribir desde .env)
const API_BASE_URL_LOCAL =
  Config.API_BASE_URL_LOCAL || 'http://192.168.68.113:3000';
const API_BASE_URL_UAT =
  Config.API_BASE_URL_UAT || 'https://uat-api.kiki.com.ar';
const API_BASE_URL_PROD =
  Config.API_BASE_URL_PROD || 'https://api.kiki.com.ar';

const API_BASE_URLS: Record<ApiEnv, string> = {
  local: API_BASE_URL_LOCAL,
  uat: API_BASE_URL_UAT,
  prod: API_BASE_URL_PROD,
};

// Configuración base del API, en función del entorno
export const getApiBaseUrl = () => {
  // Si en algún caso necesitas tratar distinto Android/iOS (por ejemplo usar 10.0.2.2),
  // puedes ramificar aquí usando Platform.OS, pero respetando siempre API_ENV.
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return API_BASE_URLS[API_ENV];
  }

  // Fallback (otros plataformas)
  return API_BASE_URLS[API_ENV];
};


// Configuración base del API
export const getApiBaseUrlRemote = () => {
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