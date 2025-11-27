import { apiClient } from './api';

export interface Event {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar?: string;
  estado: 'activo' | 'finalizado' | 'cancelado';
  requiereAutorizacion?: boolean;
  creador: {
    _id: string;
    name: string;
    email: string;
  };
  institucion: {
    _id: string;
    nombre: string;
  };
  division?: {
    _id: string;
    nombre: string;
  };
  createdAt: string;
}

export interface CreateEventRequest {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar?: string;
  requiereAutorizacion?: boolean;
  institutionId?: string;
  divisionId?: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

class EventService {
  // Crear evento (solo coordinadores)
  static async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post('/events/create', eventData);
    return response.data.data;
  }

  // Obtener eventos por institución
  static async getEventsByInstitution(
    institutionId: string,
    page: number = 1,
    limit: number = 20,
    divisionId?: string
  ): Promise<EventsResponse> {
    const params: Record<string, string | number> = { page, limit };
    if (divisionId) params.divisionId = divisionId;
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get(
      `/events/institution/${institutionId}?${query}`
    );
    
    // Validar y normalizar la respuesta
    const data = response.data?.data || response.data;
    
    // Si la respuesta es un array directamente, convertirla al formato esperado
    if (Array.isArray(data)) {
      return {
        events: data,
        total: data.length,
        page: page,
        limit: limit
      };
    }
    
    // Si ya tiene el formato correcto, devolverlo
    return {
      events: data?.events || [],
      total: data?.total || 0,
      page: data?.page || page,
      limit: data?.limit || limit
    };
  }

  // Obtener eventos próximos
  static async getUpcomingEvents(institutionId: string): Promise<Event[]> {
    const response = await apiClient.get(
      `/events/institution/${institutionId}?limit=10`
    );
    const events: Event[] = response.data.data.events;
    
    // Filtrar eventos futuros
    const now = new Date();
    return events.filter(event => new Date(event.fecha) > now);
  }

  // Obtener eventos pasados
  static async getPastEvents(institutionId: string): Promise<Event[]> {
    const response = await apiClient.get(
      `/events/institution/${institutionId}?limit=50`
    );
    const events: Event[] = response.data.data.events;
    
    // Filtrar eventos pasados
    const now = new Date();
    return events.filter(event => new Date(event.fecha) <= now);
  }
}

export default EventService;
