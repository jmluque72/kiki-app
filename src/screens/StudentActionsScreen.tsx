import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContextHybrid';
import { useInstitution } from '../../contexts/InstitutionContext';
import { apiClient } from '../services/api';
import { useStudents } from '../hooks/useStudents';
import CustomCalendar from '../../components/CustomCalendar';

interface Student {
  _id: string;
  nombre: string;
  apellido: string;
  avatar?: string;
  division?: {
    nombre: string;
  };
}

interface StudentAction {
  _id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  categoria: string;
  icono?: string;
  valores?: string[]; // Valores posibles que puede tomar la acción
}

interface StudentActionLog {
  _id: string;
  estudiante: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  };
  accion: {
    _id: string;
    nombre: string;
    descripcion?: string;
    color: string;
    categoria: string;
    icono?: string;
  };
  registradoPor: {
    _id: string;
    name: string;
    email: string;
  };
  fechaAccion: string;
  comentarios?: string;
  valor?: string; // Valor seleccionado de la acción (ej: "1 vez", "2 veces")
  imagenes: string[];
  estado: 'registrado' | 'confirmado' | 'rechazado';
}

interface StudentActionsScreenProps {
  onBack?: () => void;
}

// ESTA PANTALLA ES SOLO PARA COORDINADORES
// Para roles familiares se usa FamilyActionsCalendarScreen
const StudentActionsScreen: React.FC<StudentActionsScreenProps> = ({ onBack }) => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution } = useInstitution();
  
  // Esta pantalla SOLO es para coordinadores
  // Cargar estudiantes desde la API
  const { students, loading: studentsLoading, error: studentsError, refreshStudents } = useStudents(
    selectedInstitution?.account?._id || selectedInstitution?._id,
    activeAssociation?.division?._id || selectedInstitution?.division?._id
  );
  
  const [actions, setActions] = useState<StudentAction[]>([]);
  
  // Nuevos estados para selección múltiple
  // Estructura: { actionId: { action: StudentAction, selectedValues: string[] } }
  const [selectedActions, setSelectedActions] = useState<{ [key: string]: { action: StudentAction; selectedValues: string[] } }>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Array de IDs de estudiantes
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateString, setSelectedDateString] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [comments, setComments] = useState<string>('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);
  
  // Estados para el calendario y visualización
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [calendarActionsByDate, setCalendarActionsByDate] = useState<{ [key: string]: number }>({});
  const [calendarActionsList, setCalendarActionsList] = useState<StudentActionLog[]>([]); // Guardar todas las acciones cargadas
  const [viewingDayActions, setViewingDayActions] = useState<StudentActionLog[]>([]);
  const [selectedViewDate, setSelectedViewDate] = useState<string | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Esta pantalla es SOLO para coordinadores, siempre pueden registrar acciones y ver el calendario
  const canRegisterActions = () => true;
  const shouldShowCalendar = () => true;

  useEffect(() => {
    // Cargar acciones disponibles y calendario
    loadActions();
    loadCalendarActions();
  }, []);

  useEffect(() => {
    // Recargar acciones del calendario cuando cambia la semana, asociación o estudiantes
    loadCalendarActions();
  }, [currentWeek, activeAssociation, students.length]);

  // Este useEffect ya no es necesario con el nuevo flujo de selección múltiple

  const loadActions = async () => {
    try {
      if (!activeAssociation?.division?._id) {
        console.log('⚠️ [ACTIONS] No hay división seleccionada');
        setActions([]);
        setActionsError(null);
        return;
      }
      
      setLoadingActions(true);
      setActionsError(null);
      
      console.log('🔄 [ACTIONS] Cargando acciones para división:', activeAssociation.division._id);
      const response = await apiClient.get(`/student-actions/division/${activeAssociation.division._id}`);
      
      console.log('✅ [ACTIONS] Respuesta recibida:', JSON.stringify(response.data, null, 2));
      const acciones = response.data.data || [];
      console.log('✅ [ACTIONS] Acciones cargadas:', acciones.length);
      console.log('✅ [ACTIONS] Detalles de acciones:', acciones.map((a: StudentAction) => ({
        _id: a._id,
        nombre: a.nombre,
        descripcion: a.descripcion,
        color: a.color,
        valores: a.valores,
        tieneValores: !!(a.valores && a.valores.length > 0)
      })));
      
      // Verificar si hay acciones con valores
      const accionesConValores = acciones.filter((a: StudentAction) => a.valores && a.valores.length > 0);
      console.log('✅ [ACTIONS] Acciones con valores:', accionesConValores.length);
      if (accionesConValores.length > 0) {
        console.log('✅ [ACTIONS] Ejemplo de valores:', accionesConValores[0].valores);
      }
      
      if (acciones.length === 0) {
        console.log('⚠️ [ACTIONS] No hay acciones configuradas para esta división');
        setActionsError('No hay acciones configuradas');
      }
      
      setActions(acciones);
      console.log('✅ [ACTIONS] Estado actions actualizado:', acciones.length, 'acciones');
    } catch (error: any) {
      console.error('❌ [ACTIONS] Error cargando acciones:', error);
      console.error('❌ [ACTIONS] Error response:', error.response?.data);
      console.error('❌ [ACTIONS] Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'No se pudieron cargar las acciones';
      
      setActions([]);
      setActionsError(errorMessage);
      console.log('⚠️ [ACTIONS] Error:', errorMessage);
    } finally {
      setLoadingActions(false);
    }
  };

  // Esta función ya no se necesita con el nuevo flujo de selección múltiple

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Domingo de la semana
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sábado de la semana
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const loadCalendarActions = async () => {
    try {
      setLoadingCalendar(true);
      
      // Calcular inicio y fin de la semana
      const startDate = getWeekStart(currentWeek);
      const endDate = getWeekEnd(currentWeek);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Coordinador: cargar acciones de toda la división
      if (!activeAssociation?.division?._id) {
        console.log('⚠️ [CALENDAR] No hay división');
        setCalendarActionsList([]);
        setCalendarActionsByDate({});
        return;
      }
      
      const response = await apiClient.get(
        `/student-actions/log/division/${activeAssociation.division._id}?fechaInicio=${startDateStr}&fechaFin=${endDateStr}`
      );
      const actions = response.data.data || [];
      
      // Guardar todas las acciones cargadas para filtrar después
      setCalendarActionsList(actions);
      
      // Agrupar acciones por fecha (normalizando a fecha local)
      const actionsByDate: { [key: string]: number } = {};
      actions.forEach(action => {
        // Convertir la fecha a objeto Date y luego a string local para evitar problemas de timezone
        const actionDate = new Date(action.fechaAccion);
        const year = actionDate.getFullYear();
        const month = String(actionDate.getMonth() + 1).padStart(2, '0');
        const day = String(actionDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        actionsByDate[dateStr] = (actionsByDate[dateStr] || 0) + 1;
      });
      
      setCalendarActionsByDate(actionsByDate);
      console.log('✅ [CALENDAR] Acciones de la semana cargadas:', Object.keys(actionsByDate).length, 'días con acciones');
      console.log('📊 [CALENDAR] Total acciones:', actions.length);
      console.log('📊 [CALENDAR] Desglose por fecha:', actionsByDate);
    } catch (error) {
      console.error('❌ [CALENDAR] Error cargando acciones del calendario:', error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleDaySelect = async (date: Date) => {
    // Normalizar la fecha a formato local (YYYY-MM-DD) para evitar problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Verificar el conteo esperado antes de cargar
    const expectedCount = calendarActionsByDate[dateStr] || 0;
    console.log('🔍 [CALENDAR] Seleccionando día:', dateStr, 'Fecha objeto:', date, 'Acciones esperadas según indicador:', expectedCount);
    console.log('🔍 [CALENDAR] Fechas disponibles en calendario:', Object.keys(calendarActionsByDate));
    console.log('🔍 [CALENDAR] Total acciones en memoria:', calendarActionsList.length);
    
    setSelectedViewDate(dateStr);
    
    // Si no hay acciones según el indicador, limpiar la lista
    if (expectedCount === 0) {
      console.log('ℹ️ [CALENDAR] No hay acciones según indicador, limpiando lista');
      setViewingDayActions([]);
      return;
    }
    
    // Filtrar acciones directamente de las ya cargadas (evita problemas de timezone con nueva consulta)
    const filteredActions = calendarActionsList.filter(a => {
      if (!a.fechaAccion) return false;
      const actionDate = new Date(a.fechaAccion);
      const actionYear = actionDate.getFullYear();
      const actionMonth = String(actionDate.getMonth() + 1).padStart(2, '0');
      const actionDay = String(actionDate.getDate()).padStart(2, '0');
      const actionDateStr = `${actionYear}-${actionMonth}-${actionDay}`;
      return actionDateStr === dateStr;
    });
    
    console.log('✅ [CALENDAR] Acciones filtradas del día:', filteredActions.length, 'de', calendarActionsList.length, 'total para fecha:', dateStr);
    console.log('📋 [CALENDAR] Detalle acciones filtradas:', filteredActions.map(a => {
      const actionDate = new Date(a.fechaAccion);
      const actionYear = actionDate.getFullYear();
      const actionMonth = String(actionDate.getMonth() + 1).padStart(2, '0');
      const actionDay = String(actionDate.getDate()).padStart(2, '0');
      const actionDateStr = `${actionYear}-${actionMonth}-${actionDay}`;
      return {
        id: a._id,
        fechaOriginal: a.fechaAccion,
        fechaComparar: actionDateStr,
        fechaBuscada: dateStr,
        coincide: actionDateStr === dateStr,
        accion: a.accion?.nombre || 'N/A',
        estudiante: a.estudiante?.nombre || 'N/A'
      };
    }));
    
    if (filteredActions.length === 0 && expectedCount > 0) {
      console.warn('⚠️ [CALENDAR] Hay', expectedCount, 'acciones según indicador pero', filteredActions.length, 'acciones encontradas después del filtro');
      console.warn('⚠️ [CALENDAR] Revisando todas las acciones cargadas:', calendarActionsList.map(a => {
        const actionDate = new Date(a.fechaAccion);
        const actionYear = actionDate.getFullYear();
        const actionMonth = String(actionDate.getMonth() + 1).padStart(2, '0');
        const actionDay = String(actionDate.getDate()).padStart(2, '0');
        return {
          fecha: `${actionYear}-${actionMonth}-${actionDay}`,
          accion: a.accion?.nombre || 'N/A'
        };
      }));
    }
    
    setViewingDayActions(filteredActions);
  };

  // Toggle selección de estudiante
  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Seleccionar/deseleccionar todos los estudiantes
  const handleSelectAllStudents = () => {
    const allSelected = selectedStudents.length === students.length;
    if (allSelected) {
      // Deseleccionar todos
      setSelectedStudents([]);
    } else {
      // Seleccionar todos
      setSelectedStudents(students.map(s => s._id));
    }
  };
  
  // Toggle selección de acción
  const handleActionToggle = (action: StudentAction) => {
    setSelectedActions(prev => {
      const actionId = action._id;
      if (prev[actionId]) {
        // Si ya está seleccionada, eliminarla
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      } else {
        // Si no está seleccionada, agregarla con valores vacíos
        return {
          ...prev,
          [actionId]: {
            action,
            selectedValues: []
          }
        };
      }
    });
  };
  
  // Seleccionar una sola opción para una acción (reemplaza la anterior si existe)
  const handleValueToggle = (actionId: string, value: string) => {
    setSelectedActions(prev => {
      const actionData = prev[actionId];
      if (!actionData) return prev;
      
      const currentValues = actionData.selectedValues;
      // Si ya está seleccionada, deseleccionarla. Si no, seleccionarla (reemplazando la anterior)
      const newValues = currentValues.includes(value)
        ? [] // Deseleccionar si ya estaba seleccionada
        : [value]; // Seleccionar solo esta opción (reemplaza cualquier otra)
      
      return {
        ...prev,
        [actionId]: {
          ...actionData,
          selectedValues: newValues
        }
      };
    });
  };
  
  // Verificar si se puede guardar (tiene acciones con valores y estudiantes)
  const canSave = () => {
    const hasActions = Object.keys(selectedActions).length > 0;
    const hasStudents = selectedStudents.length > 0;
    
    if (!hasActions || !hasStudents) return false;
    
    // Verificar que todas las acciones seleccionadas tengan exactamente un valor (si tienen valores configurados)
    for (const actionId in selectedActions) {
      const actionData = selectedActions[actionId];
      const action = actionData.action;
      
      // Si la acción tiene valores configurados, debe tener exactamente uno seleccionado
      if (action.valores && action.valores.length > 0) {
        if (actionData.selectedValues.length !== 1) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Abrir modal de comentario y guardar
  const handleSavePress = () => {
    if (!canSave()) {
      Alert.alert('Error', 'Por favor selecciona al menos una acción con sus opciones y al menos un estudiante');
      return;
    }
    setShowCommentModal(true);
  };
  
  // Guardar todas las acciones
  const handleFinalSave = async () => {
    if (!canSave()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const fechaAccion = new Date(`${selectedDateString}T${selectedTime}:00`);
      const fechaAccionISO = fechaAccion.toISOString();
      
      // Crear todas las combinaciones: cada acción con cada valor para cada estudiante
      const promises: Promise<any>[] = [];
      
      for (const studentId of selectedStudents) {
        for (const actionId in selectedActions) {
          const actionData = selectedActions[actionId];
          const action = actionData.action;
          
          // Si la acción tiene valores configurados, usar el valor seleccionado (solo uno)
          if (action.valores && action.valores.length > 0 && actionData.selectedValues.length === 1) {
            const valor = actionData.selectedValues[0];
            promises.push(
              apiClient.post('/student-actions/log', {
                estudiante: studentId,
                accion: actionId,
                valor: valor,
                comentarios: comments,
                fechaAccion: fechaAccionISO,
                imagenes: []
              })
            );
          } else {
            // Si no tiene valores o no se seleccionó ninguno, crear un log sin valor
            promises.push(
              apiClient.post('/student-actions/log', {
                estudiante: studentId,
                accion: actionId,
                comentarios: comments,
                fechaAccion: fechaAccionISO,
                imagenes: []
              })
            );
          }
        }
      }
      
      // Ejecutar todas las peticiones
      await Promise.all(promises);
      
      Alert.alert('Éxito', `${promises.length} acción(es) registrada(s) correctamente`);
      
      // Limpiar selecciones
      setSelectedActions({});
      setSelectedStudents([]);
      setComments('');
      setShowCommentModal(false);
      
      // Recargar calendario
      loadCalendarActions();
    } catch (error: any) {
      console.error('Error registrando acciones:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar las acciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar la fecha si es necesario en el futuro
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateString(date.toISOString().split('T')[0]);
  };

  // Función generateTimeOptions eliminada - ya no se usa en el nuevo flujo

  // Esta función ha sido reemplazada por handleFinalSave para el nuevo flujo de selección múltiple

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDays = (date: Date) => {
    const start = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentWeek(newDate);
  };

  const formatWeekRange = (date: Date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedViewDate) return false;
    // Normalizar la fecha a formato local (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === selectedViewDate;
  };

  const getActionCount = (date: Date) => {
    // Normalizar la fecha a formato local (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const count = calendarActionsByDate[dateStr] || 0;
    // Log para debug
    if (count > 0) {
      console.log('📊 [CALENDAR] Fecha:', dateStr, 'tiene', count, 'acciones. Disponibles:', Object.keys(calendarActionsByDate));
    }
    return count;
  };

  const renderActionLog = ({ item }: { item: StudentActionLog }) => (
    <View style={[styles.actionLogItem, { borderLeftColor: item.accion.color }]}>
      <View style={styles.actionLogHeader}>
        <View style={styles.actionLogTitleContainer}>
          <View style={styles.actionLogNameContainer}>
            <Text style={styles.actionLogName}>{item.accion.nombre}</Text>
            {item.valor && (
              <Text style={[styles.actionLogValue, { color: item.accion.color }]}>
                {item.valor}
              </Text>
            )}
          </View>
          <Text style={styles.actionLogTime}>
            {new Date(item.fechaAccion).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        {item.estudiante && (
          <Text style={styles.actionLogStudent}>
            {item.estudiante.nombre} {item.estudiante.apellido}
          </Text>
        )}
      </View>
      {item.comentarios && (
        <Text style={styles.actionLogComments}>{item.comentarios}</Text>
      )}
      <Text style={styles.actionLogRegistrado}>
        Registrado por: {item.registradoPor.name}
      </Text>
    </View>
  );

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weekDays = getWeekDays(currentWeek);

  return (
    <View style={styles.container}>
      {/* Header con botón de volver */}
      {onBack && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Acciones</Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CALENDARIO ARRIBA */}
        {shouldShowCalendar() ? (
          <View style={styles.calendarSection}>
            <View style={styles.calendarContainer}>
              {/* Header del calendario */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={() => navigateWeek('prev')}
                >
                  <Text style={styles.calendarNavText}>‹</Text>
                </TouchableOpacity>
                
                <Text style={styles.calendarMonthYear}>
                  {formatWeekRange(currentWeek)}
                </Text>
                
                <TouchableOpacity
                  style={styles.calendarNavButton}
                  onPress={() => navigateWeek('next')}
                >
                  <Text style={styles.calendarNavText}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Días de la semana */}
              {loadingCalendar ? (
                <ActivityIndicator size="small" color="#0E5FCE" style={styles.calendarLoader} />
              ) : (
                <View style={styles.calendarWeekContainer}>
                  {weekDays.map((date) => {
                    const actionCount = getActionCount(date);
                    const today = isToday(date);
                    const selected = isSelected(date);
                    const dateStr = date.toISOString().split('T')[0];

                    return (
                      <TouchableOpacity
                        key={dateStr}
                        style={[
                          styles.calendarWeekDay,
                          today && styles.calendarDayToday,
                          selected && styles.calendarDaySelected,
                        ]}
                        onPress={() => handleDaySelect(date)}
                      >
                        <Text style={styles.calendarDayNameShort}>
                          {dayNames[date.getDay()]}
                        </Text>
                        <Text
                          style={[
                            styles.calendarDayNumber,
                            today && styles.calendarDayTodayText,
                            selected && styles.calendarDaySelectedText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {actionCount > 0 && (
                          <View style={[
                            styles.calendarDayIndicator,
                            selected && styles.calendarDayIndicatorSelected
                          ]}>
                            <Text style={[
                              styles.calendarDayIndicatorText,
                              selected && styles.calendarDayIndicatorTextSelected
                            ]}>
                              {actionCount}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 2. LISTA DE ACCIONES DEL DÍA SELECCIONADO */}
            {selectedViewDate && (
              <View style={styles.dayActionsSection}>
                <Text style={styles.dayActionsTitle}>
                  Acciones del {new Date(selectedViewDate + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
                {loadingCalendar ? (
                  <ActivityIndicator size="small" color="#0E5FCE" />
                ) : viewingDayActions.length === 0 ? (
                  <Text style={styles.emptyActionsText}>No hay acciones registradas para este día</Text>
                ) : (
                  <FlatList
                    data={viewingDayActions}
                    renderItem={renderActionLog}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    style={styles.dayActionsList}
                  />
                )}
              </View>
            )}
          </View>
        ) : null}

        {/* 2. SECCIÓN DE ACCIONES CON OPCIONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Acciones</Text>
          {loadingActions ? (
            <ActivityIndicator size="large" color="#0E5FCE" style={styles.loader} />
          ) : actionsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {actionsError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadActions}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : actions.length === 0 ? (
            <Text style={styles.emptyText}>No hay acciones configuradas para esta división</Text>
          ) : (
            <View style={styles.actionsList}>
              {actions.map((action) => {
                const isActionSelected = !!selectedActions[action._id];
                const actionData = selectedActions[action._id];
                
                return (
                  <View key={action._id} style={styles.actionCard}>
                    <TouchableOpacity
                      style={[
                        styles.actionHeader,
                        isActionSelected && { backgroundColor: action.color + '20' }
                      ]}
                      onPress={() => handleActionToggle(action)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionHeaderLeft}>
                        <View style={[styles.actionCheckbox, isActionSelected && styles.actionCheckboxSelected]}>
                          {isActionSelected && <Text style={styles.actionCheckmark}>✓</Text>}
                        </View>
                        <View style={[styles.actionColorIndicator, { backgroundColor: action.color }]} />
                        <Text style={styles.actionName}>{action.nombre}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Mostrar opciones si la acción tiene valores configurados */}
                    {action.valores && action.valores.length > 0 && (
                      <View style={[
                        styles.actionValuesContainer,
                        !isActionSelected && styles.actionValuesContainerDisabled
                      ]}>
                        <Text style={styles.actionValuesTitle}>
                          {isActionSelected ? 'Selecciona opciones:' : 'Opciones disponibles:'}
                        </Text>
                        <View style={styles.actionValuesGrid}>
                          {action.valores.map((valor) => {
                            const isValueSelected = actionData?.selectedValues.includes(valor);
                            return (
                              <TouchableOpacity
                                key={valor}
                                style={[
                                  styles.valueChip,
                                  isValueSelected && { backgroundColor: action.color, borderColor: action.color },
                                  !isActionSelected && styles.valueChipDisabled
                                ]}
                                onPress={() => {
                                  if (isActionSelected) {
                                    handleValueToggle(action._id, valor);
                                  } else {
                                    // Si la acción no está seleccionada, seleccionarla primero
                                    handleActionToggle(action);
                                    setTimeout(() => handleValueToggle(action._id, valor), 100);
                                  }
                                }}
                                activeOpacity={0.7}
                                disabled={!isActionSelected && false}
                              >
                                <Text style={[
                                  styles.valueChipText,
                                  isValueSelected && styles.valueChipTextSelected,
                                  !isActionSelected && styles.valueChipTextDisabled
                                ]}>
                                  {valor}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 3. LISTA DE ESTUDIANTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seleccionar Estudiantes</Text>
            {students.length > 0 && (
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAllStudents}
                activeOpacity={0.7}
              >
                <Text style={styles.selectAllButtonText}>
                  {selectedStudents.length === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {studentsLoading && students.length === 0 ? (
            <ActivityIndicator size="large" color="#0E5FCE" style={styles.loader} />
          ) : studentsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {studentsError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => refreshStudents()}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>No hay alumnos disponibles en esta división</Text>
          ) : (
              <View style={styles.studentsGrid}>
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(student._id);
                  return (
                    <TouchableOpacity
                      key={student._id}
                      style={[
                        styles.studentItem,
                        isSelected && styles.studentItemSelected
                      ]}
                      onPress={() => handleStudentToggle(student._id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.studentAvatar,
                        isSelected && styles.studentAvatarSelected
                      ]}>
                        {student.avatar ? (
                          <Image 
                            source={{ uri: student.avatar }} 
                            style={styles.studentAvatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.studentIcon}>👤</Text>
                        )}
                        {isSelected && (
                          <View style={styles.studentCheckmark} pointerEvents="none">
                            <Text style={styles.studentCheckmarkText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.studentNombre}>{student.nombre}</Text>
                      <Text style={styles.studentApellido}>{student.apellido}</Text>
                      {student.division?.nombre && (
                        <Text style={styles.studentDivision}>{student.division.nombre}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        
        {/* Botón de guardar */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !canSave() && styles.saveButtonDisabled
            ]}
            onPress={handleSavePress}
            disabled={!canSave()}
          >
            <Text style={styles.saveButtonText}>
              Guardar ({Object.keys(selectedActions).length} acción(es), {selectedStudents.length} estudiante(s))
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para comentario antes de guardar */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Comentario</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Comentarios (opcional):</Text>
              <TextInput
                style={[styles.modalInput, styles.commentsInput]}
                value={comments}
                onChangeText={setComments}
                placeholder="Comentarios adicionales..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  loading && styles.disabledButton
                ]}
                onPress={handleFinalSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modales obsoletos eliminados - ya no se usan en el nuevo flujo de selección múltiple */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginTop: 60,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  studentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  studentItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  studentAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  studentAvatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  studentIcon: {
    fontSize: 35,
  },
  studentNombre: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  studentApellido: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  studentDivision: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  loader: {
    padding: 40,
  },
  actionLogsContainer: {
    marginTop: 8,
  },
  actionLogItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
  },
  actionLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLogNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  actionLogName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  actionLogValue: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actionLogTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  actionLogTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLogStudent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E5FCE',
    marginTop: 4,
  },
  actionLogComments: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionLogRegistrado: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionLogPreview: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  actionLogPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionLogPreviewTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalField: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  modalStudentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalStudentAvatarPlaceholder: {
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStudentAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  actionPreview: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  actionPreviewName: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionPreviewDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyActionsContainer: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  emptyActionsText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyActionsHint: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  loadingActionsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0E5FCE',
  },
  errorActionsContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorActionsText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryActionsButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryActionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateTimeButtonIcon: {
    fontSize: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  commentsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 1000,
  },
  pickerOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 2,
    maxHeight: '80%',
    elevation: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  pickerContainerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    zIndex: 2,
    maxHeight: '60%',
    elevation: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerCloseText: {
    fontSize: 24,
    color: '#666',
  },
  timePicker: {
    height: 200,
  },
  pickerConfirmButton: {
    marginTop: 15,
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: '#0E5FCE',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos del calendario mensual
  calendarSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 24,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarDayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  calendarWeekDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    position: 'relative',
    marginHorizontal: 2,
    minHeight: 70,
  },
  calendarDayNameShort: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  calendarDayToday: {
    backgroundColor: '#FF8C42',
  },
  calendarDaySelected: {
    backgroundColor: '#0E5FCE',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  calendarDayTodayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDaySelectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  calendarDayIndicatorSelected: {
    backgroundColor: '#FFFFFF',
  },
  calendarDayIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarDayIndicatorTextSelected: {
    color: '#0E5FCE',
  },
  calendarLoader: {
    padding: 20,
  },
  dayActionsSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dayActionsList: {
    maxHeight: 400,
  },
  // Estilos para acciones y opciones (tipo formulario)
  actionsList: {
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  actionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionCheckboxSelected: {
    backgroundColor: '#0E5FCE',
    borderColor: '#0E5FCE',
  },
  actionCheckmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionColorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionValuesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionValuesContainerDisabled: {
    opacity: 0.6,
  },
  actionValuesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionValuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  valueChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  valueChipDisabled: {
    opacity: 0.5,
  },
  valueChipTextDisabled: {
    color: '#999',
  },
  studentItemSelected: {
    borderWidth: 2,
    borderColor: '#0E5FCE',
    backgroundColor: '#E3F2FD',
  },
  studentAvatarSelected: {
    borderWidth: 3,
    borderColor: '#0E5FCE',
  },
  studentCheckmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 10,
  },
  studentCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#0E5FCE',
  },
  selectAllButtonText: {
    color: '#0E5FCE',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentActionsScreen;
