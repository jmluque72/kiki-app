import { apiClient } from './api';
import { Platform } from 'react-native';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'informacion' | 'comunicacion' | 'institucion' | 'coordinador' | 'tutor';
  sender: {
    _id: string;
    nombre: string;
    email: string;
    associatedStudent?: {
      nombre: string;
      apellido: string;
    };
  };
  account: {
    _id: string;
    nombre: string;
  };
  division?: {
    _id: string;
    nombre: string;
  };
  recipients: Array<{
    _id: string;
    nombre: string;
    email: string;
    associatedStudent?: {
      nombre: string;
      apellido: string;
    };
  }>;
  associatedStudent?: {
    _id: string;
    nombre: string;
    apellido: string;
  };
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high';
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  _id: string;
  nombre: string;
  email: string;
  role?: {
    _id: string;
    nombre: string;
  };
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'informacion' | 'comunicacion';
  accountId: string;
  divisionId?: string;
  recipients?: string[];
}

export interface NotificationDetails {
  _id: string;
  title: string;
  message: string;
  type: string;
  sender: {
    _id: string;
    nombre: string;
    email: string;
  };
  account: {
    _id: string;
    nombre: string;
  };
  division?: {
    _id: string;
    nombre: string;
  };
  recipients: Array<{
    _id: string;
    nombre: string;
    email: string;
  }>;
  readBy: Array<{
    user: {
      _id: string;
      nombre: string;
      email: string;
    };
    readAt: string;
  }>;
  status: string;
  priority: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  // Campos específicos para detalles
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
  readByDetails: Array<{
    user: {
      _id: string;
      nombre: string;
      email: string;
    };
    readAt: string;
  }>;
  unreadByDetails: Array<{
    _id: string;
    nombre: string;
    email: string;
  }>;
}

export class NotificationService {
  // Obtener notificaciones para el usuario
  static async getNotifications(params?: {
    limit?: number;
    skip?: number;
    accountId?: string;
    divisionId?: string;
    unreadOnly?: boolean;
    userRole?: string;
    userId?: string;
    isCoordinador?: boolean;
  }): Promise<Notification[]> {
    try {
      // Si es un usuario familia, usar el endpoint específico
      if (params?.userRole === 'familyadmin' || params?.userRole === 'familyviewer') {
        return this.getFamilyNotifications(params);
      }

      // Para coordinadores y otros roles, usar el endpoint general
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.accountId) queryParams.append('accountId', params.accountId);
      if (params?.divisionId) queryParams.append('divisionId', params.divisionId);
      if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
      if (params?.userRole) queryParams.append('userRole', params.userRole);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.isCoordinador !== undefined) queryParams.append('isCoordinador', params.isCoordinador.toString());

      const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
        `/notifications?${queryParams.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }

  // Obtener notificaciones para usuarios familia (endpoint específico)
  static async getFamilyNotifications(params?: {
    limit?: number;
    skip?: number;
    accountId?: string;
    divisionId?: string;
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.accountId) queryParams.append('accountId', params.accountId);
      if (params?.divisionId) queryParams.append('divisionId', params.divisionId);
      if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());

      const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
        `/notifications/family?${queryParams.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener notificaciones familia:', error);
      return [];
    }
  }

  // Obtener detalles de una notificación específica
  static async getNotificationDetails(notificationId: string): Promise<NotificationDetails> {
    try {
      const response = await apiClient.get<{ success: boolean; data: NotificationDetails }>(
        `/notifications/${notificationId}/details`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Error al obtener detalles de la notificación');
      }
    } catch (error: any) {
      console.error('Error al obtener detalles de la notificación:', error);
      throw error;
    }
  }

  // Enviar notificación
  static async sendNotification(data: CreateNotificationRequest): Promise<Notification> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Notification }>(
        '/notifications',
        data
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Error al enviar notificación');
      }
    } catch (error: any) {
      console.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  // Marcar como leída
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        `/notifications/${notificationId}/read`
      );
      
      if (!response.data.success) {
        throw new Error('Error al marcar notificación como leída');
      }
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  // Eliminar notificación
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/notifications/${notificationId}`
      );
      
      if (!response.data.success) {
        throw new Error('Error al eliminar notificación');
      }
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  // Obtener destinatarios disponibles
  static async getRecipients(accountId: string, divisionId?: string): Promise<Recipient[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('accountId', accountId);
      if (divisionId) queryParams.append('divisionId', divisionId);

      const response = await apiClient.get<{ success: boolean; data: Recipient[] }>(
        `/notifications/recipients?${queryParams.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener destinatarios:', error);
      return [];
    }
  }

  // Obtener conteo de notificaciones sin leer
  static async getUnreadCount(accountId?: string, divisionId?: string): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (accountId) queryParams.append('accountId', accountId);
      if (divisionId) queryParams.append('divisionId', divisionId);

      const url = `/notifications/unread-count${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<{ success: boolean; data: { count: number } }>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data.count;
      } else {
        return 0;
      }
    } catch (error: any) {
      console.error('Error al obtener conteo de notificaciones sin leer:', error);
      return 0;
    }
  }

  // Obtener conteo de notificaciones sin leer para usuarios familia
  static async getFamilyUnreadCount(accountId?: string, divisionId?: string): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      if (accountId) queryParams.append('accountId', accountId);
      if (divisionId) queryParams.append('divisionId', divisionId);

      const url = `/notifications/family/unread-count${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<{ success: boolean; data: { count: number } }>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data.count;
      } else {
        return 0;
      }
    } catch (error: any) {
      console.error('Error al obtener conteo de notificaciones familia sin leer:', error);
      return 0;
    }
  }

  // Métodos para notificaciones push
  static async registerPushToken(token: string, userId: string): Promise<void> {
    try {
      const response = await apiClient.post('/push/register-token', {
        token,
        platform: Platform.OS, // 'ios' o 'android'
        deviceId: `${Platform.OS}-${Date.now()}`, // ID único temporal
        appVersion: '1.0.0', // Versión fija por ahora
        osVersion: Platform.Version.toString()
      });
      console.log('🔔 Push token registered successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error registering push token:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar token de notificaciones push');
    }
  }

  static async unregisterPushToken(token: string, userId: string): Promise<void> {
    try {
      const response = await apiClient.post('/push/unregister-token', {
        token
      });
      console.log('🔔 Push token unregistered successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error unregistering push token:', error);
      throw new Error(error.response?.data?.message || 'Error al desregistrar token de notificaciones push');
    }
  }

  static async sendPushNotification(notificationId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/send-push`);
      console.log('🔔 Push notification sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      throw new Error(error.response?.data?.message || 'Error al enviar notificación push');
    }
  }
}
