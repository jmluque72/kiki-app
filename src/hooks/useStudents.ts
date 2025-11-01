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
    // Si no hay accountId, no hacer nada y no establecer error
    if (!accountId) {
      setStudents([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const params: any = {
        accountId
      };
      
      if (divisionId) {
        params.divisionId = divisionId;
      }
      
      if (year) {
        params.year = year;
      }

      // CRÍTICO: Solo hacer la llamada si realmente hay accountId
      if (!accountId) {
        setStudents([]);
        setTotal(0);
        setError(null);
        setLoading(false);
        return;
      }
      
      const response = await apiClient.get('/students/by-account-division', { params });

      if (response.data.success) {
        setStudents(response.data.data.students);
        setTotal(response.data.data.total);
      } else {
        setError('Error al cargar los alumnos');
      }
    } catch (error: any) {
      // Solo establecer error si realmente hay un accountId válido
      // Si no hay accountId, no deberíamos estar aquí, pero por seguridad...
      if (accountId) {
        console.error('❌ Error cargando alumnos:', error);
        setError(error.response?.data?.message || 'Error al cargar los alumnos');
      } else {
        // Si no hay accountId, no establecer error
        console.log('ℹ️ [USE STUDENTS] No hay accountId, no se intentó cargar');
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshStudents = async () => {
    await loadStudents();
  };

  useEffect(() => {
    // VERIFICACIÓN ULTRA ESTRICTA: accountId debe ser string válido
    const hasValidAccountId = accountId !== null &&
                              accountId !== undefined &&
                              typeof accountId === 'string' && 
                              accountId.trim() !== '' && 
                              accountId !== 'undefined' &&
                              accountId !== 'null';
    
    // Si NO hay accountId válido, limpiar TODO inmediatamente y salir
    if (!hasValidAccountId) {
      setStudents([]);
      setTotal(0);
      setError(null); // CRÍTICO: NO establecer error
      setLoading(false);
      return; // SALIR INMEDIATAMENTE, no hacer nada más
    }
    
    // Solo si hay accountId válido, cargar estudiantes
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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