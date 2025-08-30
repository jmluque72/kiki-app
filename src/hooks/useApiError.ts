import { useAuth } from '../../contexts/AuthContext';

export const useApiError = () => {
  const { logout } = useAuth();

  const handleApiError = (error: any, customMessage?: string) => {
    console.error('🔍 Error de API detectado:', error);

    if (error.response?.status === 401) {
      console.log('🔐 Error 401 - Token expirado, redirigiendo al login');
      // El interceptor ya maneja el logout automático
      return {
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        shouldLogout: true
      };
    }

    if (error.response?.status === 403) {
      return {
        message: 'No tienes permisos para realizar esta acción.',
        shouldLogout: false
      };
    }

    if (error.response?.status === 404) {
      return {
        message: 'Recurso no encontrado.',
        shouldLogout: false
      };
    }

    if (error.response?.status === 422) {
      return {
        message: error.response.data?.message || 'Datos de entrada inválidos.',
        shouldLogout: false
      };
    }

    if (error.response?.status >= 500) {
      return {
        message: 'Error del servidor. Inténtalo más tarde.',
        shouldLogout: false
      };
    }

    if (error.request) {
      return {
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        shouldLogout: false
      };
    }

    return {
      message: customMessage || error.message || 'Error inesperado.',
      shouldLogout: false
    };
  };

  return { handleApiError };
};
