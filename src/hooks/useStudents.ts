import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface Student {
  _id: string;
  nombre: string;
  apellido: string;
  email?: string;
  dni: string;
  year: number;
  avatar?: string; // Campo para la foto del estudiante
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
  };
  division: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  total: number;
  loadStudents: (year?: number) => Promise<void>;
  refreshStudents: () => Promise<void>;
}

export const useStudents = (accountId?: string, divisionId?: string): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadStudents = async (year?: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!accountId) {
        setStudents([]);
        setTotal(0);
        return;
      }

      const params: any = {
        accountId
      };
      
      if (divisionId) {
        params.divisionId = divisionId;
      }
      
      if (year) {
        params.year = year;
      }

      const response = await apiClient.get('/students/by-account-division', { params });

      if (response.data.success) {
        setStudents(response.data.data.students);
        setTotal(response.data.data.total);
      } else {
        setError('Error al cargar los alumnos');
      }
    } catch (error: any) {
      console.error('❌ Error cargando alumnos:', error);
      setError(error.response?.data?.message || 'Error al cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const refreshStudents = async () => {
    await loadStudents();
  };

  useEffect(() => {
    loadStudents();
  }, [accountId, divisionId]);

  return {
    students,
    loading,
    error,
    total,
    loadStudents,
    refreshStudents,
  };
}; 