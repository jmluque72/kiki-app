import { Platform } from 'react-native';
// import { addBreadcrumb, reportError } from '../config/sentryConfig';

// Tipos de log
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Configuración del logger
const LOG_CONFIG = {
  enableConsole: __DEV__,
  enableSentry: !__DEV__, // Solo en producción
  enableFileLogging: false, // Para futuras implementaciones
};

// Función principal de logging
export const logger = {
  debug: (message: string, data?: any) => {
    log(LogLevel.DEBUG, message, data);
  },
  
  info: (message: string, data?: any) => {
    log(LogLevel.INFO, message, data);
  },
  
  warn: (message: string, data?: any) => {
    log(LogLevel.WARN, message, data);
  },
  
  error: (message: string, error?: Error | any, data?: any) => {
    log(LogLevel.ERROR, message, error, data);
  },
};

// Función interna de logging
const log = (level: LogLevel, message: string, error?: Error | any, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Console logging (solo en desarrollo)
  if (LOG_CONFIG.enableConsole) {
    switch (level) {
      case LogLevel.DEBUG:
        console.log(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, error, data);
        break;
    }
  }
  
  // Sentry logging (deshabilitado)
  // if (LOG_CONFIG.enableSentry) {
  //   addBreadcrumb(message, level, {
  //     timestamp,
  //     platform: Platform.OS,
  //     data,
  //   });
  //   
  //   if (level === LogLevel.ERROR && error) {
  //     if (error instanceof Error) {
  //       reportError(error, { message, data });
  //     } else {
  //       reportError(new Error(message), { originalError: error, data });
  //     }
  //   }
  // }
};

// Logger específico para diferentes secciones de la app
export const appLogger = {
  auth: (message: string, data?: any) => logger.info(`[AUTH] ${message}`, data),
  api: (message: string, data?: any) => logger.info(`[API] ${message}`, data),
  navigation: (message: string, data?: any) => logger.debug(`[NAV] ${message}`, data),
  push: (message: string, data?: any) => logger.info(`[PUSH] ${message}`, data),
  crash: (message: string, error?: Error, data?: any) => logger.error(`[CRASH] ${message}`, error, data),
};

// Función para logging de inicio de app
export const logAppStart = () => {
  logger.info('App starting', {
    platform: Platform.OS,
    version: Platform.Version,
    isDev: __DEV__,
    timestamp: new Date().toISOString(),
  });
};

// Función para logging de errores críticos
export const logCriticalError = (error: Error, context: string, additionalData?: any) => {
  logger.error(`Critical error in ${context}`, error, {
    context,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};
