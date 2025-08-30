import { apiClient, ApiResponse } from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'informacion' | 'comunicacion';
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
  recipients: string[];
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

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'informacion' | 'comunicacion';
  accountId: string;
  divisionId?: string;
  recipients?: string[];
}

export interface Recipient {
  id: string;
  nombre: string;
  email: string;
  account: string;
  division: string;
}

export class NotificationService {
  // Obtener notificaciones del usuario
  static async getNotifications(options: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
    accountId?: string;
    divisionId?: string;
    userRole?: string;
    userId?: string;
    isCoordinador?: boolean;
  } = {}): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.skip) params.append('skip', options.skip.toString());
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.accountId) params.append('accountId', options.accountId);
      if (options.divisionId) params.append('divisionId', options.divisionId);
      if (options.userRole) params.append('userRole', options.userRole);
      if (options.userId) params.append('userId', options.userId);
      if (options.isCoordinador !== undefined) params.append('isCoordinador', options.isCoordinador.toString());

      const url = `/notifications?${params.toString()}`;
      console.log('📡 Llamada al API de notificaciones:', url);
      console.log('📡 Parámetros enviados:', options);

      const response = await apiClient.get<ApiResponse<Notification[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener notificaciones');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener notificaciones');
    }
  }

  // Marcar notificación como leída
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiClient.put<ApiResponse>(
        `/notifications/${notificationId}/read`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al marcar notificación como leída');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al marcar notificación como leída');
    }
  }

  // Enviar nueva notificación
  static async sendNotification(data: CreateNotificationRequest): Promise<{
    id: string;
    title: string;
    message: string;
    type: string;
    sentAt: string;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        id: string;
        title: string;
        message: string;
        type: string;
        sentAt: string;
      }>>('/notifications', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al enviar notificación');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar notificación');
    }
  }

  // Obtener destinatarios disponibles
  static async getRecipients(accountId: string, divisionId?: string): Promise<Recipient[]> {
    try {
      const params = new URLSearchParams();
      params.append('accountId', accountId);
      if (divisionId) params.append('divisionId', divisionId);

      const response = await apiClient.get<ApiResponse<Recipient[]>>(
        `/notifications/recipients?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener destinatarios');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener destinatarios');
    }
  }
} 