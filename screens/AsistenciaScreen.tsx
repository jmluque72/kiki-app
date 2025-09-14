import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Modal
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useInstitution } from '../contexts/InstitutionContext';
import { useStudents } from '../src/hooks/useStudents';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../src/services/api';
import CommonHeader from '../components/CommonHeader';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import CameraKitQRScanner from '../components/CameraKitQRScanner';

const AsistenciaScreen = ({ onOpenNotifications }: { onOpenNotifications: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  const { token } = useAuth();
  const { showSuccess, showError, isVisible, alertConfig } = useCustomAlert();
  
  const { students, loading, error, total } = useStudents(
    selectedInstitution?.account._id,
    selectedInstitution?.division?._id
  );

  // Estado para manejar la asistencia de cada alumno
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  
  // Estado para el escáner QR
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState<'attendance' | 'withdrawal'>('attendance');
  
  // Estado para retiradas
  const [withdrawals, setWithdrawals] = useState<{ [key: string]: { studentId: string, withdrawnBy: string, withdrawnByName: string } }>({});
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedStudentForWithdrawal, setSelectedStudentForWithdrawal] = useState<any>(null);
  const [authorizedContacts, setAuthorizedContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  

  // Función para marcar/desmarcar asistencia
  const toggleAttendance = (studentId: string) => {
    // Verificar si el alumno ya fue retirado
    if (withdrawals[studentId]) {
      showError('No se puede modificar', 'Este alumno ya fue retirado y no se puede cambiar su asistencia');
      return;
    }
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Función para cargar asistencias del día
  const loadDailyAttendance = async () => {
    if (!selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
      return;
    }

    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

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
        console.log('✅ [ATTENDANCE] Asistencias cargadas:', attendanceMap);
        console.log('✅ [WITHDRAWALS] Retiradas cargadas:', withdrawalsMap);
      } else {
        setAttendance({});
        setWithdrawals({});
        console.log('ℹ️ [ATTENDANCE] No hay asistencias para hoy');
      }
    } catch (error) {
      console.error('❌ [ATTENDANCE] Error cargando asistencias:', error);
      setAttendance({});
      setWithdrawals({});
    }
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
      showError('El alumno debe estar presente para poder ser retirado');
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
        // Limpiar el estado de asistencia y retiradas después de guardar
        setAttendance({});
        setWithdrawals({});
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
      loadDailyAttendance();
    }
  }, [selectedInstitution?.account?._id, selectedInstitution?.division?._id, students.length]);


  return (
    <View style={styles.homeContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={getActiveStudent()}
        />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Pestañas para coordinadores */}
          {token && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
                onPress={() => setActiveTab('attendance')}
              >
                <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
                  Asistencias
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'withdrawal' && styles.activeTab]}
                onPress={() => setActiveTab('withdrawal')}
              >
                <Text style={[styles.tabText, activeTab === 'withdrawal' && styles.activeTabText]}>
                  Retiradas
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Institución y Sala destacadas */}
          <View style={styles.institutionInfo}>
            <Text style={styles.institutionName}>{getInstitutionName()}</Text>
            <Text style={styles.divisionName}>{getDivisionName()}</Text>
          </View>
          
          {/* Fecha en línea separada */}
          <Text style={styles.dateInfo}>{getCurrentDate()}</Text>

          {/* Estadísticas solo para pestaña de asistencias */}
          {activeTab === 'attendance' && (
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
                Total: <Text style={styles.numberText}>{totalStudents}</Text> Presentes: <Text style={styles.presentesText}>{presentStudents}</Text>
              </Text>
            </View>
          )}

        {/* Contenido según pestaña activa */}
        {activeTab === 'attendance' ? (
          /* Grid de personas para asistencias */
          <View style={styles.personasGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando alumnos...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : students.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay alumnos registrados</Text>
              </View>
            ) : (
              students.map((student, index) => {
                const isWithdrawn = withdrawals[student._id];
                const isBlocked = isWithdrawn;
                
                return (
                  <TouchableOpacity 
                    key={student._id} 
                    style={[
                      styles.personaItem,
                      isBlocked && styles.blockedItem
                    ]}
                    onPress={() => toggleAttendance(student._id)}
                    activeOpacity={isBlocked ? 1 : 0.7}
                    disabled={isBlocked}
                  >
                    <View style={styles.personaAvatar}>
                      {student.avatar ? (
                        <Image 
                          source={{ uri: student.avatar }} 
                          style={[
                            styles.personaAvatarImage,
                            isBlocked && styles.blockedAvatarImage
                          ]}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={[
                          styles.personaIcon,
                          isBlocked && styles.blockedIcon
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
                      isBlocked && styles.blockedText
                    ]}>{student.nombre}</Text>
                    <Text style={[
                      styles.personaApellido,
                      isBlocked && styles.blockedText
                    ]}>{student.apellido}</Text>
                    <Text style={[
                      styles.personaDivision,
                      isBlocked && styles.blockedText
                    ]}>{student.division?.nombre}</Text>
                    {isWithdrawn && (
                      <Text style={styles.withdrawnStatusText}>
                        Retirado por: {withdrawals[student._id].withdrawnByName}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          /* Grid de personas para retiradas */
          <View style={styles.personasGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando alumnos...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
        )}

        {/* Botones solo para pestaña de asistencias */}
        {activeTab === 'attendance' && (
          <>
            {/* Botón Escáner QR */}
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => setShowQRScanner(true)}
            >
              <Text style={styles.qrButtonText}>Escanear QR</Text>
            </TouchableOpacity>

            {/* Botón Guardar Asistencia */}
            <TouchableOpacity 
              style={styles.modificarButton}
              onPress={handleSaveAttendance}
            >
              <Text style={styles.modificarButtonText}>Guardar Asistencia</Text>
            </TouchableOpacity>
          </>
        )}
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
                  </Text>
                  <Text style={styles.withdrawalOptionSubtext}>Tutor Principal</Text>
                </TouchableOpacity>
              )}
              
              {/* Tutor Secundario (familyviewer) */}
              {selectedStudentForWithdrawal?.tutor?.familyviewer && (
                <TouchableOpacity
                  style={styles.withdrawalOption}
                  onPress={() => confirmWithdrawal('familyviewer', selectedStudentForWithdrawal.tutor.familyviewer.name)}
                >
                  <Text style={styles.withdrawalOptionText}>
                    {selectedStudentForWithdrawal.tutor.familyviewer.name}
                  </Text>
                  <Text style={styles.withdrawalOptionSubtext}>Tutor Secundario</Text>
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
                    onPress={() => confirmWithdrawal('contact', contact.nombre)}
                  >
                    <Text style={styles.withdrawalOptionText}>
                      {contact.nombre}
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
    marginBottom: 30,
  },
  modificarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.semiBold,
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
  // Estilos para pestañas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#0E5FCE',
    shadowColor: '#0E5FCE',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  tabText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
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

export default AsistenciaScreen; 