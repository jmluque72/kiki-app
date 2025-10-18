import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import PickupService, { Pickup } from '../src/services/pickupService';
import { toastService } from '../src/services/toastService';

interface QuienRetiraScreenProps {
  onBack: () => void;
}

const QuienRetiraScreen: React.FC<QuienRetiraScreenProps> = ({ onBack }) => {
  const { activeAssociation } = useAuth();
  const { userAssociations } = useInstitution();
  
  const [personasAutorizadas, setPersonasAutorizadas] = useState<Pickup[]>([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
  
  // Estado para formulario de nueva persona autorizada
  const [newPersonaData, setNewPersonaData] = useState({
    nombre: '',
    apellido: '',
    dni: ''
  });

  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';

  useEffect(() => {
    if (isFamilyAdmin) {
      loadPickupPersons();
    }
  }, [isFamilyAdmin]);

  // Cargar personas autorizadas
  const loadPickupPersons = async () => {
    if (!isFamilyAdmin) {
      console.log('⚠️ [loadPickupPersons] Usuario no es familyadmin');
      return;
    }

    try {
      setLoadingPickup(true);
      const userAssociation = userAssociations.find(assoc => assoc.account);
      
      if (!userAssociation || !userAssociation.division?._id) {
        console.log('⚠️ [loadPickupPersons] No se encontró división');
        return;
      }

      const pickups = await PickupService.getPickupsByDivision(userAssociation.division._id);
      console.log('✅ [loadPickupPersons] Pickups recibidos del servidor:', pickups);
      setPersonasAutorizadas(pickups);
      console.log('✅ [loadPickupPersons] Personas autorizadas cargadas:', pickups.length);
    } catch (error: any) {
      console.error('❌ [loadPickupPersons] Error al cargar personas autorizadas:', error);
      toastService.error('Error al cargar personas autorizadas');
    } finally {
      setLoadingPickup(false);
    }
  };

  // Abrir modal para agregar persona autorizada
  const handleOpenAddPersonaModal = () => {
    setNewPersonaData({ nombre: '', apellido: '', dni: '' });
    setShowAddPersonaModal(true);
  };

  // Cerrar modal de agregar persona autorizada
  const handleCloseAddPersonaModal = () => {
    setShowAddPersonaModal(false);
    setNewPersonaData({ nombre: '', apellido: '', dni: '' });
  };

  // Agregar persona autorizada
  const handleAddPersona = async () => {
    if (!newPersonaData.nombre.trim() || !newPersonaData.apellido.trim() || !newPersonaData.dni.trim()) {
      toastService.error('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoadingPickup(true);
      
      const userAssociation = userAssociations.find(assoc => assoc.account);
      
      if (!userAssociation) {
        toastService.error('No tienes instituciones asociadas');
        return;
      }

      const pickupData = {
        nombre: newPersonaData.nombre.trim(),
        apellido: newPersonaData.apellido.trim(),
        dni: newPersonaData.dni.trim(),
        divisionId: userAssociation.division?._id || ''
      };

      const newPickup = await PickupService.createPickup(pickupData);
      console.log('✅ [handleAddPersona] Nueva persona creada:', newPickup);
      
      setPersonasAutorizadas(prev => {
        const updated = [...prev, newPickup];
        console.log('✅ [handleAddPersona] Lista actualizada:', updated.length, 'personas');
        return updated;
      });
      handleCloseAddPersonaModal();
      toastService.success('Persona autorizada agregada correctamente');
    } catch (error: any) {
      console.error('Error al crear pickup:', error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.join('\n');
        toastService.error(errorMessages);
      } else if (error.response?.data?.message) {
        toastService.error(error.response.data.message);
      } else {
        toastService.error(error.message || 'Error al agregar persona autorizada');
      }
    } finally {
      setLoadingPickup(false);
    }
  };

  // Eliminar persona autorizada
  const handleDeletePersona = async (id: string) => {
    Alert.alert(
      'Eliminar persona autorizada',
      '¿Estás seguro de que quieres eliminar esta persona autorizada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingPickup(true);
              await PickupService.deletePickup(id);
              setPersonasAutorizadas(prev => prev.filter(p => p._id !== id));
              toastService.success('Persona autorizada eliminada correctamente');
            } catch (error: any) {
              console.error('Error al eliminar persona autorizada:', error);
              toastService.error(error.message || 'Error al eliminar persona autorizada');
            } finally {
              setLoadingPickup(false);
            }
          }
        }
      ]
    );
  };

  if (!isFamilyAdmin) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quien Retira</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.emptyText}>
            Solo los padres pueden gestionar personas autorizadas
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quien Retira</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleOpenAddPersonaModal} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Personas autorizadas para retirar al estudiante
        </Text>

        {loadingPickup ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E5FCE" />
            <Text style={styles.loadingText}>Cargando personas autorizadas...</Text>
          </View>
        ) : personasAutorizadas.length === 0 ? (
          <Text style={styles.emptyText}>No hay personas autorizadas</Text>
        ) : (
          <FlatList
            data={personasAutorizadas}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.personaItem}>
                <View style={styles.personaInfo}>
                  <Text style={styles.personaNombre}>
                    {item.nombre} {item.apellido}
                  </Text>
                  <Text style={styles.personaDni}>DNI: {item.dni}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePersona(item._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Modal para agregar persona autorizada */}
      <Modal
        visible={showAddPersonaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAddPersonaModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Persona Autorizada</Text>
              <TouchableOpacity
                onPress={handleCloseAddPersonaModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={newPersonaData.nombre}
                  onChangeText={(text) =>
                    setNewPersonaData(prev => ({ ...prev, nombre: text }))
                  }
                  placeholder="Ingrese el nombre"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={newPersonaData.apellido}
                  onChangeText={(text) =>
                    setNewPersonaData(prev => ({ ...prev, apellido: text }))
                  }
                  placeholder="Ingrese el apellido"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DNI *</Text>
                <TextInput
                  style={styles.input}
                  value={newPersonaData.dni}
                  onChangeText={(text) =>
                    setNewPersonaData(prev => ({ ...prev, dni: text }))
                  }
                  placeholder="Ingrese el DNI"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={handleCloseAddPersonaModal}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddPersona}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Agregar</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0E5FCE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 50,
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  personaInfo: {
    flex: 1,
  },
  personaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  personaDni: {
    fontSize: 14,
    color: '#666666',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0E5FCE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0E5FCE',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default QuienRetiraScreen;