import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import { apiClient } from '../src/services/api';

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
  isSelected: boolean;
  hasActions: boolean;
  actionCount: number;
}

const FamilyActionsScreen: React.FC = () => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution } = useInstitution();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actionLogs, setActionLogs] = useState<StudentActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    generateCalendar();
    loadActionsForDate(selectedDate);
  }, [currentDate, selectedDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = dateString === today.toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      
      days.push({
        date: dateString,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        hasActions: false, // Se actualizará cuando se carguen las acciones
        actionCount: 0,
      });
    }
    
    setCalendarDays(days);
  };

  const loadActionsForDate = async (date: string) => {
    try {
      setLoading(true);
      
      // Obtener acciones para todos los estudiantes asociados
      const students = activeAssociation?.students || [];
      const allActions: StudentActionLog[] = [];
      
      for (const student of students) {
        try {
          const response = await apiClient.get(`/api/student-actions/log/student/${student._id}?fecha=${date}`);
          if (response.data.success) {
            allActions.push(...response.data.data);
          }
        } catch (error) {
          console.error(`Error cargando acciones para estudiante ${student._id}:`, error);
        }
      }
      
      setActionLogs(allActions);
      
      // Actualizar el calendario con la información de acciones
      updateCalendarWithActions(allActions);
      
    } catch (error) {
      console.error('Error cargando acciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las acciones');
    } finally {
      setLoading(false);
    }
  };

  const updateCalendarWithActions = (actions: StudentActionLog[]) => {
    const actionsByDate: { [date: string]: number } = {};
    
    actions.forEach(action => {
      const date = new Date(action.fechaAccion).toISOString().split('T')[0];
      actionsByDate[date] = (actionsByDate[date] || 0) + 1;
    });
    
    setCalendarDays(prevDays => 
      prevDays.map(day => ({
        ...day,
        hasActions: !!actionsByDate[day.date],
        actionCount: actionsByDate[day.date] || 0,
      }))
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  const renderCalendarDay = ({ item }: { item: CalendarDay }) => (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        !item.isCurrentMonth && styles.otherMonthDay,
        item.isToday && styles.todayDay,
        item.isSelected && styles.selectedDay,
        item.hasActions && styles.dayWithActions,
      ]}
      onPress={() => selectDate(item.date)}
    >
      <Text style={[
        styles.dayText,
        !item.isCurrentMonth && styles.otherMonthText,
        item.isToday && styles.todayText,
        item.isSelected && styles.selectedText,
      ]}>
        {item.day}
      </Text>
      {item.hasActions && (
        <View style={styles.actionIndicator}>
          <Text style={styles.actionCount}>{item.actionCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderActionLog = ({ item }: { item: StudentActionLog }) => (
    <View style={[styles.actionLogItem, { borderLeftColor: item.accion.color }]}>
      <View style={styles.actionLogHeader}>
        <View style={styles.actionLogInfo}>
          <Text style={styles.actionLogName}>{item.accion.nombre}</Text>
          <Text style={styles.actionLogStudent}>
            {item.estudiante.nombre} {item.estudiante.apellido}
          </Text>
        </View>
        <Text style={styles.actionLogTime}>
          {new Date(item.fechaAccion).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      {item.comentarios && (
        <Text style={styles.actionLogComments}>{item.comentarios}</Text>
      )}
      <Text style={styles.actionLogRegistrado}>
        Registrado por: {item.registradoPor.name}
      </Text>
    </View>
  );

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acciones de Estudiantes</Text>
      
      {/* Navegación del calendario */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {currentDate.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDays}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Calendario */}
      <View style={styles.calendar}>
        <FlatList
          data={calendarDays}
          renderItem={renderCalendarDay}
          keyExtractor={(item) => item.date}
          numColumns={7}
          scrollEnabled={false}
        />
      </View>

      {/* Fecha seleccionada */}
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>
          {formatDate(selectedDate)}
        </Text>
      </View>

      {/* Lista de acciones */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>
          Acciones del día ({actionLogs.length})
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0E5FCE" />
        ) : (
          <FlatList
            data={actionLogs}
            renderItem={renderActionLog}
            keyExtractor={(item) => item._id}
            style={styles.actionsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No hay acciones registradas para este día
              </Text>
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  calendarDay: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 4,
    position: 'relative',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  todayDay: {
    backgroundColor: '#0E5FCE20',
  },
  selectedDay: {
    backgroundColor: '#0E5FCE',
  },
  dayWithActions: {
    backgroundColor: '#FF6B6B20',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otherMonthText: {
    color: '#CCC',
  },
  todayText: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedDateContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flex: 1,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsList: {
    flex: 1,
  },
  actionLogItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
  },
  actionLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionLogInfo: {
    flex: 1,
  },
  actionLogName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionLogStudent: {
    fontSize: 14,
    color: '#666',
  },
  actionLogTime: {
    fontSize: 12,
    color: '#666',
  },
  actionLogComments: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  actionLogRegistrado: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default FamilyActionsScreen;
