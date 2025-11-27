import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationService, Notification, Recipient, CreateNotificationRequest } from '../services/notificationService';
import { useAuth } from '../../contexts/AuthContextHybrid';
import { useInstitution } from '../../contexts/InstitutionContext';

export interface UseNotificationsReturn {
  notifications: Notification[];
  recipients: Recipient[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  loadRecipients: (accountId: string, divisionId?: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  sendNotification: (data: CreateNotificationRequest) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution } = useInstitution();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Cargar conteo de notificaciones no leídas desde el servidor
  // Usar useRef para evitar recrear la función cuando cambian las dependencias
  const loadUnreadCountRef = useRef<(() => Promise<void>) | null>(null);
  
  const loadUnreadCount = useCallback(async () => {
    try {
      // Solo cargar conteo para familyadmin y familyviewer
      const effectiveRole = activeAssociation?.role?.nombre || user?.role?.nombre;
      if (effectiveRole === 'familyadmin' || effectiveRole === 'familyviewer') {
        // Para tutores, usar getFamilyUnreadCount que cuenta solo las notificaciones del estudiante activo
        const accountId = selectedInstitution?.account?._id;
        const divisionId = selectedInstitution?.division?._id;
        const count = await NotificationService.getFamilyUnreadCount(accountId || '', divisionId);
        setUnreadCount(count);
        console.log('🔔 [UNREAD COUNT] Conteo desde servidor (estudiante activo):', count, 'accountId:', accountId, 'divisionId:', divisionId);
      } else {
        setUnreadCount(0);
      }
    } catch (err: any) {
      // Si es error 429, no loguear como error crítico
      if (err.response?.status === 429) {
        console.log('⚠️ [UNREAD COUNT] Rate limit alcanzado, omitiendo conteo');
        return;
      }
      console.error('Error loading unread count:', err);
      setUnreadCount(0);
    }
  }, [user?._id, activeAssociation?.role?.nombre, selectedInstitution?.account?._id, selectedInstitution?.division?._id]);
  
  // Guardar referencia para usar en intervalos
  loadUnreadCountRef.current = loadUnreadCount;

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si tenemos la información necesaria
      if (!user || !selectedInstitution) {
        console.log('No hay usuario o institución seleccionada');
        setNotifications([]);
        return;
      }

      // Determinar rol efectivo priorizando la asociación activa
      const effectiveRole = activeAssociation?.role?.nombre || user.role?.nombre;
      const isCoordinador = effectiveRole === 'coordinador';
      
      const data = await NotificationService.getNotifications({
        limit: 10000, // Límite muy alto para mostrar todas las notificaciones
        unreadOnly: false,
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division?._id,
        userRole: effectiveRole,
        userId: user._id,
        isCoordinador
      });
      console.log('🔔 Notificaciones recibidas del servidor:', data);
      console.log('🔔 Cantidad de notificaciones:', data?.length || 0);
      console.log('🔔 Usuario actual:', user.name, 'Rol base:', user.role?.nombre, 'Rol activo:', activeAssociation?.role?.nombre);
      console.log('🔔 Institución:', selectedInstitution.account.nombre);
      console.log('🔔 División:', selectedInstitution.division?.nombre || 'Sin división');
      
      setNotifications(data);
      
      // NO llamar loadUnreadCount aquí para evitar peticiones duplicadas
      // El intervalo se encargará de actualizar el conteo
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, activeAssociation?.role?.nombre, selectedInstitution?.account?._id, selectedInstitution?.division?._id]);

  const loadRecipients = useCallback(async (accountId: string, divisionId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await NotificationService.getRecipients(accountId, divisionId);
      setRecipients(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading recipients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Actualizar la notificación localmente
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, status: 'read' as const }
            : notification
        )
      );
      
      // NO llamar loadUnreadCount aquí inmediatamente para evitar peticiones duplicadas
      // El intervalo se encargará de actualizar el conteo
      // Solo actualizar localmente
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  }, [loadUnreadCount]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Remover la notificación de la lista local
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  const sendNotification = useCallback(async (data: CreateNotificationRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      await NotificationService.sendNotification(data);
      
      // Recargar notificaciones después de enviar
      await loadNotifications();
    } catch (err: any) {
      setError(err.message);
      console.error('Error sending notification:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadNotifications]);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Cargar notificaciones al montar el hook
  // Usar dependencias estables para evitar loops
  useEffect(() => {
    if (user?._id && selectedInstitution?.account?._id) {
      loadNotifications();
    }
  }, [user?._id, selectedInstitution?.account?._id, activeAssociation?.role?.nombre]);

  // Cargar conteo de no leídas periódicamente (cada 60 segundos - aumentado para evitar rate limiting)
  useEffect(() => {
    const effectiveRole = activeAssociation?.role?.nombre || user?.role?.nombre;
    if (effectiveRole === 'familyadmin' || effectiveRole === 'familyviewer') {
      // Cargar inmediatamente solo si hay usuario e institución
      if (user?._id && selectedInstitution?.account?._id) {
        loadUnreadCount();
      }
      
      // Intervalo más largo para evitar rate limiting (60 segundos en lugar de 30)
      const interval = setInterval(() => {
        if (loadUnreadCountRef.current && user?._id && selectedInstitution?.account?._id) {
          loadUnreadCountRef.current();
        }
      }, 60000); // 60 segundos
      
      return () => clearInterval(interval);
    }
  }, [user?._id, activeAssociation?.role?.nombre, selectedInstitution?.account?._id]);

  return {
    notifications,
    recipients,
    loading,
    error,
    unreadCount,
    loadNotifications,
    loadRecipients,
    markAsRead,
    deleteNotification,
    sendNotification,
    refreshNotifications
  };
}; 