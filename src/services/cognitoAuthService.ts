import { cognitoConfig } from '../config/cognitoConfig';
import { apiClient } from './api';

export interface CognitoUser {
  email: string;
  name: string;
  cognitoId: string;
  groups: string[];
}

export interface CognitoAuthResult {
  user: CognitoUser;
  token: string;
  isCognitoUser: boolean;
}

export class CognitoAuthService {
  /**
   * Autenticar usuario con Cognito usando fetch directo
   */
  static async login(email: string, password: string): Promise<CognitoAuthResult> {
    try {
      console.log('🔐 [CognitoAuth] Iniciando login con Cognito para:', email);
      
      // Usar fetch directo a la API de Cognito
      const response = await fetch(`https://cognito-idp.${cognitoConfig.region}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: cognitoConfig.userPoolClientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password
          }
        })
      });
      
      const data = await response.json();
      
      if (data.AuthenticationResult?.IdToken) {
        console.log('✅ [CognitoAuth] Usuario autenticado con Cognito');
        
        const idToken = data.AuthenticationResult.IdToken;
        const accessToken = data.AuthenticationResult.AccessToken;
        
        // Extraer grupos de Cognito del token
        const groups = this.extractGroupsFromToken(idToken);
        
        const cognitoUser: CognitoUser = {
          email: email,
          name: email,
          cognitoId: email,
          groups: groups
        };
        
        console.log('👤 [CognitoAuth] Usuario de Cognito:', cognitoUser);
        console.log('🔑 [CognitoAuth] Token obtenido:', idToken.substring(0, 20) + '...');
        
        return {
          user: cognitoUser,
          token: idToken,
          isCognitoUser: true
        };
      } else {
        throw new Error(data.message || 'No se pudo obtener el token de Cognito');
      }
    } catch (error: any) {
      console.error('❌ [CognitoAuth] Error en login:', error);
      console.error('❌ [CognitoAuth] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
      
      // Proporcionar mensaje de error más específico
      let errorMessage = 'Error al autenticar con Cognito';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Cerrar sesión en Cognito (simplificado)
   */
  static async logout(): Promise<void> {
    try {
      console.log('🔐 [CognitoAuth] Cerrando sesión en Cognito');
      // Con AWS SDK v3, simplemente limpiamos el token local
      console.log('✅ [CognitoAuth] Sesión cerrada en Cognito');
    } catch (error: any) {
      console.error('❌ [CognitoAuth] Error al cerrar sesión:', error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  }
  
  /**
   * Obtener usuario actual de Cognito (simplificado)
   */
  static async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      // Con AWS SDK v3, no podemos obtener el usuario actual sin token
      // Esto se manejará en el AuthContext
      return null;
    } catch (error) {
      console.log('ℹ️ [CognitoAuth] No hay usuario autenticado en Cognito');
      return null;
    }
  }
  
  /**
   * Verificar si hay una sesión activa en Cognito (simplificado)
   */
  static async hasActiveSession(): Promise<boolean> {
    try {
      // Con AWS SDK v3, esto se manejará en el AuthContext
      return false;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Extraer grupos de Cognito del token JWT
   */
  private static extractGroupsFromToken(token: string): string[] {
    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['cognito:groups'] || [];
    } catch (error) {
      console.error('❌ [CognitoAuth] Error extrayendo grupos del token:', error);
      return [];
    }
  }
  
  /**
   * Obtener token de acceso actual (simplificado)
   */
  static async getCurrentToken(): Promise<string | null> {
    try {
      // Con AWS SDK v3, esto se manejará en el AuthContext
      return null;
    } catch (error) {
      console.error('❌ [CognitoAuth] Error obteniendo token:', error);
      return null;
    }
  }
}

export default CognitoAuthService;
