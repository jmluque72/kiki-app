import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Activity } from './useActivities';

export interface UseDailyActionsReturn {
  dailyActions: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDailyActions = (studentId?: string | null, selectedDate?: Date | null): UseDailyActionsReturn => {
  const [dailyActions, setDailyActions] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyActions = async () => {
    if (!studentId) {
      console.log('⚠️ [useDailyActions] No hay studentId, no se cargarán acciones diarias');
      setDailyActions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir rango de fechas
      let fechaInicio: string;
      let fechaFin: string;
      
      if (selectedDate) {
        // Si hay fecha seleccionada, buscar solo ese día
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        fechaInicio = startOfDay.toISOString().split('T')[0];
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        fechaFin = endOfDay.toISOString().split('T')[0];
        console.log('📅 [useDailyActions] Fecha seleccionada, buscando acciones del:', fechaInicio, 'al', fechaFin);
      } else {
        // Si no hay fecha, buscar desde hace 7 días hasta mañana (para asegurar que incluya hoy)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Formatear fechas en formato YYYY-MM-DD usando fecha local
        const formatDateLocal = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        fechaFin = formatDateLocal(tomorrow);
        
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        fechaInicio = formatDateLocal(startDate);
        
        console.log('📅 [useDailyActions] Sin fecha seleccionada, buscando acciones desde:', fechaInicio, 'hasta:', fechaFin);
      }
      
      const url = `/student-actions/log/student/${studentId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      console.log('🔗 [useDailyActions] URL de acciones diarias:', url);
      
      const actionsResponse = await apiClient.get(url);
      
      console.log('📥 [useDailyActions] Respuesta de acciones diarias:', {
        success: actionsResponse.data.success,
        dataLength: actionsResponse.data.data?.length || 0
      });
      
      if (actionsResponse.data.success) {
        const actionLogs = actionsResponse.data.data || [];
        console.log('✅ [useDailyActions] Acciones diarias cargadas:', actionLogs.length);
        
        // Convertir acciones diarias al formato de Activity
        const convertedActions: Activity[] = actionLogs.map((log: any) => {
          // Construir descripción: nombre de la acción + valor si existe
          let descripcion = log.accion?.nombre || 'Acción sin nombre';
          if (log.valor && log.valor.trim().length > 0) {
            descripcion = `${descripcion} - ${log.valor}`;
          }
          
          return {
            _id: log._id,
            esAccionDiaria: true,
            accion: log.accion,
            valor: log.valor || undefined,
            fechaAccion: log.fechaAccion,
            comentarios: log.comentarios || undefined,
            titulo: log.accion?.nombre || 'Acción diaria',
            descripcion: log.comentarios || descripcion,
            createdAt: log.fechaAccion,
            updatedAt: log.fechaAccion,
            tipo: 'accion_diaria',
            entidad: 'student_action',
            entidadId: log._id,
            usuario: log.registradoPor || { _id: '', name: '', email: '' },
            account: { _id: '', nombre: '', razonSocial: '' },
            division: null,
            datos: {},
            activo: true,
            imagenes: []
          } as Activity;
        });
        
        // Ordenar por fecha (más reciente primero)
        convertedActions.sort((a, b) => {
          const dateA = new Date(a.fechaAccion || a.createdAt).getTime();
          const dateB = new Date(b.fechaAccion || b.createdAt).getTime();
          return dateB - dateA;
        });
        
        console.log('✅ [useDailyActions] Total acciones diarias convertidas:', convertedActions.length);
        setDailyActions(convertedActions);
      } else {
        console.warn('⚠️ [useDailyActions] Respuesta de acciones diarias no exitosa:', actionsResponse.data);
        setDailyActions([]);
      }
    } catch (err: any) {
      console.error('❌ [useDailyActions] Error cargando acciones diarias:', err);
      console.error('❌ [useDailyActions] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        method: err.config?.method
      });
      setError(err.response?.data?.message || err.message || 'Error al cargar acciones diarias');
      setDailyActions([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir selectedDate a string para que React detecte cambios correctamente
  const selectedDateString = selectedDate ? selectedDate.toISOString() : null;
  
  useEffect(() => {
    console.log('📅 [useDailyActions] useEffect ejecutado con dependencias:', {
      studentId,
      selectedDate: selectedDate ? selectedDate.toISOString() : 'null',
      selectedDateString
    });
    fetchDailyActions();
  }, [studentId, selectedDateString]);

  const refetch = () => {
    fetchDailyActions();
  };

  return {
    dailyActions,
    loading,
    error,
    refetch
  };
};


