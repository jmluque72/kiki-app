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
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import { apiClient } from '../src/services/api';

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

const FamilyActionsCalendarScreen: React.FC = () => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution, getActiveStudent } = useInstitution();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayActions, setDayActions] = useState<StudentActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadCalendarData();
    }
  }, [selectedStudent, currentDate, viewMode]);

  useEffect(() => {
    if (selectedDate && selectedStudent) {
      loadDayActions();
    }
  }, [selectedDate, selectedStudent]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/students?accountId=${selectedInstitution?._id}&divisionId=${activeAssociation?.division?._id}`);
      const studentsData = response.data.data.students || [];
      setStudents(studentsData);
      
      // Si hay estudiantes, seleccionar el primero por defecto
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      Alert.alert('Error', 'No se pudieron cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      
      const startDate = viewMode === 'week' 
        ? getWeekStart(currentDate)
        : getMonthStart(currentDate);
      
      const endDate = viewMode === 'week'
        ? getWeekEnd(currentDate)
        : getMonthEnd(currentDate);

      const response = await apiClient.get(
        `/api/student-actions/log/student/${selectedStudent._id}?fechaInicio=${startDate}&fechaFin=${endDate}`
      );
      
      const actions = response.data.data || [];
      generateCalendarDays(startDate, endDate, actions);
      
    } catch (error) {
      console.error('Error cargando datos del calendario:', error);
      Alert.alert('Error', 'No se pudieron cargar las acciones');
    } finally {
      setLoading(false);
    }
  };

  const loadDayActions = async () => {
    if (!selectedStudent) return;

    try {
      const response = await apiClient.get(
        `/api/student-actions/log/student/${selectedStudent._id}?fecha=${selectedDate}`
      );
      setDayActions(response.data.data || []);
    } catch (error) {
      console.error('Error cargando acciones del día:', error);
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
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[
        styles.studentItem,
        selectedStudent?._id === item._id && styles.selectedStudent
      ]}
      onPress={() => setSelectedStudent(item)}
    >
      <Text style={styles.studentName}>{item.nombre} {item.apellido}</Text>
    </TouchableOpacity>
  );

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
      <Text style={styles.title}>Calendario de Acciones</Text>
      
      {/* Selector de estudiante */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar Estudiante</Text>
        <FlatList
          data={students}
          renderItem={renderStudent}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.studentsList}
        />
      </View>

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
          <View style={styles.viewModeButtons}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
              onPress={() => setViewMode('week')}
            >
              <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
              onPress={() => setViewMode('month')}
            >
              <Text style={[styles.viewModeText, viewMode === 'month' && styles.activeViewModeText]}>
                Mes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendario */}
      <View style={styles.calendarContainer}>
        <FlatList
          data={calendarDays}
          renderItem={renderCalendarDay}
          keyExtractor={(item) => item.date}
          numColumns={7}
          scrollEnabled={false}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
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
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 4,
    position: 'relative',
  },
  todayDay: {
    backgroundColor: '#0E5FCE20',
  },
  selectedDay: {
    backgroundColor: '#0E5FCE',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  actionsIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
