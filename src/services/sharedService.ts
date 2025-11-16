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
  isActive?: boolean;
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

export interface FamilyViewer {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: {
    _id: string;
    nombre: string;
  };
  createdAt: string;
}

class SharedService {
  // Obtener asociaciones del usuario
  static async getUserAssociations(): Promise<Shared[]> {
    try {
      console.log('🔍 [SHARED SERVICE] ===== OBTENIENDO ASOCIACIONES =====');
      console.log('🔍 [SHARED SERVICE] URL completa:', apiClient.defaults.baseURL + '/shared/user');
      
      const response = await apiClient.get('/shared/user');
      
      console.log('✅ [SHARED SERVICE] Respuesta recibida del servidor');
      console.log('📊 [SHARED SERVICE] Status:', response.status);
      console.log('📊 [SHARED SERVICE] Data recibida:', JSON.stringify(response.data, null, 2));
      
      const associations = response.data.data.associations || [];
      console.log('📦 [SHARED SERVICE] Asociaciones procesadas:', associations.length);
      
      associations.forEach((assoc: any, index: number) => {
        console.log(`📦 [SHARED SERVICE] Asociación ${index + 1}:`, {
          id: assoc._id,
          studentId: assoc.student?._id,
          studentName: assoc.student?.nombre,
          studentAvatar: assoc.student?.avatar,
          hasAvatar: !!assoc.student?.avatar,
          avatarType: assoc.student?.avatar ? (assoc.student.avatar.startsWith('http') ? 'URL completa' : 'Key de S3') : 'Sin avatar'
        });
      });
      
      return associations;
    } catch (error: any) {
      console.error('❌ [SHARED SERVICE] Error obteniendo asociaciones:', error);
      if (error.response?.data) {
        console.error('❌ [SHARED SERVICE] Error response data:', error.response.data);
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

  // Agregar familiar al estudiante (solo familyadmin)
  static async requestAssociation(data: {
    email: string;
    nombre: string;
    apellido: string;
    studentId: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/shared/request', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al agregar familiar');
    }
  }

  // Obtener familyviewers de un estudiante (solo familyadmin)
  static async getFamilyViewers(studentId: string): Promise<FamilyViewer[]> {
    try {
      console.log('🔍 [SHARED SERVICE] Obteniendo familyviewers para estudiante:', studentId);
      const response = await apiClient.get(`/shared/student/${studentId}/familyviewers`);
      console.log('✅ [SHARED SERVICE] Familyviewers obtenidos:', response.data.data.familyviewers.length);
      return response.data.data.familyviewers || [];
    } catch (error: any) {
      console.error('❌ [SHARED SERVICE] Error obteniendo familyviewers:', error);
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al obtener familyviewers');
    }
  }
}

export default SharedService;
