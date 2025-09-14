import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface Activity {
  _id: string;
  usuario: {
    _id: string;
    name: string;
    email: string;
  };
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
  };
  division?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  tipo: string;
  entidad: string;
  entidadId: string;
  descripcion: string;
  datos: any;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UseActivitiesReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useActivities = (accountId?: string, divisionId?: string, selectedDate?: Date | null): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    console.log('useActivities - fetchActivities called with:', { accountId, divisionId, selectedDate });
    
    if (!accountId) {
      console.log('useActivities - No accountId provided, setting empty activities');
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('accountId', accountId);
      if (divisionId) {
        params.append('divisionId', divisionId);
      }
      if (selectedDate) {
        params.append('selectedDate', selectedDate.toISOString());
      }

      const url = `/activities/mobile?${params.toString()}`;
      console.log('useActivities - Calling API:', url);
      
      const response = await apiClient.get(url);
      console.log('useActivities - API response:', response.data);
      
      if (response.data.success) {
        const activitiesData = response.data.data.activities;
        console.log('🔍 Debug - Activities received from API:', JSON.stringify(activitiesData, null, 2));
        console.log('📊 Debug - Number of activities:', activitiesData.length);
        
        // Log específico para imágenes
        activitiesData.forEach((activity: Activity, index: number) => {
          console.log(`🔍 Debug - Activity ${index + 1}:`, {
            id: activity._id,
            titulo: activity.titulo,
            descripcion: activity.descripcion,
            participantes: activity.participantes,
            imagenes: activity.imagenes || []
          });
        });
        
        setActivities(activitiesData);
        console.log('useActivities - Activities set:', activitiesData);
      } else {
        setError(response.data.message || 'Error al obtener actividades');
        console.log('useActivities - API error:', response.data.message);
      }
    } catch (err: any) {
      console.error('useActivities - Error fetching activities:', err);
      setError(err.response?.data?.message || 'Error al obtener actividades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [accountId, divisionId, selectedDate]);

  const refetch = () => {
    fetchActivities();
  };

  return {
    activities,
    loading,
    error,
    refetch
  };
}; 