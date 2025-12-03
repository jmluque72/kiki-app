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
  titulo?: string;
  datos: any;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos para acciones diarias
  esAccionDiaria?: boolean;
  accion?: {
    _id: string;
    nombre: string;
    color: string;
    categoria?: string;
  };
  valor?: string;
  fechaAccion?: string;
  comentarios?: string;
}

export interface UseActivitiesReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useActivities = (accountId?: string, divisionId?: string, selectedDate?: Date | null, studentId?: string): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log cuando cambian los parámetros del hook
  useEffect(() => {
    console.log('📅 [useActivities] Hook recibió nuevos parámetros:', {
      accountId,
      divisionId,
      selectedDate,
      selectedDateType: typeof selectedDate,
      selectedDateIsNull: selectedDate === null,
      selectedDateIsUndefined: selectedDate === undefined,
      selectedDateValue: selectedDate ? selectedDate.toISOString() : 'null/undefined'
    });
  }, [accountId, divisionId, selectedDate]);

  const fetchActivities = async () => {
    console.log('📅 [useActivities] fetchActivities called with:', { 
      accountId, 
      divisionId, 
      selectedDate,
      selectedDateType: typeof selectedDate,
      selectedDateIsNull: selectedDate === null,
      selectedDateIsUndefined: selectedDate === undefined,
      selectedDateValue: selectedDate ? selectedDate.toString() : 'null/undefined',
      selectedDateISO: selectedDate ? selectedDate.toISOString() : 'null/undefined'
    });
    
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
        const dateStr = selectedDate.toISOString();
        params.append('selectedDate', dateStr);
        console.log('📅 [useActivities] ✅ Fecha presente, agregando a params:', dateStr);
        console.log('📅 [useActivities] Fecha original:', selectedDate);
        console.log('📅 [useActivities] Fecha ISO:', dateStr);
      } else {
        console.log('📅 [useActivities] ⚠️ selectedDate es null/undefined, NO se agregará a params');
      }

      const url = `/activities/mobile?${params.toString()}`;
      console.log('📅 [useActivities] URL completa:', url);
      console.log('📅 [useActivities] Params string:', params.toString());
      
      const response = await apiClient.get(url);
      console.log('useActivities - API response:', response.data);
      
      if (response.data.success) {
        let activitiesData = response.data.data.activities;
        console.log('🔍 Debug - Activities received from API:', JSON.stringify(activitiesData, null, 2));
        console.log('📊 Debug - Number of activities:', activitiesData.length);
        
        // Cargar acciones diarias si hay un estudiante activo
        let dailyActions: Activity[] = [];
        console.log('🔍 [useActivities] Verificando studentId:', {
          studentId,
          tieneStudentId: !!studentId,
          tipo: typeof studentId,
          studentIdString: studentId?.toString()
        });
        
        // VALIDACIÓN: Si no hay studentId, no cargar acciones diarias
        if (!studentId) {
          console.warn('⚠️ [useActivities] No hay studentId, no se cargarán acciones diarias');
        } else if (studentId) {
          try {
            console.log('🔄 [useActivities] Cargando acciones diarias para estudiante:', studentId);
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
              console.log('📅 [useActivities] Fecha seleccionada, buscando acciones del:', fechaInicio, 'al', fechaFin);
            } else {
              // Si no hay fecha, buscar desde hace 7 días hasta mañana (para asegurar que incluya hoy)
              // Usar fecha local para evitar problemas de timezone
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
              
              console.log('📅 [useActivities] Sin fecha seleccionada, buscando acciones desde:', fechaInicio, 'hasta:', fechaFin);
              console.log('📅 [useActivities] Fecha de hoy (local):', formatDateLocal(today));
              console.log('📅 [useActivities] Fecha de hoy (ISO):', today.toISOString().split('T')[0]);
            }
            
            const url = `/student-actions/log/student/${studentId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            console.log('🔗 [useActivities] URL de acciones diarias:', url);
            
            const actionsResponse = await apiClient.get(url);
            
            console.log('📥 [useActivities] Respuesta de acciones diarias:', {
              success: actionsResponse.data.success,
              dataLength: actionsResponse.data.data?.length || 0
            });
            
            if (actionsResponse.data.success) {
              const actionLogs = actionsResponse.data.data || [];
              console.log('✅ [useActivities] Acciones diarias cargadas:', actionLogs.length);
              
              if (actionLogs.length > 0) {
                console.log('📋 [useActivities] Primera acción diaria:', {
                  id: actionLogs[0]._id,
                  accion: actionLogs[0].accion?.nombre,
                  valor: actionLogs[0].valor,
                  fechaAccion: actionLogs[0].fechaAccion
                });
              }
              
              // Convertir acciones diarias al formato de Activity
              dailyActions = actionLogs.map((log: any) => {
                // Construir descripción: nombre de la acción + valor si existe
                let descripcion = log.accion?.nombre || 'Acción sin nombre';
                if (log.valor && log.valor.trim().length > 0) {
                  descripcion = `${descripcion} - ${log.valor}`;
                }
                
                const actionActivity = {
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
                
                console.log('🔄 [useActivities] Acción diaria convertida:', {
                  id: actionActivity._id,
                  titulo: actionActivity.titulo,
                  descripcion: actionActivity.descripcion,
                  fechaAccion: actionActivity.fechaAccion,
                  tieneValor: !!actionActivity.valor,
                  valor: actionActivity.valor
                });
                
                return actionActivity;
              });
              
              console.log('✅ [useActivities] Total acciones diarias convertidas:', dailyActions.length);
            } else {
              console.warn('⚠️ [useActivities] Respuesta de acciones diarias no exitosa:', actionsResponse.data);
            }
          } catch (err: any) {
            console.error('❌ [useActivities] Error cargando acciones diarias:', err);
            console.error('❌ [useActivities] Error details:', {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
              url: err.config?.url,
              method: err.config?.method,
              stack: err.stack
            });
            // Continuar aunque falle, pero mostrar el error claramente
            // No lanzar el error para que no interrumpa la carga de actividades normales
            dailyActions = [];
          }
        } else {
          console.warn('⚠️ [useActivities] No hay studentId, no se cargarán acciones diarias. studentId recibido:', studentId);
        }
        
        // Combinar actividades y acciones diarias
        const allActivities = [...activitiesData, ...dailyActions];
        
        console.log('📊 [useActivities] Total actividades combinadas:', {
          actividades: activitiesData.length,
          accionesDiarias: dailyActions.length,
          total: allActivities.length,
          actividadesIds: activitiesData.map((a: Activity) => a._id),
          accionesDiariasIds: dailyActions.map((a: Activity) => a._id)
        });
        
        // Verificar que las acciones diarias tienen el flag correcto
        dailyActions.forEach((action, index) => {
          if (!action.esAccionDiaria) {
            console.error(`❌ [useActivities] Acción diaria ${index} NO tiene el flag esAccionDiaria!`, action);
          }
        });
        
        // Ordenar por fecha (más reciente primero)
        allActivities.sort((a, b) => {
          const dateA = new Date(a.esAccionDiaria ? a.fechaAccion || a.createdAt : a.createdAt).getTime();
          const dateB = new Date(b.esAccionDiaria ? b.fechaAccion || b.createdAt : b.createdAt).getTime();
          return dateB - dateA;
        });
        
        // Log específico para imágenes y acciones diarias
        allActivities.forEach((activity: Activity, index: number) => {
          if (activity.esAccionDiaria) {
            console.log(`✅ [useActivities] Acción diaria ${index + 1}:`, {
              id: activity._id,
              titulo: activity.titulo,
              descripcion: activity.descripcion,
              esAccionDiaria: activity.esAccionDiaria,
              fechaAccion: activity.fechaAccion,
              createdAt: activity.createdAt,
              accion: activity.accion,
              valor: activity.valor
            });
          } else {
            console.log(`🔍 [useActivities] Actividad normal ${index + 1}:`, {
              id: activity._id,
              titulo: activity.titulo,
              descripcion: activity.descripcion,
              esAccionDiaria: activity.esAccionDiaria,
              imagenes: (activity as any).imagenes || []
            });
          }
        });
        
        console.log('✅ [useActivities] Estableciendo actividades en el estado. Total:', allActivities.length);
        setActivities(allActivities);
        console.log('✅ [useActivities] Actividades establecidas en el estado');
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

  // Convertir selectedDate a string para que React detecte cambios correctamente
  // Los objetos Date se comparan por referencia, no por valor
  const selectedDateString = selectedDate ? selectedDate.toISOString() : null;
  
  useEffect(() => {
    console.log('📅 [useActivities] useEffect ejecutado con dependencias:', {
      accountId,
      divisionId,
      selectedDate: selectedDate ? selectedDate.toISOString() : 'null',
      selectedDateString,
      studentId
    });
    fetchActivities();
  }, [accountId, divisionId, selectedDateString, studentId]);

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