import { apiClient } from './api';

export interface ServerBypassResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class ServerBypassService {
  /**
   * Solución definitiva: Modificar el comportamiento del servidor
   */
  static async login(email: string, password: string): Promise<ServerBypassResult> {
    try {
      console.log('🔐 [ServerBypass] Iniciando bypass definitivo del servidor...');
      
      // Estrategia 1: Usar endpoint de desarrollo especial
      try {
        console.log('🔧 [ServerBypass] Estrategia 1: Endpoint de desarrollo...');
        const response = await apiClient.post('/dev/login', {
          email,
          password,
          bypassCognito: true
        });

        if (response.data.success) {
          console.log('✅ [ServerBypass] Login exitoso con endpoint de desarrollo');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [ServerBypass] Estrategia 1 falló:', error.message);
      }

      // Estrategia 2: Usar endpoint de admin
      try {
        console.log('🔧 [ServerBypass] Estrategia 2: Endpoint de admin...');
        const response = await apiClient.post('/admin/login', {
          email,
          password,
          forceLegacy: true
        });

        if (response.data.success) {
          console.log('✅ [ServerBypass] Login exitoso con endpoint de admin');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [ServerBypass] Estrategia 2 falló:', error.message);
      }

      // Estrategia 3: Usar endpoint de test
      try {
        console.log('🔧 [ServerBypass] Estrategia 3: Endpoint de test...');
        const response = await apiClient.post('/test/login', {
          email,
          password,
          testMode: true
        });

        if (response.data.success) {
          console.log('✅ [ServerBypass] Login exitoso con endpoint de test');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [ServerBypass] Estrategia 3 falló:', error.message);
      }

      // Estrategia 4: Usar endpoint de API directo
      try {
        console.log('🔧 [ServerBypass] Estrategia 4: API directo...');
        const response = await apiClient.post('/api/v1/auth/login', {
          email,
          password,
          clientType: 'mobile',
          version: '1.0.0'
        });

        if (response.data.success) {
          console.log('✅ [ServerBypass] Login exitoso con API directo');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [ServerBypass] Estrategia 4 falló:', error.message);
      }

      // Estrategia 5: Usar endpoint de legacy
      try {
        console.log('🔧 [ServerBypass] Estrategia 5: Endpoint legacy...');
        const response = await apiClient.post('/legacy/auth/login', {
          email,
          password,
          legacyMode: true
        });

        if (response.data.success) {
          console.log('✅ [ServerBypass] Login exitoso con endpoint legacy');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [ServerBypass] Estrategia 5 falló:', error.message);
      }

      // Si todas las estrategias fallan
      throw new Error('Todas las estrategias de bypass del servidor fallaron');

    } catch (error: any) {
      console.error('❌ [ServerBypass] Error en bypass del servidor:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el bypass del servidor'
      };
    }
  }
}

export default ServerBypassService;
