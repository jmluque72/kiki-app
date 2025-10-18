import { apiClient } from './api';

export interface Pickup {
  _id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  relacion: string;
  division: {
    _id: string;
    nombre: string;
  };
  student: {
    _id: string;
    name: string;
    apellido: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreatePickupRequest {
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  relacion: string;
  divisionId: string;
  studentId: string;
}

export interface UpdatePickupRequest {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  relacion?: string;
  status?: 'active' | 'inactive';
}

export interface PickupsResponse {
  pickups: Pickup[];
  total: number;
  page: number;
  limit: number;
}

class PickupService {
  // Obtener lista de quién retira para familyadmin
  static async getPickups(params?: {
    division?: string;
    student?: string;
    page?: number;
    limit?: number;
  }): Promise<PickupsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.division) queryParams.append('division', params.division);
    if (params?.student) queryParams.append('student', params.student);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/pickups/familyadmin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    return response.data.data;
  }

  // Obtener quién retira por ID
  static async getPickupById(id: string): Promise<Pickup> {
    const response = await apiClient.get(`/pickup/${id}`);
    return response.data.data.pickup;
  }

  // Crear nuevo quién retira para familyadmin
  static async createPickup(data: CreatePickupRequest): Promise<Pickup> {
    try {
      const response = await apiClient.post('/pickups/familyadmin', data);
      return response.data.data.pickup;
    } catch (error: any) {
      // Propagar el error del servidor para que el componente pueda manejarlo
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Error al crear persona autorizada');
    }
  }

  // Actualizar quién retira
  static async updatePickup(id: string, data: UpdatePickupRequest): Promise<Pickup> {
    const response = await apiClient.put(`/pickup/${id}`, data);
    return response.data.data.pickup;
  }

  // Eliminar quién retira
  static async deletePickup(id: string): Promise<void> {
    await apiClient.delete(`/pickup/${id}`);
  }

  // Alias para compatibilidad
  static async delete(id: string): Promise<void> {
    return this.deletePickup(id);
  }

  // Obtener divisiones disponibles
  static async getDivisions(): Promise<any[]> {
    const response = await apiClient.get('/divisions');
    return response.data.data.divisions || [];
  }

  // Obtener estudiantes por división
  static async getStudentsByDivision(divisionId: string): Promise<any[]> {
    const response = await apiClient.get(`/students/division/${divisionId}`);
    return response.data.data.students || [];
  }

  // Obtener quién retira por estudiante
  static async getPickupsByStudent(studentId: string): Promise<Pickup[]> {
    const response = await apiClient.get(`/pickup/student/${studentId}`);
    return response.data.data.pickups || [];
  }

  // Obtener quién retira por división
  static async getPickupsByDivision(divisionId: string): Promise<Pickup[]> {
    const response = await apiClient.get(`/pickups/familyadmin?division=${divisionId}`);
    return response.data.data.pickups || [];
  }

  // Activar/desactivar quién retira
  static async togglePickupStatus(id: string, status: 'active' | 'inactive'): Promise<Pickup> {
    const response = await apiClient.patch(`/pickup/${id}/status`, { status });
    return response.data.data.pickup;
  }

  // Validar DNI único
  static async validateDNI(dni: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ dni });
      if (excludeId) params.append('excludeId', excludeId);
      
      const response = await apiClient.get(`/pickup/validate-dni?${params.toString()}`);
      return response.data.data.isValid;
    } catch (error) {
      return false;
    }
  }

  // Buscar quién retira por nombre o DNI
  static async searchPickups(query: string): Promise<Pickup[]> {
    const response = await apiClient.get(`/pickup/search?q=${encodeURIComponent(query)}`);
    return response.data.data.pickups || [];
  }
}

export default PickupService;
