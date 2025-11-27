import { apiClient } from './api';

export interface HybridLoginResult {
  success: boolean;
  user: any;
  accessToken: string;
  refreshToken: string;
  tokenExpiresIn: number;
  activeAssociation?: any;
  associations?: any[];
  isCognitoUser?: boolean;
  error?: string;
}

export class HybridAuthService {
  /**
   * Login simple contra MongoDB (como estaba antes)
   */
  static async login(email: string, password: string): Promise<HybridLoginResult> {
    try {
      console.log('🔐 [HybridAuth] Iniciando login simple contra MongoDB para:', email);
      
      // Login simple contra MongoDB (como estaba antes)
      const response = await apiClient.post('/users/login', {
        email,
        password
      });

            if (response.data.success) {
              console.log('✅ [HybridAuth] Login exitoso contra MongoDB');
              const { 
                user: userData, 
                accessToken: newToken, 
                refreshToken: newRefreshToken,
                tokenExpiresIn,
                activeAssociation: activeAssociationData, 
                associations: userAssociations 
              } = response.data.data;
              
              return {
                success: true,
                user: userData,
                accessToken: newToken,
                refreshToken: newRefreshToken,
                tokenExpiresIn: tokenExpiresIn,
                activeAssociation: activeAssociationData,
                associations: userAssociations || [],
                isCognitoUser: false
              };
      } else {
        console.error('❌ [HybridAuth] Login falló:', response.data.message);
        return {
          success: false,
          user: null,
          accessToken: '',
          refreshToken: '',
          tokenExpiresIn: 0,
          activeAssociation: null,
          associations: [],
          isCognitoUser: false,
          error: response.data.message || 'Error en el login'
        };
      }
    } catch (error: any) {
      console.error('❌ [HybridAuth] Error en login:', error);
      console.error('❌ [HybridAuth] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // IGNORAR errores 429 (rate limiting deshabilitado en servidor)
      // Si recibimos un 429, es un error del proxy/load balancer o caché
      // Reintentar automáticamente después de un breve delay
      if (error.response?.status === 429) {
        console.log('⚠️ [HybridAuth] Error 429 detectado, reintentando automáticamente...');
        
        // Reintentar hasta 3 veces con backoff exponencial
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 1s, 2s, 4s (máx 5s)
          console.log(`⚠️ [HybridAuth] Reintento ${retryCount + 1}/${maxRetries} después de ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          try {
            const retryResponse = await apiClient.post('/users/login', {
              email,
              password
            });
            
            if (retryResponse.data.success) {
              console.log(`✅ [HybridAuth] Reintento ${retryCount + 1} exitoso después de 429`);
              const { 
                user: userData, 
                accessToken: newToken, 
                refreshToken: newRefreshToken,
                tokenExpiresIn,
                activeAssociation: activeAssociationData, 
                associations: userAssociations 
              } = retryResponse.data.data;
              
              return {
                success: true,
                user: userData,
                accessToken: newToken,
                refreshToken: newRefreshToken,
                tokenExpiresIn: tokenExpiresIn,
                activeAssociation: activeAssociationData,
                associations: userAssociations || [],
                isCognitoUser: false
              };
            }
          } catch (retryError: any) {
            console.log(`⚠️ [HybridAuth] Reintento ${retryCount + 1} falló:`, retryError.response?.status || retryError.message);
            
            // Si el error no es 429, no seguir reintentando
            if (retryError.response?.status !== 429) {
              console.log('⚠️ [HybridAuth] Error diferente a 429, deteniendo reintentos');
              break;
            }
          }
          
          retryCount++;
        }
        
        // Si todos los reintentos fallaron, retornar error genérico sin mencionar 429
        console.log('⚠️ [HybridAuth] Todos los reintentos fallaron, retornando error genérico');
        return {
          success: false,
          user: null,
          accessToken: '',
          refreshToken: '',
          tokenExpiresIn: 0,
          activeAssociation: null,
          associations: [],
          isCognitoUser: false,
          error: 'Error de conexión temporal. Por favor, intenta de nuevo.'
        };
      }
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error en el login';
      
      if (error.response?.status === 401) {
        // Error de autenticación (credenciales inválidas)
        errorMessage = error.response.data?.message || 'Credenciales inválidas';
      } else if (error.response?.status === 400) {
        // Error de validación
        errorMessage = error.response.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 429) {
        // Error 429 - NO debería llegar aquí porque se maneja arriba con reintentos
        // Pero por si acaso, mostrar mensaje genérico
        errorMessage = 'Error de conexión temporal. Por favor, intenta de nuevo.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        // Error de red
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        // Servidor no disponible
        errorMessage = 'Servidor no disponible. Intenta más tarde.';
      } else if (error.response?.data?.message) {
        // Error específico del servidor - pero ignorar mensajes de rate limiting
        const serverMessage = error.response.data.message;
        if (serverMessage.includes('Demasiadas solicitudes') || serverMessage.includes('Too many requests')) {
          errorMessage = 'Error de conexión temporal. Por favor, intenta de nuevo.';
        } else {
          errorMessage = serverMessage;
        }
      }
      
            return {
              success: false,
              user: null,
              accessToken: '',
              refreshToken: '',
              tokenExpiresIn: 0,
              activeAssociation: null,
              associations: [],
              isCognitoUser: false,
              error: errorMessage
            };
    }
  }

  /**
   * Logout simple (limpiar datos locales)
   */
  static async logout(): Promise<void> {
    try {
      console.log('🔐 [HybridAuth] Cerrando sesión simple...');
      
      // Limpiar datos locales (esto se hace en AuthContext)
      console.log('✅ [HybridAuth] Logout simple completado');
    } catch (error: any) {
      console.error('❌ [HybridAuth] Error en logout:', error);
      throw error;
    }
  }
}

export default HybridAuthService;