import { apiClient } from './api';

export interface RealAuthResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class RealAuthService {
  /**
   * Login con datos reales de la base de datos
   */
  static async login(email: string, password: string): Promise<RealAuthResult> {
    try {
      console.log('🔐 [RealAuth] Iniciando login con datos reales para:', email);
      
      // Estrategia 1: Usar endpoint de login real
      try {
        console.log('🔧 [RealAuth] Estrategia 1: Login real con bypass de Cognito...');
        const response = await apiClient.post('/users/login', {
          email,
          password,
          bypassCognito: true,
          useRealData: true
        }, {
          headers: {
            'X-Bypass-Cognito': 'true',
            'X-Use-Real-Data': 'true'
          }
        });

        if (response.data.success) {
          console.log('✅ [RealAuth] Login exitoso con datos reales');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [RealAuth] Estrategia 1 falló:', error.message);
      }

      // Estrategia 2: Usar endpoint de desarrollo con datos reales
      try {
        console.log('🔧 [RealAuth] Estrategia 2: Endpoint de desarrollo con datos reales...');
        const response = await apiClient.post('/dev/login-real', {
          email,
          password,
          devMode: true,
          useRealData: true
        });

        if (response.data.success) {
          console.log('✅ [RealAuth] Login exitoso con endpoint de desarrollo');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [RealAuth] Estrategia 2 falló:', error.message);
      }

      // Estrategia 3: Usar endpoint de admin con datos reales
      try {
        console.log('🔧 [RealAuth] Estrategia 3: Endpoint de admin con datos reales...');
        const response = await apiClient.post('/admin/login-real', {
          email,
          password,
          adminMode: true,
          useRealData: true
        });

        if (response.data.success) {
          console.log('✅ [RealAuth] Login exitoso con endpoint de admin');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [RealAuth] Estrategia 3 falló:', error.message);
      }

      // Si todas las estrategias fallan
      throw new Error('Todas las estrategias de login real fallaron');

    } catch (error: any) {
      console.error('❌ [RealAuth] Error en login real:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login real'
      };
    }
  }
}

export default RealAuthService;
