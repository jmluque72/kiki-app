import { apiClient } from './api';

export interface FavoriteResponse {
  success: boolean;
  message: string;
}

export interface FavoriteCheckResponse {
  success: boolean;
  isFavorite: boolean;
}

export interface Favorite {
  _id: string;
  user: string;
  student: string;
  activity: any;
  addedAt: string;
}

export interface FavoritesListResponse {
  success: boolean;
  data: Favorite[];
}

class FavoriteService {
  /**
   * Agregar o quitar una actividad de favoritos
   */
  async toggleFavorite(activityId: string, studentId: string, isFavorite: boolean): Promise<FavoriteResponse> {
    try {
      console.log('❤️ [FavoriteService] Toggle favorite:', { activityId, studentId, isFavorite });
      
      const response = await apiClient.post(`/activities/${activityId}/favorite`, {
        studentId,
        isFavorite
      });

      console.log('✅ [FavoriteService] Toggle favorite response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [FavoriteService] Error toggling favorite:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar favorito');
    }
  }

  /**
   * Verificar si una actividad es favorita
   */
  async checkFavorite(activityId: string, studentId: string): Promise<boolean> {
    try {
      console.log('❤️ [FavoriteService] Checking favorite:', { activityId, studentId });
      
      // Debug: Mostrar URL
      const url = `${apiClient.defaults.baseURL}/activities/${activityId}/favorite/${studentId}`;
      console.log('🔍 [FavoriteService] Check favorite URL:', url);
      
      const response = await apiClient.get(`/activities/${activityId}/favorite/${studentId}`);
      
      console.log('✅ [FavoriteService] Check favorite response:', response.data);
      return response.data.isFavorite;
    } catch (error: any) {
      console.error('❌ [FavoriteService] Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Obtener todos los favoritos de un estudiante
   */
  async getStudentFavorites(studentId: string): Promise<Favorite[]> {
    try {
      console.log('❤️ [FavoriteService] Getting student favorites:', studentId);
      
      const response = await apiClient.get(`/students/${studentId}/favorites`);
      
      console.log('✅ [FavoriteService] Get favorites response:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ [FavoriteService] Error getting favorites:', error);
      return [];
    }
  }
}

export default new FavoriteService();
