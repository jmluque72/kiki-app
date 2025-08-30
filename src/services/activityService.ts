import { apiClient } from './api';

export interface DeleteActivityResponse {
  success: boolean;
  message: string;
}

export class ActivityService {
  static async deleteActivity(activityId: string): Promise<DeleteActivityResponse> {
    try {
      console.log('🗑️ [ActivityService] Eliminando actividad:', activityId);
      
      const response = await apiClient.delete(`/activities/${activityId}`);
      
      console.log('✅ [ActivityService] Actividad eliminada exitosamente');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [ActivityService] Error eliminando actividad:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error al eliminar la actividad'
      };
    }
  }
}
