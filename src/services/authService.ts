import { apiClient, ApiResponse, LoginRequest, LoginResponse, Account } from './api';

export class AuthService {
  // Login de usuario
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/users/login',
        credentials
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        // Lanzar error con el mensaje de la respuesta directamente
        throw new Error(response.data.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      // Si el error ya tiene un mensaje personalizado (no es el genérico), re-lanzarlo
      if (error instanceof Error) {
        // Si el mensaje no es el genérico, significa que viene de la respuesta del servidor
        if (error.message && error.message !== 'Error al iniciar sesión') {
          throw error;
        }
      }
      // Si es un error de red u otro tipo sin mensaje personalizado
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  }



  // Obtener cuentas disponibles para registro
  static async getAvailableAccounts(): Promise<Account[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ accounts: Account[]; total: number }>>(
        '/accounts/mobile'
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.accounts;
      } else {
        throw new Error(response.data.message || 'Error al obtener cuentas');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cuentas');
    }
  }

  // Obtener divisiones por cuenta para registro mobile
  static async getGruposByCuenta(cuentaId: string): Promise<{ grupos: any[]; cuenta: any }> {
    try {
      const response = await apiClient.get<ApiResponse<{ grupos: any[]; total: number; cuenta: any }>>(
        `/grupos/mobile/${cuentaId}`
      );
      
      if (response.data.success && response.data.data) {
        return {
          grupos: response.data.data.grupos,
          cuenta: response.data.data.cuenta
        };
      } else {
        throw new Error(response.data.message || 'Error al obtener divisiones');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener divisiones');
    }
  }

  // Verificar token
  static async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse>('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
} 