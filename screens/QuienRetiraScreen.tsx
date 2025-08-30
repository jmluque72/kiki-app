import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';
import { apiClient } from '../src/services/api';
import { useApiErrorHandler } from '../components/ApiErrorHandler';
import PickupService from '../src/services/pickupService';
import PickupModal from '../components/PickupModal';

interface Pickup {
  _id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  relacion: string;
  division: {
    _id: string;
    nombre: string;
  };
  student: {
    _id: string;
    name: string;
    apellido: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

const QuienRetiraScreen: React.FC<{ onOpenNotifications: () => void }> = ({ onOpenNotifications }) => {
  const { user } = useAuth();
  const { selectedInstitution, userAssociations } = useInstitution();
  const { showError } = useApiErrorHandler();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [divisions, setDivisions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);

  // Verificar si el usuario tiene el rol correcto
  const isFamilyAdmin = user?.role?.nombre === 'familyadmin';
  
  // Debug: Log del rol del usuario
  console.log('🔍 [QuienRetiraScreen] Rol del usuario:', user?.role?.nombre);
  console.log('🔍 [QuienRetiraScreen] isFamilyAdmin:', isFamilyAdmin);
  console.log('🔍 [QuienRetiraScreen] Institución seleccionada:', selectedInstitution?.account?.nombre);
  console.log('🔍 [QuienRetiraScreen] Asociaciones del usuario:', userAssociations.length);

  useEffect(() => {
    if (isFamilyAdmin && selectedInstitution) {
      loadDivisions();
      loadPickups();
    }
  }, [isFamilyAdmin, selectedInstitution]);

  const loadDivisions = async () => {
    try {
      // Obtener las divisiones de las asociaciones del usuario para la institución seleccionada
      const userDivisions = userAssociations
        .filter((assoc: any) => 
          assoc.account._id === selectedInstitution?.account._id && 
          assoc.division
        )
        .map((assoc: any) => assoc.division);
      
      setDivisions(userDivisions);
      console.log('🔍 [QuienRetiraScreen] Divisiones cargadas:', userDivisions.length);
    } catch (error) {
      console.error('Error cargando divisiones:', error);
    }
  };

  const loadStudents = async (divisionId: string) => {
    if (divisionId === 'all') {
      setStudents([]);
      return;
    }

    try {
      const studentsData = await PickupService.getStudentsByDivision(divisionId);
      setStudents(studentsData);
      console.log('🔍 [QuienRetiraScreen] Estudiantes cargados:', studentsData.length);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    }
  };

  const loadPickups = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (selectedDivision !== 'all') {
        params.division = selectedDivision;
      }
      if (selectedStudent !== 'all') {
        params.student = selectedStudent;
      }

      console.log('🔍 [QuienRetiraScreen] Cargando pickups con parámetros:', params);
      const response = await PickupService.getPickups(params);
      setPickups(response.pickups);
      console.log('🔍 [QuienRetiraScreen] Pickups cargados:', response.pickups.length);
    } catch (error: any) {
      showError(error, 'Error al cargar quién retira');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPickups();
    setRefreshing(false);
  };

  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivision(divisionId);
    setSelectedStudent('all');
    loadStudents(divisionId);
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  const addPickup = () => {
    setSelectedPickup(null);
    setModalVisible(true);
  };

  const editPickup = (pickup: Pickup) => {
    setSelectedPickup(pickup);
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    loadPickups();
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedPickup(null);
  };

  const deletePickup = (pickup: Pickup) => {
    Alert.alert(
      'Eliminar Quien Retira',
      `¿Estás seguro de que deseas eliminar a ${pickup.nombre} ${pickup.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await PickupService.deletePickup(pickup._id);
            Alert.alert('Éxito', 'Persona eliminada correctamente');
            loadPickups();
          } catch (error: any) {
            showError(error, 'Error al eliminar');
          }
        }}
      ]
    );
  };

  // Si el usuario no es familyadmin, mostrar mensaje de acceso denegado
  if (!isFamilyAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quien Retira</Text>
          <TouchableOpacity onPress={onOpenNotifications} style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedIcon}>🚫</Text>
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            Solo los administradores familiares pueden acceder a esta sección.
          </Text>
        </View>
      </View>
    );
  }

  // Si no hay institución seleccionada, mostrar mensaje
  if (!selectedInstitution) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quien Retira</Text>
          <TouchableOpacity onPress={onOpenNotifications} style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedIcon}>🏫</Text>
          <Text style={styles.accessDeniedTitle}>Institución Requerida</Text>
          <Text style={styles.accessDeniedMessage}>
            Debes seleccionar una institución para acceder a esta sección.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quien Retira</Text>
        <TouchableOpacity onPress={onOpenNotifications} style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Información de la institución */}
      <View style={styles.institutionInfo}>
        <Text style={styles.institutionName}>{selectedInstitution.account.nombre}</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>División:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedDivision === 'all' && styles.filterChipActive]}
              onPress={() => handleDivisionChange('all')}
            >
              <Text style={[styles.filterChipText, selectedDivision === 'all' && styles.filterChipTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            {divisions.map((division) => (
              <TouchableOpacity
                key={division._id}
                style={[styles.filterChip, selectedDivision === division._id && styles.filterChipActive]}
                onPress={() => handleDivisionChange(division._id)}
              >
                <Text style={[styles.filterChipText, selectedDivision === division._id && styles.filterChipTextActive]}>
                  {division.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedDivision !== 'all' && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Estudiante:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedStudent === 'all' && styles.filterChipActive]}
                onPress={() => handleStudentChange('all')}
              >
                <Text style={[styles.filterChipText, selectedStudent === 'all' && styles.filterChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {students.map((student) => (
                <TouchableOpacity
                  key={student._id}
                  style={[styles.filterChip, selectedStudent === student._id && styles.filterChipActive]}
                  onPress={() => handleStudentChange(student._id)}
                >
                  <Text style={[styles.filterChipText, selectedStudent === student._id && styles.filterChipTextActive]}>
                    {student.name} {student.apellido}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Botón Agregar */}
      <TouchableOpacity style={styles.addButton} onPress={addPickup}>
        <Text style={styles.addButtonText}>+ Agregar Quien Retira</Text>
      </TouchableOpacity>

      {/* Lista de Quien Retira */}
      <ScrollView
        style={styles.pickupsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E5FCE" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : pickups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No hay personas registradas</Text>
            <Text style={styles.emptyMessage}>
              No se encontraron personas autorizadas para retirar estudiantes.
            </Text>
          </View>
        ) : (
          pickups.map((pickup) => (
            <View key={pickup._id} style={styles.pickupCard}>
              <View style={styles.pickupHeader}>
                <Text style={styles.pickupName}>
                  {pickup.nombre} {pickup.apellido}
                </Text>
                <View style={styles.pickupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => editPickup(pickup)}
                  >
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deletePickup(pickup)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.pickupDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DNI:</Text>
                  <Text style={styles.detailValue}>{pickup.dni}</Text>
                </View>
                
                {pickup.telefono && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Teléfono:</Text>
                    <Text style={styles.detailValue}>{pickup.telefono}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Relación:</Text>
                  <Text style={styles.detailValue}>{pickup.relacion}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estudiante:</Text>
                  <Text style={styles.detailValue}>
                    {pickup.student.name} {pickup.student.apellido}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>División:</Text>
                  <Text style={styles.detailValue}>{pickup.division.nombre}</Text>
                </View>
              </View>
              
              <View style={styles.pickupStatus}>
                <View style={[
                  styles.statusIndicator,
                  pickup.status === 'active' ? styles.statusActive : styles.statusInactive
                ]} />
                <Text style={styles.statusText}>
                  {pickup.status === 'active' ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para agregar/editar */}
      <PickupModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        pickup={selectedPickup}
        divisions={divisions}
        students={students}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0E5FCE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  institutionInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterRow: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#0E5FCE',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FF8C42',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickupsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pickupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pickupActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  deleteButton: {
    backgroundColor: '#FFE6E6',
  },
  actionButtonText: {
    fontSize: 16,
  },
  pickupDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pickupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default QuienRetiraScreen;
