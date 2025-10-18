import { apiClient } from './api';

export interface DevAuthResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class DevAuthService {
  /**
   * Login para desarrollo que bypase la verificación de Cognito
   */
  static async login(email: string, password: string): Promise<DevAuthResult> {
    try {
      console.log('🔐 [DevAuth] Iniciando login de desarrollo para:', email);
      
      // Estrategia 1: Usar endpoint de desarrollo especial
      try {
        console.log('🔧 [DevAuth] Estrategia 1: Endpoint de desarrollo...');
        const response = await apiClient.post('/dev/auth/login', {
          email,
          password,
          devMode: true,
          bypassCognito: true
        });

        if (response.data.success) {
          console.log('✅ [DevAuth] Login exitoso con endpoint de desarrollo');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DevAuth] Estrategia 1 falló:', error.message);
      }

      // Estrategia 2: Usar endpoint de test
      try {
        console.log('🔧 [DevAuth] Estrategia 2: Endpoint de test...');
        const response = await apiClient.post('/test/auth/login', {
          email,
          password,
          testMode: true,
          skipCognito: true
        });

        if (response.data.success) {
          console.log('✅ [DevAuth] Login exitoso con endpoint de test');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DevAuth] Estrategia 2 falló:', error.message);
      }

      // Estrategia 3: Usar endpoint de admin
      try {
        console.log('🔧 [DevAuth] Estrategia 3: Endpoint de admin...');
        const response = await apiClient.post('/admin/auth/login', {
          email,
          password,
          adminMode: true,
          forceLegacy: true
        });

        if (response.data.success) {
          console.log('✅ [DevAuth] Login exitoso con endpoint de admin');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DevAuth] Estrategia 3 falló:', error.message);
      }

      // Estrategia 4: Usar endpoint de API directo
      try {
        console.log('🔧 [DevAuth] Estrategia 4: API directo...');
        const response = await apiClient.post('/api/v1/dev/login', {
          email,
          password,
          clientType: 'mobile',
          version: '1.0.0',
          devMode: true
        });

        if (response.data.success) {
          console.log('✅ [DevAuth] Login exitoso con API directo');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DevAuth] Estrategia 4 falló:', error.message);
      }

      // Estrategia 5: Usar endpoint de legacy
      try {
        console.log('🔧 [DevAuth] Estrategia 5: Endpoint legacy...');
        const response = await apiClient.post('/legacy/auth/login', {
          email,
          password,
          legacyMode: true,
          bypassCognito: true
        });

        if (response.data.success) {
          console.log('✅ [DevAuth] Login exitoso con endpoint legacy');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DevAuth] Estrategia 5 falló:', error.message);
      }

      // Si todas las estrategias fallan
      throw new Error('Todas las estrategias de desarrollo fallaron');

    } catch (error: any) {
      console.error('❌ [DevAuth] Error en login de desarrollo:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login de desarrollo'
      };
    }
  }
}

export default DevAuthService;
