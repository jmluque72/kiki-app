import { apiClient } from './api';

export interface Shared {
  _id: string;
  user: string;
  account: {
    _id: string;
    nombre: string;
  };
  division?: {
    _id: string;
    nombre: string;
  };
  student?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  };
  role: {
    _id: string;
    nombre: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSharedRequest {
  accountId: string;
  divisionId?: string;
  studentId?: string;
  roleName: string;
}

export interface SharedResponse {
  associations: Shared[];
}

class SharedService {
  // Obtener asociaciones del usuario
  static async getUserAssociations(): Promise<Shared[]> {
    try {
      const response = await apiClient.get('/shared/user');
      return response.data.data.associations || [];
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al obtener asociaciones');
    }
  }

  // Crear nueva asociación (solo familyadmin)
  static async createAssociation(data: CreateSharedRequest): Promise<Shared> {
    try {
      const response = await apiClient.post('/shared', data);
      return response.data.data.association;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al crear asociación');
    }
  }

  // Eliminar asociación (solo familyadmin)
  static async deleteAssociation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/shared/${id}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al eliminar asociación');
    }
  }

  // Solicitar asociación por email (solo familyadmin)
  static async requestAssociation(email: string): Promise<any> {
    try {
      const response = await apiClient.post('/shared/request', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al solicitar asociación');
    }
  }
}

export default SharedService;
