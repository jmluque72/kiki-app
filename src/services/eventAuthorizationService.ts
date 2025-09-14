import { apiClient } from './api';

export interface EventAuthorization {
  _id: string;
  event: string;
  student: {
    _id: string;
    nombre: string;
    apellido: string;
  };
  familyadmin: {
    _id: string;
    name: string;
    email: string;
  };
  autorizado: boolean;
  fechaAutorizacion?: string;
  comentarios?: string;
}

export interface StudentWithoutAuth {
  _id: string;
  nombre: string;
  apellido: string;
}

export interface StudentPending {
  _id: string;
  nombre: string;
  apellido: string;
  hasResponse: boolean;
  autorizado: boolean;
}

export interface AuthorizationSummary {
  total: number;
  autorizados: number;
  pendientes: number;
  rechazados: number;
  sinRespuesta: number;
}

export interface EventAuthorizationsResponse {
  event: {
    _id: string;
    titulo: string;
    fecha: string;
    hora: string;
    institucion: {
      _id: string;
      nombre: string;
    };
    division?: {
      _id: string;
      nombre: string;
    };
  };
  authorizations: EventAuthorization[];
  studentsWithoutAuth: StudentWithoutAuth[];
  allStudentsPending: StudentPending[];
  summary: AuthorizationSummary;
}

export interface AuthorizationCheckResponse {
  event: {
    _id: string;
    titulo: string;
    requiereAutorizacion: boolean;
  };
  authorization?: {
    _id: string;
    autorizado: boolean;
    fechaAutorizacion?: string;
    comentarios?: string;
  };
}

class EventAuthorizationService {
  // Autorizar evento (solo familyadmin)
  static async authorizeEvent(
    eventId: string, 
    studentId: string, 
    autorizado: boolean, 
    comentarios?: string
  ): Promise<EventAuthorization> {
    const response = await apiClient.post(`/events/${eventId}/authorize`, {
      studentId,
      autorizado,
      comentarios
    });
    return response.data.data;
  }

  // Obtener autorizaciones de un evento (solo coordinadores)
  static async getEventAuthorizations(eventId: string): Promise<EventAuthorizationsResponse> {
    const response = await apiClient.get(`/events/${eventId}/authorizations`);
    return response.data.data;
  }

  // Verificar autorización de un evento para un estudiante (para familyadmin)
  static async checkEventAuthorization(
    eventId: string, 
    studentId: string
  ): Promise<AuthorizationCheckResponse> {
    const response = await apiClient.get(`/events/${eventId}/authorization/${studentId}`);
    return response.data.data;
  }
}

export default EventAuthorizationService;
