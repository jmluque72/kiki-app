import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContextHybrid';
import { useInstitution } from '../../contexts/InstitutionContext';
import { apiClient } from '../services/api';

interface Student {
  _id: string;
  nombre: string;
  apellido: string;
  avatar?: string;
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

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  actions: StudentActionLog[];
}

interface FamilyActionsCalendarScreenProps {
  onBack?: () => void;
}

// ESTA PANTALLA ES SOLO PARA ROLES FAMILIARES (familyadmin, familyviewer)
// NO carga estudiantes desde API, usa las asociaciones del usuario
const FamilyActionsCalendarScreen: React.FC<FamilyActionsCalendarScreenProps> = ({ onBack }) => {
  const { user, activeAssociation } = useAuth();
  const { userAssociations } = useInstitution();
  
  // Usar el estudiante activo directamente desde activeAssociation
  const activeStudent = React.useMemo(() => {
    if (activeAssociation?.student) {
      return {
        _id: activeAssociation.student._id,
        nombre: activeAssociation.student.nombre,
        apellido: activeAssociation.student.apellido || '',
        avatar: activeAssociation.student.avatar
      } as Student;
    }
    return null;
  }, [activeAssociation]);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayActions, setDayActions] = useState<StudentActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  // Solo vista de semana
  const viewMode: 'week' = 'week';

  // Usar el estudiante activo automáticamente
  useEffect(() => {
    if (activeStudent && !selectedStudent) {
      setSelectedStudent(activeStudent);
    } else if (activeStudent && selectedStudent?._id !== activeStudent._id) {
      // Actualizar si cambió el estudiante activo
      setSelectedStudent(activeStudent);
    }
  }, [activeStudent]);

  useEffect(() => {
    if (selectedStudent) {
      loadCalendarData();
    }
  }, [selectedStudent, currentDate]);

  useEffect(() => {
    if (selectedDate && selectedStudent) {
      loadDayActions();
    }
  }, [selectedDate, selectedStudent]);

  const loadCalendarData = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      
      // Solo vista de semana
      const startDate = getWeekStart(currentDate);
      const endDate = getWeekEnd(currentDate);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Cargar acciones de TODOS los estudiantes de las asociaciones
      // Usar solo el estudiante activo
      if (!selectedStudent) return;
      const promises = [selectedStudent].map(student => 
        apiClient.get(
          `/api/student-actions/log/student/${student._id}?fechaInicio=${startDateStr}&fechaFin=${endDateStr}`
        ).catch(err => {
          console.error(`❌ [FAMILY ACTIONS] Error cargando acciones para estudiante ${student._id}:`, err);
          return { data: { data: [] } };
        })
      );
      
      const responses = await Promise.all(promises);
      const allActions = responses.flatMap(r => r.data.data || []);
      
      generateCalendarDays(startDate, endDate, allActions);
      
    } catch (error) {
      console.error('Error cargando datos del calendario:', error);
      Alert.alert('Error', 'No se pudieron cargar las acciones');
    } finally {
      setLoading(false);
    }
  };

  const loadDayActions = async () => {
    if (!selectedStudent) {
      setDayActions([]);
      return;
    }

    try {
      // Cargar acciones de TODOS los estudiantes para el día seleccionado
      // Usar solo el estudiante activo
      if (!selectedStudent) return;
      const promises = [selectedStudent].map(student => 
        apiClient.get(
          `/api/student-actions/log/student/${student._id}?fechaInicio=${selectedDate}&fechaFin=${selectedDate}`
        ).catch(err => {
          console.error(`❌ [FAMILY ACTIONS] Error cargando acciones del día para estudiante ${student._id}:`, err);
          return { data: { data: [] } };
        })
      );
      
      const responses = await Promise.all(promises);
      const allDayActions = responses.flatMap(r => r.data.data || []);
      
      // Filtrar acciones para asegurar que sean solo del día seleccionado (normalizando fechas)
      const filteredActions = allDayActions.filter(action => {
        if (!action.fechaAccion) return false;
        const actionDate = new Date(action.fechaAccion);
        const actionDateStr = actionDate.toISOString().split('T')[0];
        return actionDateStr === selectedDate;
      });
      
      console.log('📅 [FAMILY ACTIONS] Día seleccionado:', selectedDate, 'Acciones encontradas:', filteredActions.length);
      setDayActions(filteredActions);
    } catch (error) {
      console.error('Error cargando acciones del día:', error);
      setDayActions([]);
    }
  };

  const generateCalendarDays = (startDate: Date, endDate: Date, actions: StudentActionLog[]) => {
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayActions = actions.filter(action => 
        action.fechaAccion.split('T')[0] === dateStr
      );
      
      days.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        actions: dayActions
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const end = new Date(date);
    end.setDate(date.getDate() + (6 - date.getDay()));
    return end;
  };

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    // Solo navegación por semanas
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };


  const renderCalendarDay = ({ item }: { item: CalendarDay }) => (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        item.isToday && styles.todayDay,
        selectedDate === item.date && styles.selectedDay,
        !item.isCurrentMonth && styles.otherMonthDay
      ]}
      onPress={() => setSelectedDate(item.date)}
    >
      <Text style={[
        styles.dayNumber,
        !item.isCurrentMonth && styles.otherMonthText,
        item.isToday && styles.todayText
      ]}>
        {item.day}
      </Text>
      {item.actions.length > 0 && (
        <View style={styles.actionsIndicator}>
          <Text style={styles.actionsCount}>{item.actions.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDayAction = ({ item }: { item: StudentActionLog }) => (
    <View style={[styles.actionItem, { borderLeftColor: item.accion.color }]}>
      <View style={styles.actionHeader}>
        <Text style={styles.actionName}>{item.accion.nombre}</Text>
        <Text style={styles.actionTime}>
          {new Date(item.fechaAccion).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      {item.comentarios && (
        <Text style={styles.actionComments}>{item.comentarios}</Text>
      )}
      <Text style={styles.actionRegistrado}>
        Registrado por: {item.registradoPor.name}
      </Text>
      <View style={styles.actionStatus}>
        <Text style={[
          styles.statusText,
          { color: getStatusColor(item.estado) }
        ]}>
          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return '#4CAF50';
      case 'rechazado': return '#F44336';
      default: return '#FF9800';
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

  return (
    <View style={styles.container}>
      {/* Header con botón de volver */}
      {onBack && (
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Calendario de Acciones</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>
      )}
      
      {!onBack && (
        <Text style={styles.title}>Calendario de Acciones</Text>
      )}
      
      {/* Mostrar solo el estudiante activo */}
      {selectedStudent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estudiante: {selectedStudent.nombre} {selectedStudent.apellido}</Text>
        </View>
      )}

      {/* Controles de navegación */}
      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {formatDate(currentDate)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendario Semanal */}
      <View style={styles.calendarContainer}>
        <View style={styles.weekHeader}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
            <View key={index} style={styles.weekHeaderDay}>
              <Text style={styles.weekHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.weekDays}>
          {calendarDays.map((day) => (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.calendarDay,
                day.isToday && styles.todayDay,
                selectedDate === day.date && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[
                styles.dayNumber,
                day.isToday && styles.todayText,
                selectedDate === day.date && styles.selectedText,
              ]}>
                {day.day}
              </Text>
              {day.actions.length > 0 && (
                <View style={styles.actionsIndicator}>
                  <Text style={styles.actionsCount}>{day.actions.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Acciones del día seleccionado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Acciones del {new Date(selectedDate).toLocaleDateString('es-ES')}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0E5FCE" />
        ) : (
          <FlatList
            data={dayActions}
            renderItem={renderDayAction}
            keyExtractor={(item) => item._id}
            style={styles.actionsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay acciones registradas para este día</Text>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginHorizontal: -16,
    marginTop: -16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E5FCE',
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    minWidth: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginTop: 60,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  studentsList: {
    maxHeight: 60,
  },
  studentItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
  },
  selectedStudent: {
    borderColor: '#0E5FCE',
    backgroundColor: '#0E5FCE10',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeViewMode: {
    backgroundColor: '#0E5FCE',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeViewModeText: {
    color: '#FFFFFF',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  weekHeaderDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  weekDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
    position: 'relative',
  },
  todayDay: {
    backgroundColor: '#0E5FCE',
  },
  selectedDay: {
    backgroundColor: '#E3F2FD',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  actionsIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsList: {
    maxHeight: 400,
  },
  actionItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionTime: {
    fontSize: 12,
    color: '#666',
  },
  actionComments: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionRegistrado: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  actionStatus: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default FamilyActionsCalendarScreen;
