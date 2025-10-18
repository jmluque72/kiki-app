import { apiClient } from './api';

export interface LegacyLoginResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class LegacyAuthService {
  /**
   * Login directo usando el endpoint legacy (bypass temporal)
   */
  static async login(email: string, password: string): Promise<LegacyLoginResult> {
    try {
      console.log('🔐 [LegacyAuth] Iniciando login legacy para:', email);
      
      // Usar endpoint directo con headers especiales para bypass
      const response = await apiClient.post('/users/login', {
        email,
        password,
        bypassCognito: true, // Flag temporal para bypass
        developmentMode: true // Flag de desarrollo
      }, {
        headers: {
          'X-Development-Mode': 'true',
          'X-Bypass-Cognito': 'true'
        }
      });

      if (response.data.success) {
        console.log('✅ [LegacyAuth] Login exitoso con método legacy');
        
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token,
          activeAssociation: response.data.data.activeAssociation,
          associations: response.data.data.associations || []
        };
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }
    } catch (error: any) {
      console.error('❌ [LegacyAuth] Error en login:', error);
      console.error('❌ [LegacyAuth] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data
      });
      
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login'
      };
    }
  }
}

export default LegacyAuthService;
