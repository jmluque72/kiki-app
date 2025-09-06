import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  FlatList
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContext';
import { useStudents } from '../src/hooks/useStudents';
import { API_FULL_URL } from '../src/config/apiConfig';
import CommonHeader from '../components/CommonHeader';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const ActividadScreen = ({ onOpenNotifications }: { onOpenNotifications: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  
  // Debug logs para ver qué institución se está usando
  console.log('🔍 [ActividadScreen] selectedInstitution:', selectedInstitution ? {
    id: selectedInstitution._id,
    account: selectedInstitution.account?.nombre,
    student: selectedInstitution.student ? {
      id: selectedInstitution.student._id,
      name: selectedInstitution.student.nombre,
      avatar: selectedInstitution.student.avatar
    } : null
  } : null);
  const { user, token } = useAuth();
  const { students, loading: studentsLoading } = useStudents(
    selectedInstitution?.account._id,
    selectedInstitution?.division?._id
  );
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    participantes: '',
    descripcion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el autocompletar de participantes
  const [participantesSearch, setParticipantesSearch] = useState('');
  const [showParticipantesDropdown, setShowParticipantesDropdown] = useState(false);
  const [selectedParticipantes, setSelectedParticipantes] = useState<string[]>([]);
  
  // Custom Alert hook
  const { showSuccess, showError, isVisible, alertConfig } = useCustomAlert();

  const handleImagePicker = () => {
    Alert.alert(
      'Seleccionar Imagen',
      '¿De dónde quieres seleccionar la imagen?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cámara',
          onPress: () => openCamera(),
        },
        {
          text: 'Galería',
          onPress: () => openGallery(),
        },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.error) {
        console.log('Error de cámara:', response.error);
        Alert.alert('Error', 'No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        setSelectedImages(prev => [...prev, image]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 5,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la galería');
      } else if (response.error) {
        console.log('Error de galería:', response.error);
        Alert.alert('Error', 'No se pudo abrir la galería');
      } else if (response.assets) {
        setSelectedImages(prev => [...prev, ...response.assets]);
      }
    });
  };

  // Funciones para el autocompletar de participantes
  console.log('🔍 Debug - selectedInstitution:', selectedInstitution);
  console.log('🔍 Debug - students:', students);
  console.log('🔍 Debug - studentsLoading:', studentsLoading);
  console.log('🔍 Debug - participantesSearch:', participantesSearch);
  
  const filteredStudents = students.filter(student =>
    student.nombre.toLowerCase().includes(participantesSearch.toLowerCase()) ||
    student.apellido.toLowerCase().includes(participantesSearch.toLowerCase()) ||
    student.dni.includes(participantesSearch)
  );
  
  console.log('🔍 Debug - filteredStudents:', filteredStudents);

  const handleSelectParticipante = (studentId: string) => {
    if (!selectedParticipantes.includes(studentId)) {
      setSelectedParticipantes(prev => [...prev, studentId]);
    }
    setParticipantesSearch('');
    setShowParticipantesDropdown(false);
  };

  const handleRemoveParticipante = (studentId: string) => {
    setSelectedParticipantes(prev => prev.filter(id => id !== studentId));
  };

  const getSelectedParticipantesNames = () => {
    return selectedParticipantes
      .map(id => {
        const student = students.find(s => s._id === id);
        return student ? `${student.nombre} ${student.apellido}` : '';
      })
      .filter(name => name)
      .join(', ');
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      Alert.alert('Error', 'El título de la actividad es obligatorio');
      return false;
    }
    if (selectedParticipantes.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un participante');
      return false;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una foto o video');
      return false;
    }
    return true;
  };

  const uploadImages = async () => {
    const uploadedImages = [];

    console.log('Iniciando upload de imágenes...');
    console.log('Número de imágenes a subir:', selectedImages.length);

    for (const image of selectedImages) {
      try {
        console.log('Subiendo imagen:', image.uri);

        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'image.jpg'
        });

        console.log('URL de upload:', `${API_FULL_URL}/upload/s3/image`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

        const response = await fetch(`${API_FULL_URL}/upload/s3/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('Imagen subida exitosamente:', result);
          uploadedImages.push(result.imageKey);
        } else {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error al subir imagen: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }
    }

    console.log('Upload completado. URLs:', uploadedImages);
    return uploadedImages;
  };

  const submitActivity = async () => {
    console.log('Iniciando submitActivity...');

    if (!validateForm()) {
      console.log('Validación del formulario falló');
      return;
    }

    if (!user) {
      console.log('No hay usuario autenticado');
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    if (!selectedInstitution?.account._id) {
      console.log('No hay institución seleccionada');
      Alert.alert('Error', 'No hay institución seleccionada');
      return;
    }

    // Verificar que se tenga una división seleccionada si el usuario tiene división
    if (selectedInstitution.division && !selectedInstitution.division._id) {
      console.log('No hay división seleccionada');
      Alert.alert('Error', 'Debes seleccionar una división');
      return;
    }

    console.log('Usuario:', user._id);
    console.log('Institución:', selectedInstitution.account._id);
    console.log('División:', selectedInstitution.division?._id || 'Sin división');
    console.log('Datos del formulario:', formData);

    setIsSubmitting(true);

    try {
      console.log('Iniciando upload de imágenes...');
      // 1. Subir imágenes
      const uploadedImages = await uploadImages();
      console.log('Imágenes subidas:', uploadedImages);

      // 2. Enviar datos de la actividad
      const activityData = {
        titulo: formData.titulo,
        participantes: selectedParticipantes, // Array de IDs de estudiantes
        descripcion: formData.descripcion,
        imagenes: uploadedImages,
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division?._id,
        userId: user._id
      };

      console.log('Datos de actividad a enviar:', activityData);
      console.log('URL de actividades:', `${API_FULL_URL}/activities`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const response = await fetch(`${API_FULL_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Respuesta del servidor de actividades:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Actividad enviada exitosamente:', result);
        showSuccess('Actividad', 'Actividad enviada correctamente');
        // Limpiar formulario
        setFormData({
          titulo: '',
          participantes: '',
          descripcion: ''
        });
        setSelectedImages([]);
        setSelectedParticipantes([]); // Limpiar participantes seleccionados
      } else {
        const errorText = await response.text();
        console.error('Error del servidor de actividades:', errorText);
        throw new Error(`Error al enviar la actividad: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      showError('Error', error.message || 'Error al enviar la actividad');
    } finally {
      console.log('Finalizando submitActivity, estableciendo isSubmitting a false');
      setIsSubmitting(false);
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
    if (selectedInstitution?.division) {
      return selectedInstitution.division.nombre;
    }
    return 'Todas las divisiones';
  };

  return (
    <View style={styles.homeContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={getActiveStudent()}
        />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Título ACTIVIDAD centrado */}
        <View style={styles.actividadTitleContainer}>
          <Text style={styles.actividadTitle}>ACTIVIDAD</Text>
        </View>

        {/* Botón circular de cámara centrado */}
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={handleImagePicker}>
            <View style={styles.mediaButtonCircle}>
              <Image
                source={require('../assets/design/icons/camera.png')}
                style={[styles.mediaButtonImage, { tintColor: '#FFFFFF' }]}
                resizeMode="contain"
              />
            </View>
            <View style={styles.mediaPlusBadge}>
              <Text style={styles.mediaPlusText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Imágenes seleccionadas */}
        {selectedImages.length > 0 && (
          <View style={styles.selectedImagesContainer}>
            <Text style={styles.selectedImagesTitle}>Imágenes seleccionadas:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.selectedImageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Título de la actividad */}
          <View style={styles.formFieldContainer}>
            <Text style={styles.formLabel}>Título de la actividad <Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={styles.formInput}
              placeholder=""
              placeholderTextColor="#B3D4F1"
              value={formData.titulo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
            />
          </View>

          {/* Participantes */}
          <View style={styles.formFieldContainer}>
            <Text style={styles.formLabel}>Participantes <Text style={styles.requiredAsterisk}>*</Text> <Text style={styles.formSubtext}>(seleccionar los alumnos)</Text></Text>
            
            {/* Cuadrícula de estudiantes */}
            {studentsLoading ? (
              <View style={styles.studentsLoadingContainer}>
                <Text style={styles.studentsLoadingText}>Cargando alumnos...</Text>
              </View>
            ) : students.length === 0 ? (
              <View style={styles.studentsEmptyContainer}>
                <Text style={styles.studentsEmptyText}>No hay alumnos disponibles en esta división</Text>
              </View>
            ) : (
              <View style={styles.studentsGrid}>
                {students.map((student) => (
                  <TouchableOpacity
                    key={student._id}
                    style={[
                      styles.studentItem,
                      selectedParticipantes.includes(student._id) && styles.studentItemSelected
                    ]}
                    onPress={() => handleSelectParticipante(student._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.studentAvatar}>
                      {student.avatar ? (
                        <Image 
                          source={{ uri: student.avatar }} 
                          style={styles.studentAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.studentIcon}>👤</Text>
                      )}
                      {selectedParticipantes.includes(student._id) && (
                        <View style={styles.checkMark}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.studentNombre}>{student.nombre}</Text>
                    <Text style={styles.studentApellido}>{student.apellido}</Text>
                    <Text style={styles.studentDivision}>{student.division?.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            

          </View>

          {/* Descripción */}
          <View style={styles.formFieldContainer}>
            <Text style={styles.formLabel}>Descripción de la tarea</Text>
            <TextInput
              style={styles.formTextArea}
              placeholder=""
              placeholderTextColor="#B3D4F1"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.descripcion}
              onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
            />
          </View>
        </View>

        {/* Botón de enviar */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={submitActivity}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Enviar Actividad'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          isVisible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
        />
      )}
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
  actividadTitleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actividadTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0E5FCE',
    textAlign: 'center',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 60,
    marginBottom: 30,
  },
  mediaButton: {
    position: 'relative',
  },
  mediaButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonImage: {
    width: 40,
    height: 40,
  },
  mediaPlusBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedImagesContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  selectedImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C42',

    marginBottom: 10,
  },
  selectedImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF8C42',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  formFieldContainer: {
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 16,
    color: '#FF8C42',
    marginBottom: 10,
    fontWeight: '600',
  },
  requiredAsterisk: {
    fontSize: 16,
    color: '#FF8C42',

  },
  formSubtext: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: 'normal',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#0E5FCE',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
    color: '#0E5FCE',
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: '#0E5FCE',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    color: '#0E5FCE',
  },
  submitButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#B3D4F1',
    opacity: 0.7,
  },
  // Estilos para el autocompletar de participantes


  selectedParticipantesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8C42',

    
    marginBottom: 10,
  },
  selectedParticipanteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedParticipanteText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  removeParticipanteButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeParticipanteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },


  // Estilos para la cuadrícula de estudiantes
  studentsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  studentsLoadingText: {
    fontSize: 16,
    color: '#666666',
  },
  studentsEmptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  studentsEmptyText: {
    fontSize: 16,
    color: '#666666',
  },
  studentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  studentItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentItemSelected: {
    opacity: 0.7,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  studentAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentIcon: {
    fontSize: 24,
    color: '#666666',
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
  studentNombre: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  studentApellido: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  studentDivision: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 1,
  },
  selectedParticipantesList: {
    marginTop: 10,
  },
});

export default ActividadScreen; 