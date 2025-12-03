import { apiClient } from './api';

export interface CreateTutorActionRequest {
  actionType: string;
  actionTitle: string;
  comment: string;
  studentId: string;
  divisionId: string;
}

export interface TutorAction {
  _id: string;
  actionType: string;
  actionTitle: string;
  comment: string;
  student: {
    _id: string;
    nombre: string;
    apellido: string;
  };
  division: {
    _id: string;
    nombre: string;
  };
  tutor: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

class TutorActionService {
  async createTutorAction(data: CreateTutorActionRequest): Promise<TutorAction> {
    try {
      console.log('📤 [TUTOR ACTION SERVICE] Enviando acción:', data);
      const response = await apiClient.post('/tutor-actions', data);
      console.log('✅ [TUTOR ACTION SERVICE] Respuesta recibida:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ [TUTOR ACTION SERVICE] Error completo:', error);
      console.error('❌ [TUTOR ACTION SERVICE] Error response:', error.response?.data);
      console.error('❌ [TUTOR ACTION SERVICE] Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar la comunicación';
      throw new Error(errorMessage);
    }
  }
}

export default new TutorActionService();

