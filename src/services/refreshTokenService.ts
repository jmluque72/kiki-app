import AsyncStorage from '../utils/storage';
import { apiClient } from './api';

export interface RefreshTokenData {
  accessToken: string;
  refreshToken: string;
  tokenExpiresIn: number;
  expiresAt: number;
}

export class RefreshTokenService {
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly TOKEN_EXPIRES_KEY = 'tokenExpiresAt';
  
  private static refreshPromise: Promise<string> | null = null;

  /**
   * Guardar tokens después del login
   */
  static async saveTokens(tokenData: RefreshTokenData): Promise<void> {
    try {
      // Validar que los tokens no sean null o undefined
      if (!tokenData.accessToken || !tokenData.refreshToken) {
        throw new Error('Access token o refresh token es null/undefined');
      }
      
      const expiresAt = Date.now() + (tokenData.tokenExpiresIn * 1000);
      
      await AsyncStorage.multiSet([
        [this.ACCESS_TOKEN_KEY, tokenData.accessToken],
        [this.REFRESH_TOKEN_KEY, tokenData.refreshToken],
        [this.TOKEN_EXPIRES_KEY, expiresAt.toString()]
      ]);
      
      console.log('💾 [REFRESH TOKEN] Tokens guardados exitosamente');
      console.log('⏰ [REFRESH TOKEN] Token expira en:', new Date(expiresAt).toISOString());
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error guardando tokens:', error);
      throw error;
    }
  }

  /**
   * Obtener access token actual
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error obteniendo access token:', error);
      return null;
    }
  }

  /**
   * Obtener refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Verificar si el token está próximo a expirar (5 minutos antes)
   */
  static async isTokenExpiringSoon(): Promise<boolean> {
    try {
      const expiresAtStr = await AsyncStorage.getItem(this.TOKEN_EXPIRES_KEY);
      if (!expiresAtStr) return true;
      
      const expiresAt = parseInt(expiresAtStr);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutos en ms
      
      return (expiresAt - now) <= fiveMinutes;
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error verificando expiración:', error);
      return true;
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  static async refreshAccessToken(): Promise<string> {
    // Evitar múltiples llamadas simultáneas
    if (this.refreshPromise) {
      console.log('🔄 [REFRESH TOKEN] Refresh ya en progreso, esperando...');
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async _performRefresh(): Promise<string> {
    try {
      console.log('🔄 [REFRESH TOKEN] Iniciando refresh de token...');
      
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken, tokenExpiresIn } = response.data.data;
        
        // Actualizar tokens en AsyncStorage
        const expiresAt = Date.now() + (tokenExpiresIn * 1000);
        await AsyncStorage.multiSet([
          [this.ACCESS_TOKEN_KEY, accessToken],
          [this.TOKEN_EXPIRES_KEY, expiresAt.toString()]
        ]);
        
        console.log('✅ [REFRESH TOKEN] Token renovado exitosamente');
        console.log('⏰ [REFRESH TOKEN] Nuevo token expira en:', new Date(expiresAt).toISOString());
        
        return accessToken;
      } else {
        throw new Error(response.data.message || 'Error renovando token');
      }
    } catch (error: any) {
      console.error('❌ [REFRESH TOKEN] Error en refresh:', error);
      
      // Si el refresh falla, limpiar tokens
      await this.clearTokens();
      throw error;
    }
  }

  /**
   * Limpiar todos los tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.TOKEN_EXPIRES_KEY
      ]);
      
      console.log('🧹 [REFRESH TOKEN] Tokens limpiados');
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error limpiando tokens:', error);
    }
  }

  /**
   * Revocar refresh token (logout)
   */
  static async revokeRefreshToken(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.log('⚠️ [REFRESH TOKEN] No hay refresh token para revocar');
        return;
      }

      await apiClient.post('/auth/revoke', {
        refreshToken
      });

      console.log('🔒 [REFRESH TOKEN] Refresh token revocado');
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error revocando refresh token:', error);
    } finally {
      // Limpiar tokens locales de todas formas
      await this.clearTokens();
    }
  }

  /**
   * Verificar si hay tokens válidos
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      
      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('❌ [REFRESH TOKEN] Error verificando tokens:', error);
      return false;
    }
  }
}

export default RefreshTokenService;
