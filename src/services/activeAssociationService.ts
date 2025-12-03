import { apiClient } from './api';

export interface ActiveAssociation {
  _id: string;
  activeShared: string;
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
  };
  role: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  division?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  student?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
  activatedAt: string;
}

export interface AvailableAssociation {
  _id: string;
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
  };
  role: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  division?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  student?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
  createdAt: string;
  isActive: boolean;
}

export class ActiveAssociationService {
  /**
   * Obtener la asociación activa del usuario
   */
  static async getActiveAssociation(): Promise<ActiveAssociation | null> {
    try {
      const response = await apiClient.get('/active-association');
      
      if (response.data.success && response.data.data) {
        const activeAssociation = response.data.data;
        
        // VALIDACIÓN CRÍTICA: Verificar que tenga estudiante si es necesario
        console.log('✅ [ActiveAssociationService] Asociación activa obtenida:', {
          id: activeAssociation._id,
          account: activeAssociation.account?.nombre,
          studentId: activeAssociation.student?._id,
          studentNombre: activeAssociation.student?.nombre,
          studentApellido: activeAssociation.student?.apellido,
          tieneStudent: !!activeAssociation.student
        });
        
        if (!activeAssociation.student) {
          console.warn('⚠️ [ActiveAssociationService] Asociación activa no tiene estudiante');
        }
        
        return activeAssociation;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [ActiveAssociationService] Error obteniendo asociación activa:', error);
      return null;
    }
  }
  
  /**
   * Forzar actualización de la asociación activa desde el backend
   * Útil cuando hay inconsistencias
   */
  static async forceRefreshActiveAssociation(): Promise<ActiveAssociation | null> {
    try {
      console.log('🔄 [ActiveAssociationService] Forzando actualización de asociación activa...');
      const activeAssociation = await this.getActiveAssociation();
      
      if (activeAssociation) {
        console.log('✅ [ActiveAssociationService] Asociación activa actualizada:', {
          studentId: activeAssociation.student?._id,
          studentNombre: activeAssociation.student?.nombre
        });
      }
      
      return activeAssociation;
    } catch (error: any) {
      console.error('❌ [ActiveAssociationService] Error forzando actualización:', error);
      return null;
    }
  }

  /**
   * Obtener todas las asociaciones disponibles del usuario
   */
  static async getAvailableAssociations(): Promise<AvailableAssociation[]> {
    try {
      const response = await apiClient.get('/active-association/available');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [ActiveAssociationService] Error obteniendo asociaciones disponibles:', error);
      return [];
    }
  }

  /**
   * Establecer una asociación como activa
   */
  static async setActiveAssociation(sharedId: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/active-association/set', {
        sharedId
      });
      
      if (response.data.success) {
        console.log('✅ [ActiveAssociationService] Asociación activa establecida:', sharedId);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ [ActiveAssociationService] Error estableciendo asociación activa:', error);
      return false;
    }
  }

  /**
   * Limpiar asociaciones activas inválidas (solo para administradores)
   */
  static async cleanupInvalidAssociations(): Promise<boolean> {
    try {
      const response = await apiClient.post('/active-association/cleanup');
      
      if (response.data.success) {
        console.log('✅ [ActiveAssociationService] Limpieza de asociaciones completada');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ [ActiveAssociationService] Error limpiando asociaciones:', error);
      return false;
    }
  }
}
