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

const StudentActionsScreen: React.FC = () => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution } = useInstitution();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [actions, setActions] = useState<StudentAction[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAction, setSelectedAction] = useState<StudentAction | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [comments, setComments] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLogs, setActionLogs] = useState<StudentActionLog[]>([]);

  useEffect(() => {
    loadStudents();
    loadActions();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentActions();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/students?accountId=${selectedInstitution?._id}&divisionId=${activeAssociation?.division?._id}`);
      setStudents(response.data.data.students || []);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      Alert.alert('Error', 'No se pudieron cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const loadActions = async () => {
    try {
      if (!activeAssociation?.division?._id) return;
      
      const response = await apiClient.get(`/api/student-actions/division/${activeAssociation.division._id}`);
      setActions(response.data.data || []);
    } catch (error) {
      console.error('Error cargando acciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las acciones');
    }
  };

  const loadStudentActions = async () => {
    try {
      if (!selectedStudent) return;
      
      const response = await apiClient.get(`/api/student-actions/log/student/${selectedStudent._id}?fecha=${selectedDate}`);
      setActionLogs(response.data.data || []);
    } catch (error) {
      console.error('Error cargando acciones del estudiante:', error);
    }
  };

  const handleRegisterAction = async () => {
    if (!selectedStudent || !selectedAction) {
      Alert.alert('Error', 'Por favor selecciona un estudiante y una acción');
      return;
    }

    try {
      setLoading(true);
      
      const fechaAccion = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const response = await apiClient.post('/api/student-actions/log', {
        estudiante: selectedStudent._id,
        accion: selectedAction._id,
        comentarios: comments,
        fechaAccion: fechaAccion.toISOString(),
        imagenes: [] // Por ahora sin imágenes
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Acción registrada correctamente');
        setShowModal(false);
        setComments('');
        loadStudentActions();
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

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[
        styles.studentItem,
        selectedStudent?._id === item._id && styles.selectedStudent
      ]}
      onPress={() => setSelectedStudent(item)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.nombre} {item.apellido}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAction = ({ item }: { item: StudentAction }) => (
    <TouchableOpacity
      style={[
        styles.actionItem,
        { backgroundColor: item.color + '20', borderLeftColor: item.color },
        selectedAction?._id === item._id && styles.selectedAction
      ]}
      onPress={() => setSelectedAction(item)}
    >
      <View style={styles.actionInfo}>
        <Text style={styles.actionName}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.actionDescription}>{item.descripcion}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActionLog = ({ item }: { item: StudentActionLog }) => (
    <View style={[styles.actionLogItem, { borderLeftColor: item.accion.color }]}>
      <View style={styles.actionLogHeader}>
        <Text style={styles.actionLogName}>{item.accion.nombre}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Acciones de Estudiantes</Text>
      
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

      {/* Selector de acción */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar Acción</Text>
        <FlatList
          data={actions}
          renderItem={renderAction}
          keyExtractor={(item) => item._id}
          numColumns={2}
          style={styles.actionsList}
        />
      </View>

      {/* Botón para registrar */}
      <TouchableOpacity
        style={[
          styles.registerButton,
          (!selectedStudent || !selectedAction) && styles.disabledButton
        ]}
        onPress={() => setShowModal(true)}
        disabled={!selectedStudent || !selectedAction}
      >
        <Text style={styles.registerButtonText}>Registrar Acción</Text>
      </TouchableOpacity>

      {/* Historial de acciones del estudiante seleccionado */}
      {selectedStudent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Acciones de {selectedStudent.nombre} {selectedStudent.apellido}
          </Text>
          <FlatList
            data={actionLogs}
            renderItem={renderActionLog}
            keyExtractor={(item) => item._id}
            style={styles.actionLogsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay acciones registradas para este día</Text>
            }
          />
        </View>
      )}

      {/* Modal para registrar acción */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Acción</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Estudiante:</Text>
              <Text style={styles.modalValue}>
                {selectedStudent?.nombre} {selectedStudent?.apellido}
              </Text>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Acción:</Text>
              <Text style={[styles.modalValue, { color: selectedAction?.color }]}>
                {selectedAction?.nombre}
              </Text>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Fecha:</Text>
              <TextInput
                style={styles.modalInput}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Hora:</Text>
              <TextInput
                style={styles.modalInput}
                value={selectedTime}
                onChangeText={setSelectedTime}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Comentarios:</Text>
              <TextInput
                style={[styles.modalInput, styles.commentsInput]}
                value={comments}
                onChangeText={setComments}
                placeholder="Comentarios adicionales..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRegisterAction}
                disabled={loading}
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
    maxHeight: 100,
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
  studentInfo: {
    alignItems: 'center',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  actionsList: {
    maxHeight: 200,
  },
  actionItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    flex: 1,
  },
  selectedAction: {
    borderColor: '#0E5FCE',
    backgroundColor: '#0E5FCE10',
  },
  actionInfo: {
    alignItems: 'center',
  },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#0E5FCE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionLogsList: {
    maxHeight: 300,
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
    color: '#666',
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
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
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
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentActionsScreen;
