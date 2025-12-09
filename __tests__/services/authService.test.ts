import { vi } from 'vitest';
import { AuthService } from '../../src/services/authService';
import { apiClient } from '../../src/services/api';

// Mock del servicio API
vi.mock('../../src/services/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'mock-token',
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
            },
          },
        },
      };

      (apiClient.post as any).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.login(mockCredentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/login',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data.data);
    });

    it('debe lanzar error cuando la respuesta no es exitosa', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockResponse = {
        data: {
          success: false,
          message: 'Credenciales inválidas',
        },
      };

      (apiClient.post as any).mockResolvedValueOnce(mockResponse);

      await expect(AuthService.login(mockCredentials)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('debe manejar errores de red', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const networkError = new Error('Network error');
      (apiClient.post as any).mockRejectedValueOnce(networkError);

      await expect(AuthService.login(mockCredentials)).rejects.toThrow(
        'Error al iniciar sesión'
      );
    });

    it('debe manejar errores con mensaje de respuesta', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const errorWithResponse = {
        response: {
          data: {
            message: 'Usuario no encontrado',
          },
        },
      };

      (apiClient.post as any).mockRejectedValueOnce(errorWithResponse);

      await expect(AuthService.login(mockCredentials)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('getAvailableAccounts', () => {
    it('debe obtener cuentas disponibles exitosamente', async () => {
      const mockAccounts = [
        {
          _id: '1',
          nombre: 'Escuela Primaria',
          razonSocial: 'Escuela Primaria S.A.',
        },
        {
          _id: '2',
          nombre: 'Colegio Secundario',
          razonSocial: 'Colegio Secundario S.A.',
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: {
            accounts: mockAccounts,
            total: 2,
          },
        },
      };

      (apiClient.get as any).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.getAvailableAccounts();

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/mobile');
      expect(result).toEqual(mockAccounts);
    });

    it('debe lanzar error cuando no hay datos en la respuesta', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      (apiClient.get as any).mockResolvedValueOnce(mockResponse);

      await expect(AuthService.getAvailableAccounts()).rejects.toThrow(
        'Error al obtener cuentas'
      );
    });
  });

  describe('getGruposByCuenta', () => {
    it('debe obtener grupos por cuenta exitosamente', async () => {
      const cuentaId = '1';
      const mockGrupos = [
        {
          _id: '1',
          nombre: 'Grupo A',
          descripcion: 'Primer grado',
        },
        {
          _id: '2',
          nombre: 'Grupo B',
          descripcion: 'Segundo grado',
        },
      ];

      const mockCuenta = {
        _id: '1',
        nombre: 'Escuela Primaria',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            grupos: mockGrupos,
            total: 2,
            cuenta: mockCuenta,
          },
        },
      };

      (apiClient.get as any).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.getGruposByCuenta(cuentaId);

      expect(apiClient.get).toHaveBeenCalledWith('/grupos/mobile/1');
      expect(result).toEqual({
        grupos: mockGrupos,
        cuenta: mockCuenta,
      });
    });
  });

  describe('verifyToken', () => {
    it('debe verificar token exitosamente', async () => {
      const token = 'valid-token';
      const mockResponse = {
        data: {
          success: true,
        },
      };

      (apiClient.get as any).mockResolvedValueOnce(mockResponse);

      const result = await AuthService.verifyToken(token);

      expect(apiClient.get).toHaveBeenCalledWith('/auth/verify', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });
      expect(result).toBe(true);
    });

    it('debe retornar false cuando el token es inválido', async () => {
      const token = 'invalid-token';

      (apiClient.get as any).mockRejectedValueOnce(new Error('Token inválido'));

      const result = await AuthService.verifyToken(token);

      expect(result).toBe(false);
    });

    it('debe retornar false cuando hay error en la verificación', async () => {
      const token = 'error-token';

      (apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.verifyToken(token);

      expect(result).toBe(false);
    });
  });
});