import { apiClient } from './api';

export interface Document {
  _id: string;
  titulo: string;
  tipo: string;
  archivo: {
    url: string;
    nombre: string;
    key: string;
    tamaño: number;
    tipoMime: string;
  };
  institucion: {
    _id: string;
    nombre: string;
  };
  subidoPor: {
    _id: string;
    nombre: string;
    email: string;
  };
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

class DocumentService {
  /**
   * Obtener todos los documentos de la institución activa
   */
  async getDocuments(institucionId: string): Promise<Document[]> {
    try {
      const response = await apiClient.get(`/documents?institucionId=${institucionId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener documentos');
      }
    } catch (error: any) {
      console.error('Error al obtener documentos:', error);
      
      if (error.response?.status === 404) {
        throw new Error('No se encontraron documentos para esta institución');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener documentos');
    }
  }
}

export default new DocumentService();
