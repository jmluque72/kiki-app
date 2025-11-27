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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAction, setSelectedAction] = useState<StudentAction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateString, setSelectedDateString] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [comments, setComments] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<StudentActionLog[]>([]);
  
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

  useEffect(() => {
    if (selectedStudent && showModal) {
      loadStudentActions();
    }
  }, [selectedStudent, selectedDateString]);

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
        color: a.color
      })));
      
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

  const loadStudentActions = async () => {
    try {
      if (!selectedStudent) return;
      
      const response = await apiClient.get(`/student-actions/log/student/${selectedStudent._id}?fecha=${selectedDateString}`);
      setActionLogs(response.data.data || []);
    } catch (error) {
      console.error('Error cargando acciones del estudiante:', error);
    }
  };

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

  const handleStudentPress = (student: Student) => {
    // Solo permitir registrar acciones si el usuario es coordinador
    if (!canRegisterActions()) {
      return;
    }
    setSelectedStudent(student);
    setSelectedAction(null);
    setSelectedDate(new Date());
    setSelectedDateString(new Date().toISOString().split('T')[0]);
    setSelectedTime(new Date().toTimeString().slice(0, 5));
    setComments('');
    setShowModal(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateString(date.toISOString().split('T')[0]);
    setShowDatePicker(false);
    // Reabrir el modal principal después de seleccionar la fecha
    setTimeout(() => {
      setShowModal(true);
    }, 300);
    if (selectedStudent) {
      loadStudentActions();
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: timeString, label: timeString });
      }
    }
    return options;
  };

  const handleRegisterAction = async () => {
    if (!selectedStudent || !selectedAction) {
      Alert.alert('Error', 'Por favor selecciona una acción');
      return;
    }

    try {
      setLoading(true);
      
      const fechaAccion = new Date(`${selectedDateString}T${selectedTime}:00`);
      
      const response = await apiClient.post('/student-actions/log', {
        estudiante: selectedStudent._id,
        accion: selectedAction._id,
        comentarios: comments,
        fechaAccion: fechaAccion.toISOString(),
        imagenes: []
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Acción registrada correctamente');
        setShowModal(false);
        setSelectedStudent(null);
        setSelectedAction(null);
        setComments('');
        loadStudentActions();
        // Recargar calendario para actualizar indicadores
        loadCalendarActions();
      } else {
        Alert.alert('Error', response.data.message || 'Error al registrar la acción');
      }
    } catch (error: any) {
      console.error('Error registrando acción:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar la acción');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.actionLogName}>{item.accion.nombre}</Text>
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

        {/* 3. LISTA DE ESTUDIANTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Alumno</Text>
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
                {students.map((student) => (
                  <TouchableOpacity
                    key={student._id}
                    style={styles.studentItem}
                    onPress={() => handleStudentPress(student)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.studentAvatar}>
                      {student.avatar ? (
                        <Image 
                          source={{ uri: student.avatar }} 
                          style={styles.studentAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.studentIcon}>👤</Text>
                      )}
                    </View>
                    <Text style={styles.studentNombre}>{student.nombre}</Text>
                    <Text style={styles.studentApellido}>{student.apellido}</Text>
                    {student.division?.nombre && (
                      <Text style={styles.studentDivision}>{student.division.nombre}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
      </ScrollView>

      {/* Modal para registrar acción */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Acción</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Estudiante seleccionado */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Estudiante:</Text>
                <View style={styles.studentInfoContainer}>
                  {selectedStudent?.avatar ? (
                    <Image 
                      source={{ uri: selectedStudent.avatar }} 
                      style={styles.modalStudentAvatar}
                    />
                  ) : (
                    <View style={[styles.modalStudentAvatar, styles.modalStudentAvatarPlaceholder]}>
                      <Text style={styles.modalStudentAvatarText}>
                        {selectedStudent?.nombre?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalValue}>
                    {selectedStudent?.nombre} {selectedStudent?.apellido}
                  </Text>
                </View>
              </View>

              {/* Selector de acción */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Acción:</Text>
                {loadingActions ? (
                  <View style={styles.loadingActionsContainer}>
                    <ActivityIndicator size="small" color="#0E5FCE" />
                    <Text style={styles.loadingActionsText}>Cargando acciones...</Text>
                  </View>
                ) : actionsError ? (
                  <View style={styles.errorActionsContainer}>
                    <Text style={styles.errorActionsText}>Error: {actionsError}</Text>
                    <TouchableOpacity 
                      style={styles.retryActionsButton}
                      onPress={loadActions}
                    >
                      <Text style={styles.retryActionsButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                ) : actions.length === 0 ? (
                  <View style={styles.emptyActionsContainer}>
                    <Text style={styles.emptyActionsText}>
                      No hay acciones configuradas para esta división
                    </Text>
                    <Text style={styles.emptyActionsHint}>
                      Contacta al administrador para configurar las acciones
                    </Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => {
                        console.log('🎯 [ACTION PICKER] Abriendo selector de acciones. Total acciones:', actions.length);
                        console.log('🎯 [ACTION PICKER] Acciones disponibles:', actions.map((a: StudentAction) => a.nombre));
                        // Cerrar el modal principal temporalmente para que funcione el picker
                        setShowModal(false);
                        setTimeout(() => {
                          setShowActionPicker(true);
                        }, 300);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateTimeButtonText}>
                        {selectedAction ? selectedAction.nombre : 'Seleccionar acción...'}
                      </Text>
                      <Text style={styles.dateTimeButtonIcon}>📋</Text>
                    </TouchableOpacity>
                    {selectedAction && (
                      <View style={[styles.actionPreview, { borderLeftColor: selectedAction.color || '#0E5FCE' }]}>
                        <Text style={[styles.actionPreviewName, { color: selectedAction.color || '#0E5FCE' }]}>
                          {selectedAction.nombre}
                        </Text>
                        {selectedAction.descripcion && (
                          <Text style={styles.actionPreviewDesc}>{selectedAction.descripcion}</Text>
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Selector de fecha */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Fecha:</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('📅 [DATE PICKER] Botón de fecha presionado');
                    // Cerrar el modal principal temporalmente para que funcione el picker
                    setShowModal(false);
                    setTimeout(() => {
                      setShowDatePicker(true);
                    }, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateTimeButtonText}>
                    {formatDate(selectedDate)}
                  </Text>
                  <Text style={styles.dateTimeButtonIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              {/* Selector de hora */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Hora:</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => {
                    console.log('🕐 [TIME PICKER] Botón de hora presionado');
                    // Cerrar el modal principal temporalmente para que funcione el picker
                    setShowModal(false);
                    setTimeout(() => {
                      setShowTimePicker(true);
                    }, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateTimeButtonText}>{selectedTime}</Text>
                  <Text style={styles.dateTimeButtonIcon}>🕐</Text>
                </TouchableOpacity>
              </View>

              {/* Comentarios */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Comentarios (opcional):</Text>
                <TextInput
                  style={[styles.modalInput, styles.commentsInput]}
                  value={comments}
                  onChangeText={setComments}
                  placeholder="Comentarios adicionales..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Historial de acciones del estudiante */}
              {selectedStudent && actionLogs.length > 0 && (
                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Historial reciente:</Text>
                  <View style={styles.actionLogsContainer}>
                    {actionLogs.slice(0, 3).map((log) => (
                      <View key={log._id} style={[styles.actionLogPreview, { borderLeftColor: log.accion.color }]}>
                        <Text style={styles.actionLogPreviewName}>{log.accion.nombre}</Text>
                        <Text style={styles.actionLogPreviewTime}>
                          {new Date(log.fechaAccion).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit'
                          })} {new Date(log.fechaAccion).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!selectedAction || loading) && styles.disabledButton
                ]}
                onPress={handleRegisterAction}
                disabled={!selectedAction || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de calendario - Fuera del modal principal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          console.log('📅 [DATE PICKER] Cerrando modal de fecha');
          setShowDatePicker(false);
        }}
        presentationStyle="overFullScreen"
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity 
            style={styles.pickerOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              console.log('📅 [DATE PICKER] Overlay tocado, cerrando');
              setShowDatePicker(false);
            }}
          />
          <View style={styles.pickerModalContent}>
            <CustomCalendar
              onDateSelect={(date) => {
                console.log('📅 [DATE PICKER] Fecha seleccionada:', date);
                handleDateSelect(date);
              }}
              onClose={() => {
                console.log('📅 [DATE PICKER] Cerrando desde CustomCalendar');
                setShowDatePicker(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de selector de acción - Fuera del modal principal */}
      <Modal
        visible={showActionPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          console.log('📋 [ACTION PICKER] Cerrando modal de acción');
          setShowActionPicker(false);
          setTimeout(() => {
            setShowModal(true);
          }, 300);
        }}
        presentationStyle="overFullScreen"
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity 
            style={styles.pickerOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              console.log('📋 [ACTION PICKER] Overlay tocado, cerrando');
              setShowActionPicker(false);
              setTimeout(() => {
                setShowModal(true);
              }, 300);
            }}
          />
          <View style={styles.pickerContainerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Seleccionar Acción</Text>
              <TouchableOpacity onPress={() => {
                console.log('📋 [ACTION PICKER] Botón X presionado');
                setShowActionPicker(false);
                setTimeout(() => {
                  setShowModal(true);
                }, 300);
              }}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={selectedAction?._id || ''}
              onValueChange={(itemValue) => {
                console.log('📋 [ACTION PICKER] Acción seleccionada:', itemValue);
                const action = actions.find(a => a._id === itemValue);
                setSelectedAction(action || null);
                console.log('📋 [ACTION PICKER] Acción establecida:', action?.nombre);
              }}
              style={styles.timePicker}
            >
              <Picker.Item label="Seleccionar acción..." value="" />
              {actions.map((action) => (
                <Picker.Item
                  key={action._id}
                  label={action.nombre}
                  value={action._id}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.pickerConfirmButton}
              onPress={() => {
                console.log('📋 [ACTION PICKER] Botón confirmar presionado');
                setShowActionPicker(false);
                setTimeout(() => {
                  setShowModal(true);
                }, 300);
              }}
            >
              <Text style={styles.pickerConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de hora - Fuera del modal principal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          console.log('🕐 [TIME PICKER] Cerrando modal de hora');
          setShowTimePicker(false);
        }}
        presentationStyle="overFullScreen"
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity 
            style={styles.pickerOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              console.log('🕐 [TIME PICKER] Overlay tocado, cerrando');
              setShowTimePicker(false);
            }}
          />
          <View style={styles.pickerContainerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
              <TouchableOpacity onPress={() => {
                console.log('🕐 [TIME PICKER] Botón X presionado');
                setShowTimePicker(false);
              }}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={selectedTime}
              onValueChange={(itemValue) => {
                console.log('🕐 [TIME PICKER] Hora seleccionada:', itemValue);
                setSelectedTime(itemValue);
                // No cerrar automáticamente, dejar que el usuario confirme
              }}
              style={styles.timePicker}
            >
              {generateTimeOptions().map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.pickerConfirmButton}
              onPress={() => {
                console.log('🕐 [TIME PICKER] Botón confirmar presionado');
                setShowTimePicker(false);
                // Reabrir el modal principal después de confirmar la hora
                setTimeout(() => {
                  setShowModal(true);
                }, 300);
              }}
            >
              <Text style={styles.pickerConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  studentItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 4,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  studentAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentIcon: {
    fontSize: 30,
  },
  studentNombre: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  studentApellido: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  studentDivision: {
    fontSize: 10,
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
  actionLogName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
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
});

export default StudentActionsScreen;
