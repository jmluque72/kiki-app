import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContextHybrid';
import AutoPushNotificationService from '../services/pushNotificationServiceAuto';
import { NotificationService } from '../services/notificationService';

export const usePushNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null); // Token ya registrado
  
  const { user, isAuthenticated } = useAuth();
  
  // Debug: log cuando el hook se ejecuta
  console.log('🔔 [HOOK] usePushNotifications ejecutado - user:', user ? { id: user._id, email: user.email } : 'No user', 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    // Si no está autenticado, no hacer nada
    if (!isAuthenticated || !user || !user._id || !user.email) {
      console.log('🔔 [HOOK] Usuario no completamente autenticado, saltando inicialización');
      setLoading(false);
      return;
    }

    console.log('🔔 [HOOK] Usuario autenticado, procediendo con inicialización');
    
    const initializePushNotifications = async () => {
      try {
        // Inicializar el servicio automático
        await AutoPushNotificationService.initialize();
        setIsEnabled(true);
        
        // Obtener información del servicio
        const serviceInfo = AutoPushNotificationService.getServiceInfo();
        console.log('🔔 [HOOK] Servicio inicializado:', serviceInfo);
        
        // Obtener el token (esperar hasta 15 segundos para iOS)
        console.log('🔔 [HOOK] Esperando token del dispositivo...');
        console.log('🔔 [HOOK] Timeout configurado: 15000ms (15 segundos)');
        console.log('🔔 [HOOK] Si el callback onRegister no se ejecuta, el timeout resolverá con null');
        
        const startTime = Date.now();
        const deviceToken = await AutoPushNotificationService.getToken(15000);
        const elapsedTime = Date.now() - startTime;
        
        console.log('🔔 [HOOK] getToken() completado después de', elapsedTime, 'ms');
        console.log('🔔 [HOOK] Token obtenido:', deviceToken ? deviceToken.substring(0, 20) + '...' : 'null');
        console.log('🔔 [HOOK] Estado después de getToken:', {
          hasToken: !!deviceToken,
          serviceInfo: serviceInfo,
          useFallback: serviceInfo.useFallback
        });
        
        if (deviceToken) {
          setToken(deviceToken);
          // Registrar el token en el servidor solo si no es fallback y no está ya registrado
          if (!serviceInfo.useFallback && deviceToken !== registeredToken) {
            try {
              console.log('🔔 [HOOK] Registrando token en el servidor...');
              const result = await NotificationService.registerPushToken(deviceToken, user._id);
              console.log('✅ [HOOK] Token registrado exitosamente en el servidor:', result);
              setRegisteredToken(deviceToken); // Marcar como registrado
            } catch (error: any) {
              // Si es error de rate limiting, no mostrar error al usuario
              if (error.message?.includes('Demasiadas solicitudes') || 
                  error.message?.includes('rate limit') ||
                  error.response?.status === 429) {
                console.log('⚠️ [HOOK] Rate limit alcanzado, el token se registrará más tarde');
                // No establecer error, solo log
              } else {
                console.error('❌ [HOOK] Error registrando token:', error);
                console.error('❌ [HOOK] Error details:', error.message);
                console.error('❌ [HOOK] Error response:', error.response?.data);
                // No establecer error para evitar mostrar al usuario
              }
            }
          } else if (deviceToken === registeredToken) {
            console.log('🔔 [HOOK] Token ya registrado, omitiendo registro duplicado');
          } else {
            console.log('🔔 [HOOK] Modo fallback - no se registra token en servidor');
          }
        } else {
          console.log('⚠️ [HOOK] No se pudo obtener token del dispositivo después de esperar');
          console.log('⚠️ [HOOK] Posibles causas:');
          console.log('   1. Certificados APNs no configurados en Xcode (iOS)');
          console.log('   2. Push Notifications no habilitado en Signing & Capabilities (iOS)');
          console.log('   3. La app está en simulador (iOS requiere dispositivo físico)');
          console.log('   4. El callback onRegister no se ejecutó dentro del timeout');
          
          // Solo intentar retry si no es fallback (fallback nunca tendrá token)
          if (!serviceInfo.useFallback) {
            console.log('🔔 [HOOK] Intentando obtener token una vez más después de 5 segundos...');
            // Intentar una vez más después de un delay
            setTimeout(async () => {
              console.log('🔔 [HOOK] Segundo intento de obtener token...');
              const retryToken = await AutoPushNotificationService.getToken(10000);
              if (retryToken && retryToken !== registeredToken) {
                console.log('✅ [HOOK] Token obtenido en segundo intento:', retryToken.substring(0, 20) + '...');
                setToken(retryToken);
                if (user?._id) {
                  try {
                    await NotificationService.registerPushToken(retryToken, user._id);
                    console.log('✅ [HOOK] Token registrado en segundo intento');
                    setRegisteredToken(retryToken); // Marcar como registrado
                  } catch (error: any) {
                    // Si es error de rate limiting, no mostrar error
                    if (error.message?.includes('Demasiadas solicitudes') || 
                        error.message?.includes('rate limit') ||
                        error.response?.status === 429) {
                      console.log('⚠️ [HOOK] Rate limit alcanzado en segundo intento');
                    } else {
                      console.error('❌ [HOOK] Error registrando token en segundo intento:', error);
                    }
                  }
                }
              } else if (retryToken === registeredToken) {
                console.log('🔔 [HOOK] Token del retry ya estaba registrado, omitiendo');
              } else {
                console.log('⚠️ [HOOK] Segundo intento también falló - no se pudo obtener token');
                console.log('⚠️ [HOOK] Esto probablemente significa que los certificados APNs no están configurados');
                setError('No se pudo obtener token del dispositivo. Verifica la configuración de APNs en Xcode.');
              }
            }, 5000); // Esperar 5 segundos más
          } else {
            console.log('🔔 [HOOK] Modo fallback - no se intentará retry');
          }
        }
        
      } catch (error) {
        console.error('❌ [HOOK] Error inicializando push notifications:', error);
        setError('Error inicializando notificaciones push');
      } finally {
        setLoading(false);
      }
    };

    initializePushNotifications();
  }, [isAuthenticated, user?._id, user?.email]);

  /**
   * Solicita permisos para notificaciones push
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await AutoPushNotificationService.requestPermissions();
      if (granted) {
        setIsEnabled(true);
        // Intentar obtener token después de conceder permisos
        const deviceToken = await AutoPushNotificationService.getToken();
        if (deviceToken && user?._id && deviceToken !== registeredToken) {
          setToken(deviceToken);
          try {
            await NotificationService.registerPushToken(deviceToken, user._id);
            console.log('✅ [HOOK] Token registrado después de conceder permisos');
            setRegisteredToken(deviceToken); // Marcar como registrado
          } catch (error: any) {
            // Si es error de rate limiting, no mostrar error
            if (error.message?.includes('Demasiadas solicitudes') || 
                error.message?.includes('rate limit') ||
                error.response?.status === 429) {
              console.log('⚠️ [HOOK] Rate limit alcanzado al conceder permisos');
            } else {
              console.error('❌ [HOOK] Error registrando token:', error);
            }
          }
        } else if (deviceToken === registeredToken) {
          console.log('🔔 [HOOK] Token ya registrado después de conceder permisos');
        }
      }
      return granted;
    } catch (error) {
      console.error('❌ [HOOK] Error solicitando permisos:', error);
      return false;
    }
  };

  /**
   * Envía una notificación de prueba
   */
  const sendTestNotification = () => {
    if (!isEnabled) {
      console.warn('⚠️ [HOOK] Notificaciones no habilitadas, no se puede enviar prueba');
      return;
    }

    AutoPushNotificationService.sendLocalNotification({
      title: '🔔 Notificación de Prueba',
      message: 'Esta es una notificación de prueba de Kiki',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    isEnabled,
    token,
    loading,
    error,
    requestPermissions,
    sendTestNotification
  };
};