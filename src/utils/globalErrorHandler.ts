import { ErrorUtils } from 'react-native';
import { appLogger, logCriticalError } from './logger';

/**
 * Configura handlers globales para errores no capturados en React Native
 * Esto captura errores que ocurren fuera del ciclo de render de React
 */
export const setupGlobalErrorHandlers = () => {
  try {
    // Handler para errores de JavaScript no capturados
    if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        // Log detallado del error
        const errorDetails = {
          name: error?.name || 'UnknownError',
          message: error?.message || 'Error desconocido',
          stack: error?.stack || 'No stack trace available',
          isFatal: isFatal || false,
          timestamp: new Date().toISOString(),
        };

        console.error('🚨 [GLOBAL ERROR HANDLER] Error no capturado:', errorDetails);
        console.error('🚨 [GLOBAL ERROR HANDLER] Error completo:', error);
        console.error('🚨 [GLOBAL ERROR HANDLER] Stack trace:', error?.stack);
        
        // Log crítico para debugging
        if (error) {
          logCriticalError(error, 'GlobalErrorHandler', {
            isFatal,
            errorDetails,
          });

          // Log usando el logger de la app
          appLogger.crash('Error JavaScript no capturado', error, {
            isFatal,
            errorDetails,
          });
        }

        // En modo desarrollo, dar tiempo para ver los logs antes de cerrar
        if (__DEV__) {
          console.error('🚨 [GLOBAL ERROR HANDLER] MODO DESARROLLO: Esperando 2 segundos antes de procesar error...');
          // Dar tiempo para que los logs se escriban
          setTimeout(() => {
            processError();
          }, 2000);
        } else {
          processError();
        }

        function processError() {
          // Intentar prevenir el crash si el error no es crítico
          // Algunos errores pueden ser manejados sin cerrar la app
          const shouldPreventCrash = !isFatal && error?.message && (
            error.message.includes('Network') ||
            error.message.includes('timeout') ||
            error.message.includes('fetch') ||
            error.message.includes('connection')
          );

          if (shouldPreventCrash) {
            console.warn('⚠️ [GLOBAL ERROR HANDLER] Error no fatal detectado, intentando prevenir crash');
            // No llamar al handler original para errores no fatales recuperables
            return;
          }

          // En modo desarrollo, NO cerrar la app inmediatamente para poder debuggear
          if (__DEV__) {
            console.error('🚨 [GLOBAL ERROR HANDLER] MODO DESARROLLO: Error fatal detectado');
            console.error('🚨 [GLOBAL ERROR HANDLER] NO cerrando la app en desarrollo para debugging');
            console.error('🚨 [GLOBAL ERROR HANDLER] Revisa los logs arriba para identificar el problema');
            // En desarrollo, NO llamamos al handler original para evitar el crash
            // Esto nos permite ver los logs y debuggear el problema
            return;
          } else {
            // En producción, llamar al handler original inmediatamente
            if (originalHandler) {
              try {
                console.error('🚨 [GLOBAL ERROR HANDLER] Llamando handler original (puede causar crash)');
                originalHandler(error, isFatal);
              } catch (handlerError) {
                console.error('🚨 [GLOBAL ERROR HANDLER] Error en handler original:', handlerError);
              }
            } else {
              // Si no hay handler original, al menos loguear el error
              console.error('🚨 [GLOBAL ERROR HANDLER] No hay handler original, error no manejado');
            }
          }
        }
      });
    }

    // Nota: En React Native, las promesas rechazadas no manejadas eventualmente
    // se convierten en errores de JavaScript que son capturados por el handler global.
    // No necesitamos un handler separado para promesas rechazadas.

    console.log('✅ [GLOBAL ERROR HANDLER] Handlers globales configurados correctamente');
  } catch (setupError) {
    console.error('❌ [GLOBAL ERROR HANDLER] Error configurando handlers:', setupError);
    appLogger.crash('Error configurando global error handlers', setupError as Error);
  }
};

