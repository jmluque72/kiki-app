import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Modal,
  RefreshControl
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useInstitution } from '../contexts/InstitutionContext';
import { useStudents } from '../src/hooks/useStudents';
import { useAuth } from "../contexts/AuthContextHybrid"
import { apiClient } from '../src/services/api';
import CommonHeader from '../components/CommonHeader';
import SideMenu from '../components/SideMenu';
import { useSideMenu } from '../src/hooks/useSideMenu';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import CameraKitQRScanner from '../components/CameraKitQRScanner';

const AsistenciaScreen = ({ onOpenNotifications, onOpenMenu: onOpenMenuProp }: { onOpenNotifications: () => void; onOpenMenu?: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  const { token } = useAuth();
  const { showSuccess, showError, isVisible, alertConfig } = useCustomAlert();
  const { showMenu, openMenu: openMenuLocal, closeMenu } = useSideMenu();
  
  // Usar onOpenMenu prop si está disponible, sino usar el hook local
  const openMenu = onOpenMenuProp || openMenuLocal;
  
  const { students, loading, error, total } = useStudents(
    selectedInstitution?.account._id,
    selectedInstitution?.division?._id
  );

  // Estado para manejar la asistencia de cada alumno
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  
  // Estado para el escáner QR
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Estado para retiradas (solo para mostrar estado, no para retirar)
  const [withdrawals, setWithdrawals] = useState<{ [key: string]: { studentId: string, withdrawnBy: string, withdrawnByName: string } }>({});
  
  // Estado para pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para detectar cambios pendientes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalAttendance, setOriginalAttendance] = useState<{ [key: string]: boolean }>({});
  
  

  // Función para marcar/desmarcar asistencia
  const toggleAttendance = (studentId: string) => {
    // Verificar si el alumno ya fue retirado
    if (withdrawals[studentId]) {
      showError('No se puede modificar', 'Este alumno ya fue retirado y no se puede cambiar su asistencia');
      return;
    }
    
    setAttendance(prev => {
      const newAttendance = {
        ...prev,
        [studentId]: !prev[studentId]
      };
      
      // Detectar si hay cambios con respecto al estado original
      const hasChanges = Object.keys(newAttendance).some(key => 
        newAttendance[key] !== originalAttendance[key]
      ) || Object.keys(originalAttendance).some(key => 
        originalAttendance[key] !== newAttendance[key]
      );
      
      setHasUnsavedChanges(hasChanges);
      return newAttendance;
    });
  };

  // Función unificada para cargar asistencias del día
  const loadDailyAttendance = async (isRefresh = false) => {
    if (!selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      console.log('🔄 [ATTENDANCE] Cargando asistencias para:', dateStr);

      const response = await apiClient.get(`/asistencia/by-date`, {
        params: {
          accountId: selectedInstitution.account._id,
          divisionId: selectedInstitution.division._id,
          fecha: dateStr
        }
      });

      if (response.data.success && response.data.data) {
        const attendanceData = response.data.data.estudiantes || [];
        const attendanceMap: { [key: string]: boolean } = {};
        const withdrawalsMap: { [key: string]: { studentId: string, withdrawnBy: string, withdrawnByName: string } } = {};
        
        attendanceData.forEach((item: any) => {
          attendanceMap[item.student] = item.presente;
          
          // Cargar retiradas si existen
          if (item.retirado && item.retiradoPor && item.retiradoPorNombre) {
            withdrawalsMap[item.student] = {
              studentId: item.student,
              withdrawnBy: item.retiradoPor,
              withdrawnByName: item.retiradoPorNombre
            };
          }
        });
        
        setAttendance(attendanceMap);
        setWithdrawals(withdrawalsMap);
        setOriginalAttendance(attendanceMap); // Guardar estado original
        setHasUnsavedChanges(false); // Resetear cambios pendientes
        console.log('✅ [ATTENDANCE] Asistencias cargadas:', attendanceMap);
        console.log('✅ [WITHDRAWALS] Retiradas cargadas:', withdrawalsMap);
      } else {
        setAttendance({});
        setWithdrawals({});
        setOriginalAttendance({}); // Guardar estado original vacío
        setHasUnsavedChanges(false); // Resetear cambios pendientes
        console.log('ℹ️ [ATTENDANCE] No hay asistencias para hoy');
      }
    } catch (error) {
      console.error('❌ [ATTENDANCE] Error cargando asistencias:', error);
      setAttendance({});
      setWithdrawals({});
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  // Función para manejar el pull-to-refresh
  const onRefresh = async () => {
    console.log('🔄 [REFRESH] Iniciando actualización manual...');
    await loadDailyAttendance(true);
  };


  // Función para manejar estudiante encontrado por QR
  const handleStudentFoundByQR = (student: any) => {
    console.log('🔍 [ASISTENCIA] Estudiante encontrado por QR:', student);
    
    // Verificar si el estudiante pertenece a la división actual
    if (student.division._id !== selectedInstitution?.division?._id) {
      showError('Este alumno no pertenece a la división actual');
      return;
    }
    
    // Marcar/desmarcar asistencia del estudiante
    toggleAttendance(student._id);
  };

  // Función para marcar/desmarcar todos los alumnos
  const toggleAllAttendance = () => {
    const allPresent = presentStudents === totalStudents;
    
    if (allPresent) {
      // Si todos están presentes, desmarcar todos
      setAttendance({});
    } else {
      // Si no todos están presentes, marcar todos
      const newAttendance: { [key: string]: boolean } = {};
      students.forEach(student => {
        newAttendance[student._id] = true;
      });
      setAttendance(newAttendance);
    }
  };

  // Calcular estadísticas de asistencia
  const totalStudents = students.length;
  const presentStudents = Object.values(attendance).filter(present => present).length;

  // Función para guardar la asistencia
  const handleSaveAttendance = async () => {
    console.log('🔍 Debug - selectedInstitution:', selectedInstitution);
    console.log('🔍 Debug - userAssociations:', userAssociations);
    console.log('🔍 Debug - students:', students);
    console.log('🔍 Debug - attendance:', attendance);
    
    if (!selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
      console.error('❌ Error: No se ha seleccionado una institución válida');
      showError('Error', 'No se ha seleccionado una institución válida');
      return;
    }

    if (students.length === 0) {
      console.error('❌ Error: No hay alumnos para registrar asistencia');
      showError('Error', 'No hay alumnos para registrar asistencia');
      return;
    }

    try {
      // Preparar datos para enviar al servidor
      const estudiantes = students.map(student => ({
        studentId: student._id,
        presente: attendance[student._id] || false
      }));

      const requestData = {
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division._id,
        estudiantes: estudiantes,
        retiradas: withdrawals
      };

      console.log('📤 Enviando datos de asistencia:', JSON.stringify(requestData, null, 2));

      const response = await apiClient.post('/asistencia', requestData);

      console.log('✅ Respuesta del servidor:', response.data);
      const result = response.data;

      if (result.success) {
        showSuccess('Asistencias', 'Asistencia guardada correctamente');
        // Actualizar el estado original y resetear cambios pendientes
        setOriginalAttendance(attendance);
        setHasUnsavedChanges(false);
      } else {
        console.error('❌ Error del servidor:', result);
        showError('Error', result.message || 'Error al guardar la asistencia');
      }
    } catch (error: any) {
      console.error('❌ Error guardando asistencia:', error);
      
      // Mostrar detalles del error
      let errorMessage = 'Error de conexión al guardar la asistencia';
      
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        console.error('❌ Error request:', error.request);
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        console.error('❌ Error:', error.message);
        errorMessage = error.message || 'Error desconocido';
      }
      
      showError('Error', errorMessage);
    }
  };

  const getInstitutionName = () => {
    if (selectedInstitution) {
      return selectedInstitution.account.nombre;
    }
    if (userAssociations.length === 1) {
      return userAssociations[0].account.nombre;
    }
    return 'La Salle'; // Fallback
  };

  const getDivisionName = () => {
    if (selectedInstitution?.division?.nombre) {
      return selectedInstitution.division.nombre;
    }
    if (userAssociations.length > 0) {
      const associationWithDivision = userAssociations.find(assoc => assoc.division?.nombre);
      if (associationWithDivision?.division?.nombre) {
        return associationWithDivision.division.nombre;
      }
    }
    return 'Sin división';
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return today.toLocaleDateString('es-ES', options);
  };

  // Consultar asistencia por fecha al cargar la pantalla
  useEffect(() => {
    console.log('🚀 [FRONTEND] useEffect se ejecutó!');
    console.log('🔍 [FRONTEND] Dependencias:', {
      accountId: selectedInstitution?.account?._id,
      divisionId: selectedInstitution?.division?._id,
      studentsLength: students.length
    });
    
    const fetchAsistenciaPorFecha = async () => {
      console.log('🔍 [FRONTEND] Iniciando fetchAsistenciaPorFecha...');
      console.log('🔍 [FRONTEND] selectedInstitution:', selectedInstitution);
      console.log('🔍 [FRONTEND] students cargados:', students.length);
      
      if (!selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
        console.log('❌ [FRONTEND] No hay institución seleccionada');
        return;
      }
      
      if (students.length === 0) {
        console.log('❌ [FRONTEND] No hay estudiantes cargados aún');
        return;
      }
      
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      console.log('🔍 [FRONTEND] Fecha a consultar:', dateStr);
      console.log('🔍 [FRONTEND] accountId:', selectedInstitution.account._id);
      console.log('🔍 [FRONTEND] divisionId:', selectedInstitution.division._id);
      
      try {
        const response = await apiClient.get('/asistencia/by-date', {
          params: {
            accountId: selectedInstitution.account._id,
            divisionId: selectedInstitution.division._id,
            date: dateStr
          }
        });
        
        console.log('🔍 [FRONTEND] Respuesta del servidor:', response.data);
        console.log('🔍 [FRONTEND] response.data.success:', response.data.success);
        console.log('🔍 [FRONTEND] response.data.data:', response.data.data);
        
        if (response.data.success && response.data.data) {
          const asistencia = response.data.data;
          console.log('🔍 [FRONTEND] Asistencia encontrada:', asistencia);
          console.log('🔍 [FRONTEND] Estudiantes en asistencia:', asistencia.estudiantes);
          
          const newAttendance: { [key: string]: boolean } = {};
          asistencia.estudiantes.forEach((e: any) => {
            console.log('🔍 [FRONTEND] Procesando estudiante:', e.student, 'presente:', e.presente);
            newAttendance[e.student] = e.presente;
          });
          
          console.log('🔍 [FRONTEND] newAttendance length:', Object.keys(newAttendance).length);
          console.log('🔍 [FRONTEND] newAttendance final:', newAttendance);
          console.log('🔍 [FRONTEND] students disponibles:', students.map(s => ({ id: s._id, nombre: s.nombre })));
          
          setAttendance(newAttendance);
        } else {
          console.log('🔍 [FRONTEND] No hay asistencia para hoy o respuesta inválida');
          console.log('🔍 [FRONTEND] response.data.success:', response.data.success);
          console.log('🔍 [FRONTEND] response.data.data:', response.data.data);
          setAttendance({});
        }
      } catch (error) {
        console.error('❌ [FRONTEND] Error consultando asistencia:', error);
        setAttendance({});
      }
    };
    
    // Solo ejecutar si tenemos estudiantes cargados
    if (students.length > 0) {
      fetchAsistenciaPorFecha();
      // También cargar retiradas para mostrar estado bloqueado desde el inicio
      loadDailyAttendance(false);
    }
  }, [selectedInstitution?.account?._id, selectedInstitution?.division?._id, students.length]);


  return (
    <View style={styles.homeContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          onOpenMenu={openMenu}
          activeStudent={getActiveStudent()}
        />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']} // Android
            tintColor="#FF8C42" // iOS
            title="Actualizando asistencias..."
            titleColor="#666"
          />
        }
      >
          
          {/* Institución y Sala destacadas */}
          <View style={styles.institutionInfo}>
            <Text style={styles.institutionName}>{getInstitutionName()}</Text>
            <Text style={styles.divisionName}>{getDivisionName()}</Text>
          </View>
          
          {/* Fecha en línea separada */}
          <Text style={styles.dateInfo}>{getCurrentDate()}</Text>

          {/* Estadísticas */}
          <View style={styles.estadisticas}>
              <TouchableOpacity 
                style={styles.todoContainer}
                onPress={toggleAllAttendance}
                activeOpacity={0.7}
              >
                <Text style={styles.todoText}>Todo</Text>
                <View style={[
                  styles.todoCircle,
                  presentStudents === totalStudents && totalStudents > 0 && styles.todoCircleChecked
                ]}>
                  {presentStudents === totalStudents && totalStudents > 0 && (
                    <Text style={styles.todoCheckText}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.totalText}>
                <Text>Total: </Text>
                <Text style={styles.numberText}>{totalStudents ?? 0}</Text>
                <Text> Presentes: </Text>
                <Text style={styles.presentesText}>{presentStudents ?? 0}</Text>
              </Text>
            </View>

        {/* Grid de personas para asistencias */}
        <View style={styles.personasGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando alumnos...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{String(error)}</Text>
              </View>
            ) : students.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay alumnos registrados</Text>
              </View>
            ) : (
              students.map((student, index) => {
                const isWithdrawn = withdrawals[student._id];
                
                return (
                  <TouchableOpacity 
                    key={student._id} 
                    style={[
                      styles.personaItem,
                      isWithdrawn && styles.blockedItem
                    ]}
                    onPress={() => toggleAttendance(student._id)}
                    activeOpacity={isWithdrawn ? 1 : 0.7}
                    disabled={isWithdrawn}
                  >
                    <View style={styles.personaAvatar}>
                      {student.avatar ? (
                        <Image 
                          source={{ uri: student.avatar }} 
                          style={[
                            styles.personaAvatarImage,
                            isWithdrawn && styles.blockedAvatarImage
                          ]}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={[
                          styles.personaIcon,
                          isWithdrawn && styles.blockedIcon
                        ]}>👤</Text>
                      )}
                      {attendance[student._id] && (
                        <View style={styles.checkMark}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                      {isWithdrawn && (
                        <View style={styles.withdrawnMark}>
                          <Text style={styles.withdrawnMarkText}>🚪</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.personaNombre,
                      isWithdrawn && styles.blockedText
                    ]}>{student.nombre || ''}</Text>
                    <Text style={[
                      styles.personaApellido,
                      isWithdrawn && styles.blockedText
                    ]}>{student.apellido || ''}</Text>
                    <Text style={[
                      styles.personaDivision,
                      isWithdrawn && styles.blockedText
                    ]}>{student.division?.nombre || ''}</Text>
                    {isWithdrawn && (
                      <Text style={styles.withdrawnStatusText}>
                        Retirado por: {withdrawals[student._id]?.withdrawnByName || ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

        {/* Mensaje de cambios pendientes */}
        {hasUnsavedChanges && (
          <View style={styles.unsavedChangesContainer}>
            <Text style={styles.unsavedChangesText}>
              Tienes cambios pendientes - Guarda la asistencia para confirmar
            </Text>
          </View>
        )}

        {/* Botones */}
        {/* Botón Guardar Asistencia */}
        <TouchableOpacity 
          style={[
            styles.modificarButton,
            hasUnsavedChanges && styles.modificarButtonHighlighted
          ]}
          onPress={handleSaveAttendance}
        >
          <Text style={styles.modificarButtonText}>
            Guardar Asistencia
          </Text>
        </TouchableOpacity>

        {/* Botón Escáner QR */}
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={() => setShowQRScanner(true)}
        >
          <Text style={styles.qrButtonText}>
            Escanear QR
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={isVisible}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        confirmText={alertConfig?.confirmText}
        cancelText={alertConfig?.cancelText}
        type={alertConfig?.type}
        onConfirm={alertConfig?.onConfirm}
        onCancel={alertConfig?.onCancel}
      />
      
      {/* QR Scanner */}
      <CameraKitQRScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onStudentFound={handleStudentFoundByQR}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // Reducido para eliminar espacio extra
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 150, // Espacio para el botón inferior
  },
  institutionInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  institutionName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    color: '#FF8C42',
    textAlign: 'center',
    marginBottom: 5,
  },
  divisionName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    color: '#FF8C42',
    textAlign: 'center',
  },
  dateInfo: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
  },
  todoText: {
    fontSize: 16,
    color: '#0E5FCE',
    marginRight: 10,
    fontWeight: '600',
  },
  todoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCircleChecked: {
    backgroundColor: '#0E5FCE',
    shadowColor: '#0E5FCE',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  todoCheckText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  todoContainerDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  totalText: {
    fontSize: 16,
    color: '#0E5FCE',
  },
  numberText: {
    fontFamily: fonts.bold,
  },
  presentesText: {
    color: '#FF8C42',
    fontFamily: fonts.bold,
  },
  personasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
    paddingBottom: 80, // Espacio adicional para el botón inferior
    backgroundColor: '#F8F9FA',
    marginHorizontal: 10,
    borderRadius: 15,
    paddingTop: 20,
  },
  personaItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 4,
  },
  personaAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  personaIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  personaAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  checkMark: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  personaNombre: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  personaApellido: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  personaDivision: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 1,
  },
  modificarButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 18,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  modificarButtonHighlighted: {
    backgroundColor: '#E65100',
    shadowColor: '#E65100',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modificarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  modificarButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  modificarButtonTextDisabled: {
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Estilos para botón QR
  qrButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  qrButtonTextDisabled: {
    color: '#999999',
  },
  // Estilos para alumnos ausentes
  absentItem: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  // Estilos para alumnos bloqueados (retirados)
  blockedItem: {
    backgroundColor: '#FFF8E1',
  },
  blockedAvatarImage: {
    opacity: 0.7,
  },
  blockedIcon: {
    opacity: 0.7,
  },
  blockedText: {
    opacity: 0.8,
    color: '#E65100',
    fontWeight: '600',
  },
  withdrawnMark: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF9800',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FF9800',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  withdrawnMarkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  withdrawnStatusText: {
    fontSize: 9,
    color: '#E65100',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 3,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  absentAvatarImage: {
    opacity: 0.5,
  },
  absentIcon: {
    opacity: 0.5,
  },
  absentMark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absentText: {
    color: '#999999',
  },
  absentStatusText: {
    fontSize: 10,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: fonts.medium,
  },
  withdrawnMark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  withdrawnByText: {
    fontSize: 10,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: fonts.medium,
  },
  // Estilos para mensaje de cambios pendientes
  unsavedChangesContainer: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  unsavedChangesText: {
    color: '#E65100',
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AsistenciaScreen; 