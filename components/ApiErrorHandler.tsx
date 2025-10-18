import React from 'react';
import { useApiError } from '../src/hooks/useApiError';

interface ApiErrorHandlerProps {
  error: any;
  customMessage?: string;
  onError?: (errorInfo: { message: string; shouldLogout: boolean }) => void;
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({ 
  error, 
  customMessage, 
  onError 
}) => {
  const { handleApiError } = useApiError();

  React.useEffect(() => {
    if (error) {
      const errorInfo = handleApiError(error, customMessage);
      
      // Si hay un callback personalizado, usarlo
      if (onError) {
        onError(errorInfo);
        return;
      }

      // Mostrar alerta por defecto
      console.log('Error:', errorInfo.message);
        [
          {
            text: 'OK',
            onPress: () => {
              // Si es un error 401, el interceptor ya maneja el logout
              console.log('Usuario confirmó el error');
            }
          }
        ]
      );
    }
  }, [error, customMessage, onError, handleApiError]);

  return null; // Este componente no renderiza nada
};

// Hook para usar el manejador de errores en componentes funcionales
export const useApiErrorHandler = () => {
  const { handleApiError } = useApiError();

  const showError = (error: any, customMessage?: string) => {
    const errorInfo = handleApiError(error, customMessage);
    
    console.log('Error:', errorInfo.message);
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Usuario confirmó el error');
          }
        }
      ]
    );

    return errorInfo;
  };

  return { showError };
};
