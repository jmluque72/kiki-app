import { useState, useCallback } from 'react';

interface AlertConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setAlertConfig(null);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      confirmText: 'Aceptar',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      confirmText: 'Entendido',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showLoginError = useCallback((message: string, onConfirm?: () => void) => {
    showAlert({
      title: 'Error de Inicio de Sesión',
      message,
      type: 'error',
      confirmText: 'Intentar de Nuevo',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showNetworkError = useCallback((onConfirm?: () => void) => {
    showAlert({
      title: 'Error de Conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      type: 'warning',
      confirmText: 'Reintentar',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText: 'Aceptar',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      confirmText: 'Aceptar',
      onConfirm: () => {
        hideAlert();
        onConfirm?.();
      },
    });
  }, [showAlert, hideAlert]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'info',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        hideAlert();
        onConfirm();
      },
      onCancel: () => {
        hideAlert();
        onCancel?.();
      },
    });
  }, [showAlert, hideAlert]);

  return {
    isVisible,
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showLoginError,
    showNetworkError,
    showWarning,
    showInfo,
    showConfirm,
  };
}; 