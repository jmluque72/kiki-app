import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useApiError } from '../../src/hooks/useApiError';
import { Alert } from 'react-native';

// Mock de Alert
vi.mock('react-native', () => ({
  Alert: {
    alert: vi.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe manejar errores de red correctamente', () => {
    const { result } = renderHook(() => useApiError());
    
    const networkError = new Error('Network request failed');
    
    act(() => {
      result.current.handleApiError(networkError);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Error de conexión. Por favor, verifica tu conexión a internet.',
      expect.any(Array)
    );
  });

  it('debe manejar errores de autenticación correctamente', () => {
    const { result } = renderHook(() => useApiError());
    
    const authError = new Error('Usuario o contraseña incorrectos');
    
    act(() => {
      result.current.handleApiError(authError);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Usuario o contraseña incorrectos',
      expect.any(Array)
    );
  });

  it('debe manejar errores de servidor correctamente', () => {
    const { result } = renderHook(() => useApiError());
    
    const serverError = {
      response: {
        status: 500,
        data: {
          message: 'Error interno del servidor',
        },
      },
    };
    
    act(() => {
      result.current.handleApiError(serverError);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Error interno del servidor',
      expect.any(Array)
    );
  });

  it('debe manejar errores desconocidos correctamente', () => {
    const { result } = renderHook(() => useApiError());
    
    const unknownError = new Error('Algo salió mal');
    
    act(() => {
      result.current.handleApiError(unknownError);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Algo salió mal',
      expect.any(Array)
    );
  });

  it('debe proporcionar botón de reintento cuando se proporciona callback', () => {
    const { result } = renderHook(() => useApiError());
    const retryCallback = vi.fn();
    
    const error = new Error('Network request failed');
    
    act(() => {
      result.current.handleApiError(error, retryCallback);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Error de conexión. Por favor, verifica tu conexión a internet.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Reintentar' }),
        expect.objectContaining({ text: 'Cancelar' })
      ])
    );
  });

  it('debe ejecutar callback de reintento cuando se presiona el botón', () => {
    const { result } = renderHook(() => useApiError());
    const retryCallback = vi.fn();
    
    const error = new Error('Network request failed');
    
    act(() => {
      result.current.handleApiError(error, retryCallback);
    });

    // Obtener los botones pasados a Alert.alert
    const alertCall = (Alert.alert as any).mock.calls[0];
    const buttons = alertCall[2];
    
    // Simular presionar el botón de reintento
    const retryButton = buttons.find((button: any) => button.text === 'Reintentar');
    retryButton.onPress();

    expect(retryCallback).toHaveBeenCalled();
  });
});