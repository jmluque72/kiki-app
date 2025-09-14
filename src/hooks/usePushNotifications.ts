import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PushNotificationService from '../services/pushNotificationService';
import { NotificationService } from '../services/notificationService';

export const usePushNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        // Inicializar el servicio
        await PushNotificationService.initialize();
        setIsEnabled(true);
        
        // Obtener el token
        const deviceToken = await PushNotificationService.getToken();
        console.log('🔔 [HOOK] Token obtenido:', deviceToken ? deviceToken.substring(0, 20) + '...' : 'null');
        
        if (deviceToken) {
          setToken(deviceToken);
          // Registrar el token en el servidor
          try {
            const result = await NotificationService.registerPushToken(deviceToken, user._id);
            console.log('✅ [HOOK] Token registrado exitosamente:', result);
          } catch (error) {
            console.error('❌ [HOOK] Error registrando token:', error);
            setError('Error registrando token de notificaciones');
          }
        } else {
          console.log('🔔 [HOOK] No se pudo obtener token del dispositivo');
          setError('No se pudo obtener token del dispositivo');
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

  return {
    isEnabled,
    token,
    loading,
    error
  };
};