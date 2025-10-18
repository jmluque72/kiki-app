import { apiClient } from './api';

export interface DirectLoginResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class DirectAuthService {
  /**
   * Login directo usando el endpoint /users/login con estrategia de bypass
   */
  static async login(email: string, password: string): Promise<DirectLoginResult> {
    try {
      console.log('🔐 [DirectAuth] Iniciando login directo para:', email);
      
      // Estrategia 1: Intentar con headers especiales
      try {
        const response = await apiClient.post('/users/login', {
          email,
          password,
          forceLegacy: true,
          bypassCognito: true,
          developmentMode: true
        }, {
          headers: {
            'X-Force-Legacy': 'true',
            'X-Bypass-Cognito': 'true',
            'X-Development-Mode': 'true',
            'X-Client-Version': '1.0.0-dev'
          }
        });

        if (response.data.success) {
          console.log('✅ [DirectAuth] Login exitoso con headers especiales');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DirectAuth] Estrategia 1 falló:', error.message);
      }

      // Estrategia 2: Intentar con parámetros de query
      try {
        const response = await apiClient.post('/users/login?forceLegacy=true&bypassCognito=true', {
          email,
          password
        });

        if (response.data.success) {
          console.log('✅ [DirectAuth] Login exitoso con parámetros de query');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DirectAuth] Estrategia 2 falló:', error.message);
      }

      // Estrategia 3: Intentar con user-agent especial
      try {
        const response = await apiClient.post('/users/login', {
          email,
          password
        }, {
          headers: {
            'User-Agent': 'KikiApp-Development/1.0.0 (Bypass-Cognito)',
            'X-Client-Type': 'mobile-development'
          }
        });

        if (response.data.success) {
          console.log('✅ [DirectAuth] Login exitoso con user-agent especial');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [DirectAuth] Estrategia 3 falló:', error.message);
      }

      // Si todas las estrategias fallan
      throw new Error('Todas las estrategias de bypass fallaron');

    } catch (error: any) {
      console.error('❌ [DirectAuth] Error en login directo:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login directo'
      };
    }
  }
}

export default DirectAuthService;
