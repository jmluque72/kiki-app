import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useInstitution } from '../contexts/InstitutionContext';
import { useStudents } from '../src/hooks/useStudents';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../src/services/api';
import CommonHeader from '../components/CommonHeader';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

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

  // Función para marcar/desmarcar asistencia
  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
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
        estudiantes: estudiantes
      };

      console.log('📤 Enviando datos de asistencia:', JSON.stringify(requestData, null, 2));

      const response = await apiClient.post('/asistencia', requestData);

      console.log('✅ Respuesta del servidor:', response.data);
      const result = response.data;

      if (result.success) {
        showSuccess('Asistencias', 'Asistencia guardada correctamente');
        // Limpiar el estado de asistencia después de guardar
        setAttendance({});
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
    const fetchAsistenciaPorFecha = async () => {
      console.log('🔍 [FRONTEND] Iniciando fetchAsistenciaPorFecha...');
      console.log('🔍 [FRONTEND] selectedInstitution:', selectedInstitution);
      
      if (!selectedInstitution?.account?._id || !selectedInstitution?.division?._id) {
        console.log('❌ [FRONTEND] No hay institución seleccionada');
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
        console.log('🔍 [FRONTEND] Condición completa:', response.data.success && response.data.data);
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
    fetchAsistenciaPorFecha();
  }, [selectedInstitution?.account?._id, selectedInstitution?.division?._id, students.length]);

  return (
    <View style={styles.homeContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={getActiveStudent()}
        />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Título y información */}
        <View style={styles.asistenciaInfo}>
          <Text style={styles.asistenciaTitle}>ASISTENCIA</Text>
          
          {/* Institución y Sala destacadas */}
          <View style={styles.institutionInfo}>
            <Text style={styles.institutionName}>{getInstitutionName()}</Text>
            <Text style={styles.divisionName}>{getDivisionName()}</Text>
          </View>
          
          {/* Fecha en línea separada */}
          <Text style={styles.dateInfo}>{getCurrentDate()}</Text>

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
        </View>

        {/* Grid de personas */}
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
            students.map((student, index) => (
              <TouchableOpacity 
                key={student._id} 
                style={styles.personaItem}
                onPress={() => toggleAttendance(student._id)}
                activeOpacity={0.7}
              >
                <View style={styles.personaAvatar}>
                  {student.avatar ? (
                    <Image 
                      source={{ uri: student.avatar }} 
                      style={styles.personaAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.personaIcon}>👤</Text>
                  )}
                  {attendance[student._id] && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.personaNombre}>{student.nombre}</Text>
                <Text style={styles.personaApellido}>{student.apellido}</Text>
                <Text style={styles.personaDivision}>{student.division?.nombre}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Botón Guardar Asistencia */}
        <TouchableOpacity 
          style={styles.modificarButton}
          onPress={handleSaveAttendance}
        >
          <Text style={styles.modificarButtonText}>Guardar Asistencia</Text>
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
  asistenciaInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  asistenciaTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    textAlign: 'center',
    marginBottom: 10,
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 16,
    color: '#0E5FCE',
    marginRight: 10,
  },
  todoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0E5FCE',
  },
  todoCircleChecked: {
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  personaItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
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
});

export default AsistenciaScreen; 