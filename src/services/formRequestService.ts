import { apiClient } from './api';

export interface FormQuestion {
  _id: string;
  tipo: 'texto' | 'opcion_multiple' | 'checkbox' | 'imagen' | 'archivo';
  texto: string;
  requerido: boolean;
  opciones?: string[];
  orden: number;
}

export interface FormRequest {
  _id: string;
  nombre: string;
  descripcion?: string;
  formRequest: {
    _id: string;
    nombre: string;
    descripcion?: string;
    preguntas: FormQuestion[];
  };
  division: {
    _id: string;
    nombre: string;
  };
  requerido: boolean;
  hasDraft?: boolean;
  completado?: boolean;
  estado?: 'en_progreso' | 'completado' | 'aprobado' | 'rechazado';
  fechaCompletado?: string;
  fechaAprobacion?: string;
  motivoRechazo?: string;
}

export interface FormResponse {
  _id?: string;
  formRequest: string;
  student: string;
  tutor: string;
  respuestas: Array<{
    preguntaId: string;
    valor: string | string[];
  }>;
  completado: boolean;
  estado?: 'en_progreso' | 'completado' | 'aprobado' | 'rechazado';
  fechaCompletado?: string;
  fechaAprobacion?: string;
  motivoRechazo?: string;
}

export interface SaveFormResponseRequest {
  studentId: string;
  respuestas: Array<{
    preguntaId: string;
    valor: string | string[];
  }>;
  completado: boolean;
}

class FormRequestService {
  // Obtener formularios pendientes para un tutor y estudiante
  static async getPendingForms(tutorId: string, studentId: string): Promise<FormRequest[]> {
    const response = await apiClient.get(
      `/api/form-requests/pending/tutor/${tutorId}/student/${studentId}`
    );
    return response.data.data;
  }

  // Obtener todos los formularios (pendientes y completados) para un tutor y estudiante
  static async getAllForms(tutorId: string, studentId: string): Promise<FormRequest[]> {
    const response = await apiClient.get(
      `/api/form-requests/all/tutor/${tutorId}/student/${studentId}`
    );
    return response.data.data;
  }

  // Obtener respuesta guardada de un formulario
  static async getFormResponse(formId: string, studentId: string, tutorId: string): Promise<FormResponse | null> {
    try {
      const response = await apiClient.get(
        `/api/form-requests/${formId}/responses/student/${studentId}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Guardar o actualizar respuesta de formulario
  static async saveFormResponse(
    formId: string,
    data: SaveFormResponseRequest
  ): Promise<FormResponse> {
    const response = await apiClient.post(
      `/api/form-requests/${formId}/responses`,
      data
    );
    return response.data.data;
  }

  // Verificar si hay formularios requeridos pendientes
  static async checkRequiredFormsPending(tutorId: string, studentId: string): Promise<boolean> {
    const response = await apiClient.get(
      `/api/form-requests/check-required/${tutorId}/${studentId}`
    );
    return response.data.data.hasRequiredPending;
  }
}

export default FormRequestService;

