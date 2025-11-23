import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

interface RetirarScreenProps {
  onBack: () => void;
}

const RetirarScreen: React.FC<RetirarScreenProps> = ({ onBack }) => {
  const { selectedInstitution, getActiveStudent } = useInstitution();
  const { showSuccess, showError, isVisible, alertConfig } = useCustomAlert();
  
  const { students, loading, error } = useStudents(
    selectedInstitution?.account._id,
    selectedInstitution?.division?._id
  );

  // Estado para manejar la asistencia de cada alumno (para verificar si están presentes)
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  
  // Estado para retiradas
  const [withdrawals, setWithdrawals] = useState<{ [key: string]: { studentId: string, withdrawnBy: string, withdrawnByName: string } }>({});
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedStudentForWithdrawal, setSelectedStudentForWithdrawal] = useState<any>(null);
  const [authorizedContacts, setAuthorizedContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Estado para pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

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

      console.log('🔄 [RETIRAR] Cargando asistencias para:', dateStr);

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
        console.log('✅ [RETIRAR] Asistencias cargadas:', attendanceMap);
        console.log('✅ [RETIRAR] Retiradas cargadas:', withdrawalsMap);
      } else {
        setAttendance({});
        setWithdrawals({});
        console.log('ℹ️ [RETIRAR] No hay asistencias para hoy');
      }
    } catch (error) {
      console.error('❌ [RETIRAR] Error cargando asistencias:', error);
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

  // Función para cargar perfiles del estudiante
  const loadStudentProfiles = async (studentId: string) => {
    setLoadingContacts(true);
    try {
      // Cargar contactos autorizados (pickups)
      const pickupsResponse = await apiClient.get(`/pickups/by-student/${studentId}`);
      const pickups = pickupsResponse.data.success ? pickupsResponse.data.data || [] : [];

      // Cargar información del estudiante con tutores
      const studentResponse = await apiClient.get(`/students/${studentId}`);
      let studentData = null;
      
      if (studentResponse.data.success) {
        studentData = studentResponse.data.data;
      }

      setAuthorizedContacts(pickups);
      setSelectedStudentForWithdrawal(prev => ({
        ...prev,
        tutor: studentData?.tutor || null
      }));

    } catch (error) {
      console.error('Error cargando perfiles del estudiante:', error);
      setAuthorizedContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Función para manejar retirada de estudiante
  const handleWithdrawal = async (student: any) => {
    // Verificar si el estudiante está presente
    if (!attendance[student._id]) {
      showError('Error', 'El alumno debe estar presente para poder ser retirado');
      return;
    }
    
    // Verificar si el alumno ya fue retirado
    if (withdrawals[student._id]) {
      showError('No se puede modificar', 'Este alumno ya fue retirado y no se puede cambiar su estado');
      return;
    }
    
    setSelectedStudentForWithdrawal(student);
    await loadStudentProfiles(student._id);
    setShowWithdrawalModal(true);
  };

  // Función para confirmar retirada
  const confirmWithdrawal = async (withdrawnBy: string, withdrawnByName: string) => {
    if (!selectedStudentForWithdrawal || !selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
      showError('Error', 'Datos incompletos para registrar la retirada');
      return;
    }

    try {
      console.log('🚀 [FRONTEND] Guardando retirada inmediatamente...');
      
      const requestData = {
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division._id,
        studentId: selectedStudentForWithdrawal._id,
        withdrawnBy,
        withdrawnByName
      };

      console.log('📤 [FRONTEND] Enviando datos de retirada:', JSON.stringify(requestData, null, 2));

      const response = await apiClient.post('/asistencia/retirada', requestData);
      
      console.log('✅ [FRONTEND] Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Actualizar el estado local
        setWithdrawals(prev => ({
          ...prev,
          [selectedStudentForWithdrawal._id]: {
            studentId: selectedStudentForWithdrawal._id,
            withdrawnBy,
            withdrawnByName
          }
        }));
        
        setShowWithdrawalModal(false);
        setSelectedStudentForWithdrawal(null);
        showSuccess('Retirada', 'Retirada registrada exitosamente');
        // Recargar datos
        await loadDailyAttendance(false);
      } else {
        showError('Error', response.data.message || 'Error al registrar la retirada');
      }
    } catch (error: any) {
      console.error('❌ [FRONTEND] Error guardando retirada:', error);
      showError('Error', 'Error de conexión al registrar la retirada');
    }
  };

  // Función para cancelar retirada
  const cancelWithdrawal = () => {
    setShowWithdrawalModal(false);
    setSelectedStudentForWithdrawal(null);
  };

  const getInstitutionName = () => {
    if (selectedInstitution) {
      return selectedInstitution.account.nombre;
    }
    return 'Institución';
  };

  const getDivisionName = () => {
    if (selectedInstitution?.division?.nombre) {
      return selectedInstitution.division.nombre;
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

  // Cargar asistencias al montar el componente
  useEffect(() => {
    if (students.length > 0) {
      loadDailyAttendance(false);
    }
  }, [selectedInstitution?.account?._id, selectedInstitution?.division?._id, students.length]);

  return (
    <View style={styles.container}>
      <CommonHeader 
        onOpenNotifications={() => {}}
        onOpenMenu={() => {}}
        activeStudent={getActiveStudent()}
      />
      
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retirar Alumnos</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']}
            tintColor="#FF8C42"
            title="Actualizando..."
            titleColor="#666"
          />
        }
      >
        {/* Institución y Sala destacadas */}
        <View style={styles.institutionInfo}>
          <Text style={styles.institutionName}>{getInstitutionName()}</Text>
          <Text style={styles.divisionName}>{getDivisionName()}</Text>
        </View>
        
        {/* Fecha */}
        <Text style={styles.dateInfo}>{getCurrentDate()}</Text>

        {/* Mensaje instructivo */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tocar sobre el estudiante presente para configurar la retirada
          </Text>
        </View>

        {/* Grid de personas para retiradas */}
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
              const isPresent = attendance[student._id];
              const isWithdrawn = withdrawals[student._id];
              
              return (
                <TouchableOpacity 
                  key={student._id} 
                  style={[
                    styles.personaItem, 
                    !isPresent && styles.absentItem,
                    isWithdrawn && styles.withdrawnItem
                  ]}
                  onPress={() => handleWithdrawal(student)}
                  activeOpacity={isPresent ? 0.7 : 1}
                  disabled={!isPresent}
                >
                  <View style={styles.personaAvatar}>
                    {student.avatar ? (
                      <Image 
                        source={{ uri: student.avatar }} 
                        style={[
                          styles.personaAvatarImage,
                          !isPresent && styles.absentAvatarImage
                        ]}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={[styles.personaIcon, !isPresent && styles.absentIcon]}>👤</Text>
                    )}
                    {!isPresent && (
                      <View style={styles.absentMark}>
                        <Text style={styles.absentText}>❌</Text>
                      </View>
                    )}
                    {isWithdrawn && (
                      <View style={styles.withdrawnMark}>
                        <Text style={styles.withdrawnText}>🏠</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.personaNombre,
                    !isPresent && styles.absentText
                  ]}>{student.nombre}</Text>
                  <Text style={[
                    styles.personaApellido,
                    !isPresent && styles.absentText
                  ]}>{student.apellido}</Text>
                  <Text style={styles.personaDivision}>{student.division?.nombre}</Text>
                  {!isPresent && (
                    <Text style={styles.absentStatusText}>No presente</Text>
                  )}
                  {isWithdrawn && (
                    <Text style={styles.withdrawnByText}>
                      Retirado por: {withdrawals[student._id].withdrawnByName}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
      
      {/* Modal de Retirada */}
      <Modal
        visible={showWithdrawalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelWithdrawal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Quién retira al alumno?</Text>
            <Text style={styles.modalSubtitle}>
              {selectedStudentForWithdrawal?.nombre} {selectedStudentForWithdrawal?.apellido}
            </Text>
            
            <View style={styles.withdrawalOptions}>
              {/* Tutor Principal (familyadmin) */}
              {selectedStudentForWithdrawal?.tutor?.familyadmin && (
                <TouchableOpacity
                  style={styles.withdrawalOption}
                  onPress={() => confirmWithdrawal('familyadmin', selectedStudentForWithdrawal.tutor.familyadmin.name)}
                >
                  <Text style={styles.withdrawalOptionText}>
                    {selectedStudentForWithdrawal.tutor.familyadmin.name}
                    {selectedStudentForWithdrawal.tutor.familyadmin.dni ? ` - DNI: ${selectedStudentForWithdrawal.tutor.familyadmin.dni}` : ''}
                  </Text>
                  <Text style={styles.withdrawalOptionSubtext}>Tutor Principal</Text>
                </TouchableOpacity>
              )}
              
              {/* Visualizador (familyviewer) */}
              {selectedStudentForWithdrawal?.tutor?.familyviewer && (
                <TouchableOpacity
                  style={styles.withdrawalOption}
                  onPress={() => confirmWithdrawal('familyviewer', selectedStudentForWithdrawal.tutor.familyviewer.name)}
                >
                  <Text style={styles.withdrawalOptionText}>
                    {selectedStudentForWithdrawal.tutor.familyviewer.name}
                    {selectedStudentForWithdrawal.tutor.familyviewer.dni ? ` - DNI: ${selectedStudentForWithdrawal.tutor.familyviewer.dni}` : ''}
                  </Text>
                  <Text style={styles.withdrawalOptionSubtext}>Visualizador</Text>
                </TouchableOpacity>
              )}
              
              {/* Contactos Autorizados */}
              {loadingContacts ? (
                <View style={styles.loadingContactsContainer}>
                  <Text style={styles.loadingContactsText}>Cargando contactos autorizados...</Text>
                </View>
              ) : authorizedContacts.length > 0 ? (
                authorizedContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.withdrawalOption}
                    onPress={() => confirmWithdrawal('contact', `${contact.nombre} ${contact.apellido || ''}`.trim())}
                  >
                    <Text style={styles.withdrawalOptionText}>
                      {contact.nombre} {contact.apellido || ''} {contact.dni ? `- DNI: ${contact.dni}` : ''}
                    </Text>
                    <Text style={styles.withdrawalOptionSubtext}>
                      {contact.telefono ? `Tel: ${contact.telefono}` : 'Contacto Autorizado'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noContactsContainer}>
                  <Text style={styles.noContactsText}>No hay contactos autorizados</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={cancelWithdrawal}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  institutionInfo: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
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
  instructionContainer: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  instructionText: {
    color: '#1976D2',
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: 'center',
    fontWeight: '500',
  },
  personasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
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
  // Estilos para retiradas
  withdrawnItem: {
    backgroundColor: '#E8F5E8',
  },
  // Estilos para alumnos ausentes
  absentItem: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
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
  // Estilos para modal de retirada
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  withdrawalOptions: {
    marginBottom: 20,
  },
  withdrawalOption: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  withdrawalOptionText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  withdrawalOptionSubtext: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#666',
    textAlign: 'center',
  },
  loadingContactsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContactsText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#666',
    textAlign: 'center',
  },
  noContactsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noContactsText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#999',
    textAlign: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});

export default RetirarScreen;

