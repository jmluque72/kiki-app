// import * as Sentry from '@sentry/react-native';

// Configuración de Sentry para crash reporting (DESHABILITADO)
export const initSentry = () => {
  console.log('Sentry deshabilitado para evitar crashes');
  return;
  
  // Código comentado para evitar crashes
  /*
  Sentry.init({
    dsn: 'https://your-sentry-dsn@sentry.io/project-id',
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
  });
  */
};

// Función para reportar errores manualmente (DESHABILITADA)
export const reportError = (error: Error, context?: any) => {
  console.log('Error reportado (Sentry deshabilitado):', error.message);
};

// Función para agregar contexto adicional (DESHABILITADA)
export const addBreadcrumb = (message: string, category: string, data?: any) => {
  console.log('Breadcrumb (Sentry deshabilitado):', message);
};

// Función para establecer información del usuario (DESHABILITADA)
export const setUserContext = (user: any) => {
  console.log('User context (Sentry deshabilitado):', user.id);
};
