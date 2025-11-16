import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MockLoginResult {
  success: boolean;
  user: any;
  token: string;
  activeAssociation?: any;
  associations?: any[];
  error?: string;
}

export class MockAuthService {
  /**
   * Generar ObjectId válido para MongoDB
   */
  private static generateObjectId(prefix: string): string {
    // Generar un ObjectId válido de 24 caracteres hexadecimales
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const random = Math.random().toString(16).substr(2, 8);
    const counter = Math.random().toString(16).substr(2, 6);
    
    // Crear un ObjectId válido
    const objectId = timestamp + random + counter;
    
    // Asegurar que tenga exactamente 24 caracteres
    return objectId.padEnd(24, '0').substr(0, 24);
  }

  /**
   * Codificar string a base64url (compatible con React Native)
   */
  private static base64UrlEncode(str: string): string {
    // Usar btoa si está disponible (navegador), sino usar alternativa
    if (typeof btoa !== 'undefined') {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
    
    // Alternativa para React Native
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    }
    
    // Remover padding
    const padding = str.length % 3;
    if (padding === 1) {
      result = result.slice(0, -2);
    } else if (padding === 2) {
      result = result.slice(0, -1);
    }
    
    return result;
  }

  /**
   * Generar JWT mock compatible con Cognito para desarrollo
   */
  private static generateMockJWT(email: string): string {
    // Header JWT compatible con Cognito
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: 'mock-key-id'
    };

    // Payload JWT compatible con Cognito
    const payload = {
      sub: 'mock-user-id-' + Date.now(),
      email: email,
      name: email.split('@')[0],
      'cognito:username': email,
      'cognito:groups': ['coordinador'],
      iss: 'https://cognito-idp.us-east-1.amazonaws.com/mock-user-pool-id',
      aud: 'mock-client-id',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 horas
      iat: Math.floor(Date.now() / 1000),
      jti: 'mock-jti-' + Date.now(),
      token_use: 'access',
      scope: 'aws.cognito.signin.user.admin',
      auth_time: Math.floor(Date.now() / 1000)
    };

    // Codificar header y payload en base64url (compatible con React Native)
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    // Crear firma mock (no es una firma real, pero tiene el formato correcto)
    const signature = this.base64UrlEncode('mock-signature-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));

    // Combinar las tres partes
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Login simulado para desarrollo (bypass completo del servidor)
   */
  static async login(email: string, password: string): Promise<MockLoginResult> {
    try {
      console.log('🔐 [MockAuth] Iniciando login simulado para:', email);
      
      // Simular validación de credenciales
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Simular usuario de desarrollo con ObjectIds válidos
      const mockUser = {
        _id: MockAuthService.generateObjectId('user'),
        name: email.split('@')[0],
        email: email,
        role: {
          _id: MockAuthService.generateObjectId('role'),
          nombre: 'coordinador',
          descripcion: 'Coordinador de la institución'
        },
        isFirstLogin: false,
        isCognitoUser: false
      };

      // Simular token simple para desarrollo (sin JWT complejo)
      const mockToken = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // Simular asociación activa con ObjectIds válidos
      const mockActiveAssociation = {
        _id: MockAuthService.generateObjectId('association'),
        account: {
          _id: MockAuthService.generateObjectId('account'),
          nombre: 'La Salle',
          razonSocial: 'Instituto La Salle'
        },
        division: {
          _id: MockAuthService.generateObjectId('division'),
          nombre: 'Primaria',
          descripcion: 'División de Primaria'
        },
        student: {
          _id: MockAuthService.generateObjectId('student'),
          nombre: 'Estudiante',
          apellido: 'Ejemplo',
          avatar: null
        },
        role: {
          _id: MockAuthService.generateObjectId('role'),
          nombre: 'coordinador',
          descripcion: 'Coordinador de la institución'
        },
        status: 'active'
      };

      // Simular asociaciones
      const mockAssociations = [mockActiveAssociation];

      console.log('✅ [MockAuth] Login simulado exitoso');
      console.log('👤 [MockAuth] Usuario simulado:', {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role.nombre
      });

      return {
        success: true,
        user: mockUser,
        token: mockToken,
        activeAssociation: mockActiveAssociation,
        associations: mockAssociations
      };

    } catch (error: any) {
      console.error('❌ [MockAuth] Error en login simulado:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        error: error.message || 'Error en el login simulado'
      };
    }
  }

  /**
   * Guardar datos simulados en AsyncStorage
   */
  static async saveMockData(user: any, token: string, activeAssociation: any, associations: any[]): Promise<void> {
    try {
      // Solo guardar el token si no es null o undefined
      if (token) {
        await AsyncStorage.setItem('auth_token', token);
      } else {
        console.warn('⚠️ [MockAuth] Token es null/undefined, no se guardará');
        await AsyncStorage.removeItem('auth_token');
      }
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_active_association', JSON.stringify(activeAssociation));
      await AsyncStorage.setItem('auth_associations', JSON.stringify(associations));
      console.log('✅ [MockAuth] Datos simulados guardados en AsyncStorage');
    } catch (error) {
      console.error('❌ [MockAuth] Error guardando datos simulados:', error);
    }
  }

  /**
   * Limpiar datos simulados
   */
  static async clearMockData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      await AsyncStorage.removeItem('auth_active_association');
      await AsyncStorage.removeItem('auth_associations');
      console.log('✅ [MockAuth] Datos simulados limpiados');
    } catch (error) {
      console.error('❌ [MockAuth] Error limpiando datos simulados:', error);
    }
  }
}

export default MockAuthService;
