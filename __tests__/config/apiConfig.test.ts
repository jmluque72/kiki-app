import { vi } from 'vitest';
import { Platform } from 'react-native';
import { 
  getApiBaseUrlLocal, 
  getApiBaseUrl, 
  API_BASE_URL, 
  API_PATH, 
  API_FULL_URL,
  API_TIMEOUT,
  DEFAULT_HEADERS
} from '../../src/config/apiConfig';

// Mock de React Native Platform
vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('apiConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApiBaseUrlLocal', () => {
    it('debe retornar URL local para iOS', () => {
      const result = getApiBaseUrlLocal();
      expect(result).toBe('http://192.168.68.103:3000');
    });

    it('debe retornar URL local para Android', () => {
      // Cambiar el mock a Android
      vi.doMock('react-native', () => ({
        Platform: {
          OS: 'android',
        },
      }));
      
      // Re-importar la función para obtener el nuevo comportamiento
      const { getApiBaseUrlLocal: getApiBaseUrlLocalAndroid } = require('../../src/config/apiConfig');
      const result = getApiBaseUrlLocalAndroid();
      expect(result).toBe('http://192.168.68.103:3000');
    });
  });

  describe('getApiBaseUrl', () => {
    it('debe retornar URL de producción para iOS', () => {
      const result = getApiBaseUrl();
      expect(result).toBe('https://api.kiki.com.ar');
    });

    it('debe retornar URL de producción para Android', () => {
      // Cambiar el mock a Android
      vi.doMock('react-native', () => ({
        Platform: {
          OS: 'android',
        },
      }));
      
      // Re-importar la función para obtener el nuevo comportamiento
      const { getApiBaseUrl: getApiBaseUrlAndroid } = require('../../src/config/apiConfig');
      const result = getApiBaseUrlAndroid();
      expect(result).toBe('https://api.kiki.com.ar');
    });
  });

  describe('Constantes de configuración', () => {
    it('debe exportar API_BASE_URL correctamente', () => {
      expect(API_BASE_URL).toBe('https://api.kiki.com.ar');
    });

    it('debe exportar API_PATH correctamente', () => {
      expect(API_PATH).toBe('/api');
    });

    it('debe exportar API_FULL_URL correctamente', () => {
      expect(API_FULL_URL).toBe('https://api.kiki.com.ar/api');
    });

    it('debe exportar API_TIMEOUT correctamente', () => {
      expect(API_TIMEOUT).toBe(10000);
    });

    it('debe exportar DEFAULT_HEADERS correctamente', () => {
      expect(DEFAULT_HEADERS).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('Detección de emulador', () => {
    it('debe detectar correctamente el entorno', () => {
      // La función isEmulator está interna, pero podemos probar su comportamiento
      // indirectamente a través de las funciones que la utilizan
      const localUrl = getApiBaseUrlLocal();
      const prodUrl = getApiBaseUrl();
      
      // En desarrollo, la URL local debe ser diferente a la de producción
      expect(localUrl).not.toBe(prodUrl);
    });
  });
});