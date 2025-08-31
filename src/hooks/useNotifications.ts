import { useState, useEffect, useCallback } from 'react';
import { NotificationService, Notification, Recipient, CreateNotificationRequest } from '../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const { selectedInstitution } = useInstitution();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(notification => 
    !notification.readBy.some(read => read.user === 'currentUserId') // TODO: Get current user ID
  ).length;

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

      const isCoordinador = user.role?.nombre === 'coordinador';
      
      const data = await NotificationService.getNotifications({
        limit: 50,
        unreadOnly: false,
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division?._id,
        userRole: user.role?.nombre,
        userId: user._id,
        isCoordinador
      });
      console.log('🔔 Notificaciones recibidas del servidor:', data);
      console.log('🔔 Cantidad de notificaciones:', data?.length || 0);
      console.log('🔔 Usuario actual:', user.name, 'Rol:', user.role?.nombre);
      console.log('🔔 Institución:', selectedInstitution.account.nombre);
      console.log('🔔 División:', selectedInstitution.division?.nombre || 'Sin división');
      
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedInstitution]);

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
    } catch (err: any) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  }, []);

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
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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