import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { appLogger, logCriticalError } from '../utils/logger';
// import { addBreadcrumb, setUserContext } from '../config/sentryConfig';

/**
 * Hook para monitorear el estado de la app y detectar crashes
 */
export const useCrashMonitoring = () => {
  const appState = useRef(AppState.currentState);
  const crashCount = useRef(0);
  const lastAppStateChange = useRef(Date.now());

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const now = Date.now();
      const timeSinceLastChange = now - lastAppStateChange.current;
      
      appLogger.info('App state changed', {
        from: appState.current,
        to: nextAppState,
        timeSinceLastChange,
        crashCount: crashCount.current
      });

      // Detectar posibles crashes
      if (appState.current === 'active' && nextAppState === 'background') {
        // App se fue a background normalmente
        // addBreadcrumb('App went to background', 'navigation');
      } else if (appState.current === 'background' && nextAppState === 'active') {
        // App volvió del background
        const timeInBackground = timeSinceLastChange;
        // addBreadcrumb('App returned from background', 'navigation', {
        //   timeInBackground
        // });
        
        // Si estuvo mucho tiempo en background, podría indicar un crash
        if (timeInBackground > 30000) { // 30 segundos
          appLogger.warn('App was in background for extended period', {
            timeInBackground,
            possibleCrash: timeInBackground > 300000 // 5 minutos
          });
        }
      } else if (appState.current === 'active' && nextAppState === 'inactive') {
        // App se volvió inactiva (posible crash)
        appLogger.warn('App became inactive unexpectedly', {
          timeSinceLastChange
        });
      }

      appState.current = nextAppState;
      lastAppStateChange.current = now;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Función para reportar un crash manualmente
  const reportCrash = (error: Error, context: string, additionalData?: any) => {
    crashCount.current += 1;
    
    logCriticalError(error, context, {
      crashCount: crashCount.current,
      appState: appState.current,
      ...additionalData
    });

    // addBreadcrumb('Manual crash report', 'error', {
    //   context,
    //   crashCount: crashCount.current,
    //   errorMessage: error.message
    // });
  };

  // Función para reportar un error no fatal
  const reportError = (error: Error, context: string, additionalData?: any) => {
    appLogger.error(`Non-fatal error in ${context}`, error, {
      appState: appState.current,
      ...additionalData
    });

    // addBreadcrumb('Non-fatal error', 'error', {
    //   context,
    //   errorMessage: error.message
    // });
  };

  // Función para establecer contexto del usuario
  const setUser = (user: any) => {
    // setUserContext(user);
    // addBreadcrumb('User context set', 'user', {
    //   userId: user.id,
    //   hasEmail: !!user.email
    // });
    appLogger.info('User context set (Sentry disabled)', {
      userId: user.id,
      hasEmail: !!user.email
    });
  };

  return {
    reportCrash,
    reportError,
    setUser,
    getCrashCount: () => crashCount.current,
    getAppState: () => appState.current
  };
};
