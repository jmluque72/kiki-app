import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useApiErrorHandler } from './ApiErrorHandler';
import PickupService from '../src/services/pickupService';

interface PickupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pickup?: any; // Para edición
  divisions: any[];
  students: any[];
}

const PickupModal: React.FC<PickupModalProps> = ({
  visible,
  onClose,
  onSuccess,
  pickup,
  divisions,
  students
}) => {
  const { showError } = useApiErrorHandler();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    relacion: '',
    divisionId: '',
    studentId: ''
  });

  const isEditing = !!pickup;

  useEffect(() => {
    if (visible) {
      if (isEditing && pickup) {
        setFormData({
          nombre: pickup.nombre || '',
          apellido: pickup.apellido || '',
          dni: pickup.dni || '',
          telefono: pickup.telefono || '',
          relacion: pickup.relacion || '',
          divisionId: pickup.division?._id || '',
          studentId: pickup.student?._id || ''
        });
      } else {
        setFormData({
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          relacion: '',
          divisionId: '',
          studentId: ''
        });
      }
    }
  }, [visible, pickup, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      console.log('Error: El nombre es obligatorio');
      return false;
    }
    if (!formData.apellido.trim()) {
      console.log('Error: El apellido es obligatorio');
      return false;
    }
    if (!formData.dni.trim()) {
      console.log('Error: El DNI es obligatorio');
      return false;
    }
    if (!formData.relacion.trim()) {
      console.log('Error: La relación es obligatoria');
      return false;
    }
    if (!formData.divisionId) {
      console.log('Error: Debe seleccionar una división');
      return false;
    }
    if (!formData.studentId) {
      console.log('Error: Debe seleccionar un estudiante');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        await PickupService.updatePickup(pickup._id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          telefono: formData.telefono,
          relacion: formData.relacion
        });
        console.log('Éxito: Persona actualizada correctamente');
      } else {
        await PickupService.createPickup({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          telefono: formData.telefono,
          relacion: formData.relacion,
          divisionId: formData.divisionId,
          studentId: formData.studentId
        });
        console.log('Éxito: Persona agregada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      showError(error, `Error al ${isEditing ? 'actualizar' : 'agregar'} persona`);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionChange = (divisionId: string) => {
    setFormData(prev => ({
      ...prev,
      divisionId,
      studentId: '' // Reset student when division changes
    }));
  };

  const filteredStudents = formData.divisionId 
    ? students.filter(student => student.division === formData.divisionId)
    : students;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Quien Retira' : 'Agregar Quien Retira'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nombre}
                onChangeText={(value) => handleInputChange('nombre', value)}
                placeholder="Ingrese el nombre"
                maxLength={50}
              />
            </View>

            {/* Apellido */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Apellido *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.apellido}
                onChangeText={(value) => handleInputChange('apellido', value)}
                placeholder="Ingrese el apellido"
                maxLength={50}
              />
            </View>

            {/* DNI */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DNI *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dni}
                onChangeText={(value) => handleInputChange('dni', value)}
                placeholder="Ingrese el DNI"
                keyboardType="numeric"
                maxLength={15}
              />
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.textInput}
                value={formData.telefono}
                onChangeText={(value) => handleInputChange('telefono', value)}
                placeholder="Ingrese el teléfono"
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            {/* Relación */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relación *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.relacion}
                onChangeText={(value) => handleInputChange('relacion', value)}
                placeholder="Ej: Padre, Madre, Abuelo, Tío, etc."
                maxLength={50}
              />
            </View>

            {/* División */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>División *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {divisions.map((division) => (
                    <TouchableOpacity
                      key={division._id}
                      style={[
                        styles.chip,
                        formData.divisionId === division._id && styles.chipSelected
                      ]}
                      onPress={() => handleDivisionChange(division._id)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.divisionId === division._id && styles.chipTextSelected
                      ]}>
                        {division.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Estudiante */}
            {formData.divisionId && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estudiante *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {filteredStudents.map((student) => (
                      <TouchableOpacity
                        key={student._id}
                        style={[
                          styles.chip,
                          formData.studentId === student._id && styles.chipSelected
                        ]}
                        onPress={() => handleInputChange('studentId', student._id)}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.studentId === student._id && styles.chipTextSelected
                        ]}>
                          {student.name} {student.apellido}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Actualizar' : 'Agregar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#0E5FCE',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PickupModal;
