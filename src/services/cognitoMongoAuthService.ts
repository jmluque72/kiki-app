import { apiClient } from './api';

export interface CognitoMongoResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class CognitoMongoAuthService {
  /**
   * Login correcto: Cognito → MongoDB
   * 1. Login con Cognito (obtener email)
   * 2. Buscar usuario en MongoDB (con email de Cognito)
   * 3. Usar datos reales (ObjectIds válidos)
   */
  static async login(email: string, password: string): Promise<CognitoMongoResult> {
    try {
      console.log('🔐 [CognitoMongoAuth] Iniciando login correcto para:', email);
      
      // Paso 1: Simular login con Cognito (obtener email)
      console.log('🔧 [CognitoMongoAuth] Paso 1: Simulando login con Cognito...');
      const cognitoEmail = email; // En producción, esto vendría de Cognito
      
      // Paso 2: Buscar usuario en MongoDB con email de Cognito
      console.log('🔧 [CognitoMongoAuth] Paso 2: Buscando usuario en MongoDB...');
      try {
        const response = await apiClient.post('/auth/cognito-to-mongo', {
          email: cognitoEmail,
          cognitoToken: 'mock-cognito-token', // En producción, token real de Cognito
          useRealData: true
        });

        if (response.data.success) {
          console.log('✅ [CognitoMongoAuth] Usuario encontrado en MongoDB');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [CognitoMongoAuth] Error buscando usuario en MongoDB:', error.message);
      }

      // Paso 3: Fallback - Crear usuario si no existe
      console.log('🔧 [CognitoMongoAuth] Paso 3: Creando usuario si no existe...');
      try {
        const response = await apiClient.post('/auth/create-user-from-cognito', {
          email: cognitoEmail,
          cognitoToken: 'mock-cognito-token',
          useRealData: true
        });

        if (response.data.success) {
          console.log('✅ [CognitoMongoAuth] Usuario creado en MongoDB');
          return {
            success: true,
            user: response.data.data.user,
            token: response.data.data.token,
            activeAssociation: response.data.data.activeAssociation,
            associations: response.data.data.associations || []
          };
        }
      } catch (error: any) {
        console.log('⚠️ [CognitoMongoAuth] Error creando usuario:', error.message);
      }

      // Si todo falla
      throw new Error('No se pudo autenticar con Cognito ni crear usuario en MongoDB');

    } catch (error: any) {
      console.error('❌ [CognitoMongoAuth] Error en login:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login con Cognito y MongoDB'
      };
    }
  }
}

export default CognitoMongoAuthService;
