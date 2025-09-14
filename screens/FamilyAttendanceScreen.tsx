import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CommonHeader from '../components/CommonHeader';
import { apiClient } from '../src/services/api';

const { width } = Dimensions.get('window');

interface AttendanceRecord {
  _id: string;
  fecha: string;
  presente: boolean;
  retirado: boolean;
  retiradoPor?: string;
  retiradoPorNombre?: string;
  retiradoEn?: string;
  ingresoEn?: string;
}

interface StudentAttendance {
  student: {
    _id: string;
    nombre: string;
    apellido: string;
  };
  attendances: AttendanceRecord[];
}

const FamilyAttendanceScreen = ({ onOpenNotifications }: { onOpenNotifications: () => void }) => {
  const { user } = useAuth();
  const { selectedInstitution, userAssociations } = useInstitution();
  const { showError, showSuccess } = useCustomAlert();
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<StudentAttendance | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  // Obtener el alumno activo
  const getActiveStudent = () => {
    if (!selectedInstitution?.student) return null;
    return selectedInstitution.student;
  };

  // Generar días de la semana actual
  const generateWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Cargar asistencias del alumno
  const loadStudentAttendance = async (startDate: Date, endDate: Date) => {
    const activeStudent = getActiveStudent();
    if (!activeStudent || !selectedInstitution?.account?._id) {
      return;
    }

    setLoading(true);
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await apiClient.get('/asistencia/student-attendance', {
        params: {
          studentId: activeStudent._id,
          accountId: selectedInstitution.account._id,
          startDate: startDateStr,
          endDate: endDateStr
        }
      });

      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        showError('Error', response.data.message || 'Error al cargar las asistencias');
      }
    } catch (error: any) {
      console.error('❌ [FAMILY ATTENDANCE] Error:', error);
      showError('Error', 'Error de conexión al cargar las asistencias');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar semana
  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Formatear día de la semana
  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  // Obtener estado de asistencia para un día específico
  const getAttendanceForDate = (date: Date) => {
    if (!attendanceData) return null;
    
    const dateStr = date.toISOString().split('T')[0];
    return attendanceData.attendances.find(att => att.fecha === dateStr);
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Efectos
  useEffect(() => {
    const week = generateWeekDays(selectedDate);
    setCurrentWeek(week);
  }, [selectedDate]);

  useEffect(() => {
    if (currentWeek.length > 0) {
      const startDate = currentWeek[0];
      const endDate = currentWeek[6];
      loadStudentAttendance(startDate, endDate);
    }
  }, [currentWeek, selectedInstitution]);

  const activeStudent = getActiveStudent();

  if (!activeStudent) {
    return (
      <View style={styles.container}>
        <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={activeStudent}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No hay alumno seleccionado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader 
        onOpenNotifications={onOpenNotifications} 
        activeStudent={activeStudent}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Navegación de semanas */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => changeWeek('prev')}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.weekTitle}>
            {selectedDate.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => changeWeek('next')}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendario semanal */}
        <View style={styles.calendarContainer}>
          {currentWeek.map((date, index) => {
            const attendance = getAttendanceForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  isToday && styles.todayContainer,
                  isSelected && styles.selectedContainer
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayName,
                  isToday && styles.todayText
                ]}>
                  {formatDayName(date)}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  isToday && styles.todayText
                ]}>
                  {formatDate(date)}
                </Text>
                
                {/* Indicador de estado */}
                {attendance && (
                  <View style={[
                    styles.statusIndicator,
                    attendance.presente ? styles.presentIndicator : styles.absentIndicator
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detalles del día seleccionado */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E5FCE" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            
            {(() => {
              const attendance = getAttendanceForDate(selectedDate);
              
              if (!attendance) {
                return (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Sin datos de asistencia</Text>
                  </View>
                );
              }

              return (
                <View style={styles.attendanceDetails}>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Estado:</Text>
                    <Text style={[
                      styles.statusValue,
                      attendance.presente ? styles.presentText : styles.absentText
                    ]}>
                      {attendance.presente ? 'Presente' : 'Ausente'}
                    </Text>
                  </View>

                  {attendance.presente && (
                    <>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>Hora de ingreso:</Text>
                        <Text style={styles.timeValue}>
                          {attendance.ingresoEn ? formatTime(attendance.ingresoEn) : 'No registrada'}
                        </Text>
                      </View>

                      {attendance.retirado && (
                        <>
                          <View style={styles.withdrawalTimeRow}>
                            <Text style={styles.withdrawalTimeLabel}>Hora de retirada:</Text>
                            <Text style={styles.withdrawalTimeValue}>
                              {attendance.retiradoEn ? formatTime(attendance.retiradoEn) : 'No registrada'}
                            </Text>
                          </View>
                          
                          <View style={styles.withdrawalRow}>
                            <Text style={styles.withdrawalLabel}>Retirado por:</Text>
                            <Text style={styles.withdrawalValue}>
                              {attendance.retiradoPorNombre || 'No especificado'}
                            </Text>
                          </View>
                          
                          <View style={styles.withdrawalTypeRow}>
                            <Text style={styles.withdrawalTypeLabel}>Tipo:</Text>
                            <Text style={styles.withdrawalTypeValue}>
                              {attendance.retiradoPor === 'familyadmin' ? 'Tutor Principal' :
                               attendance.retiradoPor === 'familyviewer' ? 'Tutor Secundario' :
                               attendance.retiradoPor === 'contact' ? 'Contacto Autorizado' :
                               'No especificado'}
                            </Text>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </View>
              );
            })()}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50, // Agregar padding para evitar que se pise con el header
  },
  scrollContainer: {
    flex: 1,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#0E5FCE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textTransform: 'capitalize',
  },
  calendarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    position: 'relative',
    height: 50,
    justifyContent: 'center',
  },
  todayContainer: {
    backgroundColor: '#FF8C42',
  },
  selectedContainer: {
    backgroundColor: '#0E5FCE',
  },
  dayName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  presentIndicator: {
    backgroundColor: '#4CAF50',
  },
  absentIndicator: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  attendanceDetails: {
    gap: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  presentText: {
    color: '#4CAF50',
  },
  absentText: {
    color: '#F44336',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  withdrawalTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawalTimeLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  withdrawalTimeValue: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  withdrawalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  withdrawalValue: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  withdrawalTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawalTypeLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  withdrawalTypeValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});

export default FamilyAttendanceScreen;
