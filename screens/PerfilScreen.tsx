import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInstitution } from '../contexts/InstitutionContext';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';
import { ActiveAssociationService } from '../src/services/activeAssociationService';
import AddAssociationPopup from '../components/AddAssociationPopup';
import CommonHeader from '../components/CommonHeader';
import SideMenu from '../components/SideMenu';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { UserService } from '../src/services/userService';
import PickupService, { Pickup } from '../src/services/pickupService';
import SharedService, { Shared } from '../src/services/sharedService';
import { toastService } from '../src/services/toastService';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import PushNotificationPreferences from '../components/PushNotificationPreferences';
import ChangePasswordScreen from './ChangePasswordScreen';

interface User {
  _id: string;
  name: string;
  email: string;
  telefono?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

const PerfilScreen = ({ onOpenNotifications, onOpenActiveAssociation }: { onOpenNotifications: () => void; onOpenActiveAssociation?: () => void }) => {
  const { logout, user: authUser, login, activeAssociation, refreshActiveAssociation } = useAuth();
  
  // Verificar si el usuario es familyadmin (usando el rol activo)
  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  
  
  // Solo incluir 'quienRetira' en las opciones si el usuario es familyadmin
  const [activeTab, setActiveTab] = useState<'informacion' | 'asociaciones' | 'quienRetira'>('informacion');
  
  // Si el usuario no es familyadmin y está en la pestaña 'quienRetira', redirigir a 'informacion'
  useEffect(() => {
    if (!isFamilyAdmin && activeTab === 'quienRetira') {
      setActiveTab('informacion');
    }
  }, [isFamilyAdmin, activeTab]);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('Usuario Ejemplo');
  const [email, setEmail] = useState('usuario@ejemplo.com');
  const [telefono, setTelefono] = useState('+54 9 11 1234-5678');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddAssociationPopup, setShowAddAssociationPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  
  // Estado para imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estado para personas autorizadas
  const [personasAutorizadas, setPersonasAutorizadas] = useState<Pickup[]>([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  
  // Estado para modal de agregar persona autorizada
  const [showAddPersonaModal, setShowAddPersonaModal] = useState(false);
  const [newPersonaData, setNewPersonaData] = useState({
    nombre: '',
    apellido: '',
    dni: ''
  });

  // Estado para modal de solicitar asociación
  const [showRequestAssociationModal, setShowRequestAssociationModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestNombre, setRequestNombre] = useState('');
  const [requestApellido, setRequestApellido] = useState('');

  // Estado para asociaciones reales
  const [asociaciones, setAsociaciones] = useState<Shared[]>([]);
  const [loadingAsociaciones, setLoadingAsociaciones] = useState(false);
  const [asociacionActiva, setAsociacionActiva] = useState<string | null>(null);

  // Estado para pantalla de cambio de contraseña
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Usar la primera institución si no hay ninguna seleccionada
  const effectiveInstitution = selectedInstitution || (userAssociations.length > 0 ? userAssociations[0] : null);

  const avatarOptions = [
    '👤', '😀', '😎', '🤓', '😊', '🙂', '😄', '🤔',
    '😇', '🤗', '🥰', '😍', '🤩', '😋', '🤪', '😜'
  ];

  const handleSelectAvatar = (avatar: string) => {
    // Esta función ya no se usa, pero la mantenemos por compatibilidad
    setShowAvatarModal(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Aquí podrías restaurar los valores originales si fuera necesario
  };

  const handleAddAssociation = async (data: {
    tipo: string;
    institucion: string;
    division: string;
    dniAlumno: string;
  }) => {
    showLoading('Agregando asociación...');
    
    try {
      // Aquí iría la llamada a la API para agregar la asociación
      console.log('Agregando asociación:', data);
      
      // Simular llamada a API
      setTimeout(() => {
        hideLoading();
        console.log('✅ Asociación agregada correctamente');
      }, 1500);
    } catch (error) {
      hideLoading();
      console.error('❌ No se pudo agregar la asociación');
    }
  };

  const openMenu = () => {
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleTabChange = (tab: 'informacion' | 'asociaciones' | 'quienRetira') => {
    // Si el usuario no es familyadmin y trata de acceder a 'quienRetira', no permitirlo
    if (tab === 'quienRetira' && !isFamilyAdmin) {
      return;
    }
    setActiveTab(tab);
  };

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(selectedRole === roleId ? null : roleId);
  };

  const handleAddPersonaAutorizada = () => {
    setShowAddPersonaModal(true);
  };

  const handleCloseAddPersonaModal = () => {
    setShowAddPersonaModal(false);
    setNewPersonaData({ nombre: '', apellido: '', dni: '' });
  };

  const handleSavePersonaAutorizada = async () => {
    if (!newPersonaData.nombre.trim() || !newPersonaData.apellido.trim() || !newPersonaData.dni.trim()) {
      console.error('❌ Todos los campos son obligatorios');
      return;
    }

    try {
      showLoading('Agregando persona autorizada...');
      
      console.log('🔍 [PerfilScreen] userAssociations:', userAssociations);
      console.log('🔍 [PerfilScreen] userAssociations.length:', userAssociations.length);
      
      // Obtener la primera asociación del usuario
      const userAssociation = userAssociations.find(assoc => assoc.account);
      console.log('🔍 [PerfilScreen] userAssociation encontrada:', userAssociation);
      
      if (!userAssociation) {
        console.log('🔍 [PerfilScreen] No se encontró asociación con institución');
        console.error('❌ No tienes instituciones asociadas');
        return;
      }

            const pickupData = {
        nombre: newPersonaData.nombre.trim(),
        apellido: newPersonaData.apellido.trim(),
        dni: newPersonaData.dni.trim(),
        divisionId: userAssociation.division?._id || ''
      };

      const newPickup = await PickupService.createPickup(pickupData);
      
      setPersonasAutorizadas(prev => [...prev, newPickup]);
      handleCloseAddPersonaModal();
      console.log('✅ Persona autorizada agregada correctamente');
    } catch (error: any) {
      console.error('Error al crear pickup:', error);
      
      // Manejar errores de validación del servidor
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.join('\n');
        console.log('Error de validación', errorMessages);
      } else if (error.response?.data?.message) {
        console.log('Error', error.response.data.message);
      } else {
        console.log('Error', error.message || 'Error al agregar persona autorizada');
      }
    } finally {
      hideLoading();
        }
  };

  // Seleccionar asociación activa
  const handleSelectAsociacion = async (id: string) => {
    try {
      // Llamar al servicio para actualizar la asociación activa en el servidor
      const success = await ActiveAssociationService.setActiveAssociation(id);
      
      if (success) {
        setAsociacionActiva(id);
        // Refrescar la asociación activa en el contexto
        await refreshActiveAssociation();
        // No mostrar alert de éxito
      } else {
        console.log('Error', 'No se pudo cambiar la asociación activa');
      }
    } catch (error) {
      console.error('Error al cambiar asociación activa:', error);
      console.log('Error', 'No se pudo cambiar la asociación activa');
    }
  };

  // Eliminar asociación
  const handleRemoveAsociacion = async (id: string) => {
    // Verificar si es la asociación activa
    if (id === asociacionActiva) {
      console.log('Error', 'No puedes eliminar la asociación activa');
      return;
    }

    console.log(
      'Eliminar asociación',
      '¿Estás seguro de que quieres eliminar esta asociación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await SharedService.deleteAssociation(id);
              setAsociaciones(prev => prev.filter(a => a._id !== id));
              console.log('Éxito', 'Asociación eliminada correctamente');
            } catch (error: any) {
              console.log('Error', error.message || 'Error al eliminar asociación');
            }
          }
        }
      ]
    );
  };

  // Agregar familiar al estudiante
  const handleRequestAssociation = async () => {
    if (!requestEmail.trim() || !requestNombre.trim() || !requestApellido.trim()) {
      console.error('❌ Todos los campos son obligatorios');
      return;
    }

    try {
      showLoading('Agregando familiar...');
      
      // Obtener el estudiante del familyadmin activo
      const activeStudent = activeAssociation?.student;
      if (!activeStudent) {
        console.error('❌ No se encontró estudiante asociado');
        return;
      }

      const requestData = {
        email: requestEmail.trim(),
        nombre: requestNombre.trim(),
        apellido: requestApellido.trim(),
        studentId: activeStudent._id
      };

      const response = await SharedService.requestAssociation(requestData);
      
      setShowRequestAssociationModal(false);
      setRequestEmail('');
      setRequestNombre('');
      setRequestApellido('');
      
      if (response.success) {
        console.log('✅ Familiar agregado exitosamente:', response.message);
        toastService.success('Éxito', response.message || 'Familiar agregado exitosamente');
        // Recargar asociaciones
        loadAsociaciones();
      }
    } catch (error: any) {
      console.error('❌ Error al agregar familiar:', error);
      
      if (error.response?.data?.message) {
        console.error('❌ Error del servidor:', error.response.data.message);
        toastService.error('Error', error.response.data.message);
      } else {
        console.error('❌ Error general:', error.message || 'Error al agregar familiar');
        toastService.error('Error', error.message || 'Error al agregar familiar');
      }
    } finally {
      hideLoading();
    }
  };

  const handlePasswordChanged = () => {
    console.log('🔑 Contraseña cambiada exitosamente desde el perfil');
    setShowChangePassword(false);
  };

  const handleLogoutAfterPasswordChange = async () => {
    console.log('🔑 Deslogueando usuario después de cambiar contraseña');
    setShowChangePassword(false);
    await logout();
  };

  const handleRemovePersonaAutorizada = async (id: string) => {
    console.log(
      'Eliminar persona autorizada',
      '¿Estás seguro de que quieres eliminar esta persona?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await PickupService.delete(id);
              setPersonasAutorizadas(prev => prev.filter(p => p._id !== id));
              console.log('Éxito', 'Persona autorizada eliminada correctamente');
            } catch (error: any) {
              console.log('Error', error.message || 'Error al eliminar persona autorizada');
            }
          }
        }
      ]
    );
  };

  // Cargar asociaciones del usuario
  const loadAsociaciones = async () => {
    try {
      setLoadingAsociaciones(true);
      const associations = await ActiveAssociationService.getAvailableAssociations();
      setAsociaciones(associations);
      
      
      // Usar la asociación activa desde el contexto
      if (activeAssociation) {
        setAsociacionActiva(activeAssociation.activeShared);
      } else {
        // Establecer la primera asociación como activa por defecto si no hay activa
        if (associations.length > 0 && !asociacionActiva) {
          setAsociacionActiva(associations[0]._id);
        }
      }
    } catch (error) {
      console.error('Error al cargar asociaciones:', error);
      setAsociaciones([]);
    } finally {
      setLoadingAsociaciones(false);
    }
  };

  // Cargar personas autorizadas
  const loadPersonasAutorizadas = async () => {
    try {
      setLoadingPickup(true);
      
      // Solo cargar si el usuario es familyadmin y tiene asociaciones
      if (!isFamilyAdmin || !userAssociations.length) {
        setPersonasAutorizadas([]);
        return;
      }
      
      // Obtener todos los pickups para los estudiantes asociados al usuario
      const response = await PickupService.getPickups();
      setPersonasAutorizadas(response.pickups || []);
    } catch (error) {
      console.error('Error al cargar personas autorizadas:', error);
      // Si hay error, mostrar lista vacía
      setPersonasAutorizadas([]);
    } finally {
      setLoadingPickup(false);
    }
  };

  // Cargar datos del usuario
  const loadUserData = async () => {
    if (!authUser) {
      return;
    }
    
    try {
      
      // Usar los datos del usuario autenticado
      setUser(authUser);
      
      // Establecer los datos con valores por defecto si no existen
      const userName = authUser.name || authUser.nombre || 'Sin nombre';
      const userEmail = authUser.email || 'Sin email';
      const userTelefono = authUser.telefono || authUser.phone || '';
      
      setName(userName);
      setEmail(userEmail);
      setTelefono(userTelefono);
      
      console.log('🔍 [PerfilScreen] Datos del usuario establecidos:', {
        name: userName,
        email: userEmail,
        telefono: userTelefono,
        authUserKeys: Object.keys(authUser)
      });

      // Log adicional para la URL del avatar (sin alert)
      if (authUser?.avatar) {
        console.log('🖼️ [PerfilScreen] URL del avatar:', authUser.avatar);
        console.log('🖼️ [PerfilScreen] Tipo de URL:', typeof authUser.avatar);
        console.log('🖼️ [PerfilScreen] URL válida:', authUser.avatar?.startsWith('http'));
      } else {
        console.log('🖼️ [PerfilScreen] No hay avatar en los datos del usuario');
      }
    } catch (error: any) {
      console.error('🔍 [PerfilScreen] Error al cargar datos:', error);
    }
  };

  // Guardar cambios del usuario
  const handleSaveChanges = async () => {
    if (!user?._id) return;
    
    try {
      showLoading('Guardando cambios...');
      
      const updateData = {
        name,
        phone: telefono,
      };
      
      console.log('🔍 [PerfilScreen] Actualizando perfil con datos:', updateData);
      
      // Usar el endpoint de actualización de perfil
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PerfilScreen] Perfil actualizado exitosamente');
        setUser(result.data);
        setIsEditing(false);
        console.log('Éxito', 'Perfil actualizado correctamente');
      } else {
        throw new Error(result.message || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      console.error('❌ [PerfilScreen] Error al actualizar perfil:', error);
      console.log('Error', error.message || 'Error al actualizar el perfil');
    } finally {
      hideLoading();
    }
  };

  // Subir imagen del avatar
  const handleUploadAvatar = async () => {
    if (!selectedImage) return;
    
    try {
      showLoading('Subiendo imagen...');
      const response = await UserService.updateAvatar(selectedImage);
      
      if (response.success && response.data?.user) {
        // Actualizar el usuario en el contexto de autenticación
        await login(response.data.user);
        setUser(response.data.user);
        setSelectedImage(null);
      } else {
        console.log('Error', response.message || 'Error al actualizar el avatar');
      }
    } catch (error: any) {
      console.error('Error al subir avatar:', error);
      console.log('Error', 'Error al actualizar el avatar');
    } finally {
      hideLoading();
    }
  };

  // Manejar selección de imagen
  const handleImageSelection = () => {
    console.log(
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
        console.log('Error', 'No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          setSelectedImage(image.uri);
        }
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la galería');
      } else if (response.error) {
        console.log('Error de galería:', response.error);
        console.log('Error', 'No se pudo abrir la galería');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          setSelectedImage(image.uri);
        }
      }
    });
  };

  // Función para editar avatar del estudiante
  const handleEditStudentAvatar = (student: any) => {
    console.log('🔍 [PerfilScreen] handleEditStudentAvatar llamado para:', student.nombre);
    Alert.alert(
      'Editar Avatar del Estudiante',
      `¿De dónde quieres seleccionar la imagen para ${student.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cámara',
          onPress: () => openCameraForStudent(student),
        },
        {
          text: 'Galería',
          onPress: () => openGalleryForStudent(student),
        },
      ]
    );
  };

  const openCameraForStudent = (student: any) => {
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
        console.log('Error', 'No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          handleUploadStudentAvatar(student, image.uri);
        }
      }
    });
  };

  const openGalleryForStudent = (student: any) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la galería');
      } else if (response.error) {
        console.log('Error de galería:', response.error);
        console.log('Error', 'No se pudo abrir la galería');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          handleUploadStudentAvatar(student, image.uri);
        }
      }
    });
  };

  const handleUploadStudentAvatar = async (student: any, imageUri: string) => {
    try {
      showLoading('Subiendo avatar del estudiante...');
      
      const formData = new FormData();
      const fileName = imageUri.split('/').pop() || 'avatar.jpg';
      const fileType = 'image/jpeg';
      
      const imageFile = {
        uri: imageUri,
        type: fileType,
        name: fileName,
      } as any;
      
      formData.append('avatar', imageFile);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/students/${student._id}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PerfilScreen] Avatar del estudiante actualizado exitosamente');
        console.log('🔍 [PerfilScreen] Nuevo avatar URL:', result.data.student.avatar);
        
        // Actualizar la asociación con el nuevo avatar del estudiante
        setAsociaciones(prev => {
          const updated = prev.map(assoc => {
            if (assoc.student && assoc.student._id === student._id) {
              return {
                ...assoc,
                student: {
                  ...assoc.student,
                  avatar: result.data.student.avatar
                }
              };
            }
            return assoc;
          });
          return updated;
        });
        
        // Recargar las asociaciones para asegurar que se muestre el nuevo avatar
        loadAsociaciones();
      } else {
        console.error('❌ [PerfilScreen] Error del servidor:', result.message || 'Error al actualizar el avatar del estudiante');
      }
    } catch (error: any) {
      console.error('Error al subir avatar del estudiante:', error);
      console.log('Error', 'Error al actualizar el avatar del estudiante');
    } finally {
      hideLoading();
    }
  };

  // Efecto para cargar datos del usuario
  useEffect(() => {
    loadUserData();
    loadAsociaciones();
    loadPersonasAutorizadas();
  }, [authUser?._id]);



  // Efecto para subir imagen cuando se selecciona
  useEffect(() => {
    
    if (selectedImage && user?._id) {
      handleUploadAvatar();
    }
  }, [selectedImage]);






  return (
    <View style={styles.perfilContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={getActiveStudent()}
        />
      
      <KeyboardAvoidingView
        style={styles.perfilContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.perfilScrollView}
          contentContainerStyle={styles.perfilScrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pestañas */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'informacion' && styles.activeTab]}
              onPress={() => handleTabChange('informacion')}
            >
              <Text style={[styles.tabText, activeTab === 'informacion' && styles.activeTabText]}>
                Información
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'asociaciones' && styles.activeTab]}
              onPress={() => handleTabChange('asociaciones')}
            >
              <Text style={[styles.tabText, activeTab === 'asociaciones' && styles.activeTabText]}>
                Asociaciones
              </Text>
            </TouchableOpacity>
            {isFamilyAdmin && (
              <TouchableOpacity
                style={[styles.tab, activeTab === 'quienRetira' && styles.activeTab]}
                onPress={() => handleTabChange('quienRetira')}
              >
                <Text style={[styles.tabText, activeTab === 'quienRetira' && styles.activeTabText]}>
                  Quién Retira
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Contenido de las pestañas */}
          {activeTab === 'informacion' && (
            <View style={styles.tabContent}>
              {/* Avatar, Nombre y Email */}
              <View style={styles.perfilAvatarContainer}>
                <TouchableOpacity
                  style={[styles.perfilAvatar, isEditing && styles.perfilAvatarEditable]}
                  onPress={() => {
                    if (isEditing) {
                      handleImageSelection();
                    }
                  }}
                  disabled={!isEditing}
                >
                  {user?.avatar ? (
                    <Image 
                      source={{ uri: user.avatar }} 
                      style={styles.perfilAvatarImage}
                      onLoad={() => console.log('✅ [PerfilScreen] Avatar cargado exitosamente:', user.avatar)}
                      onError={(error) => {
                        console.error('❌ [PerfilScreen] Error cargando avatar:', error.nativeEvent);
                        console.error('❌ [PerfilScreen] URL del avatar:', user.avatar);
                      }}
                      resizeMode="cover"
                      // defaultSource={require('../assets/design/default-avatar.png')}
                    />
                  ) : (
                    <Text style={styles.perfilAvatarIcon}>👤</Text>
                  )}
                  {isEditing && (
                    <View style={styles.perfilAvatarEditOverlay}>
                      <Image
                        source={require('../assets/design/icons/camera.png')}
                        style={styles.perfilAvatarEditIcon}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.perfilNombre}>{name || 'Sin nombre'}</Text>
                <Text style={styles.perfilEmail}>{email || 'Sin email'}</Text>
                {isEditing && (
                  <Text style={styles.avatarHintText}>Toca la imagen para cambiar</Text>
                )}
              </View>

              {/* Botón Editar (solo visible cuando no está editando) */}
              {!isEditing && (
                <View style={styles.editButtonContainer}>
                  <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editProfileButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Campos de edición (solo visibles cuando está editando) */}
              {isEditing && (
                <View style={styles.perfilForm}>
                  <Text style={styles.perfilSectionTitle}>Editar Datos</Text>

                  <View style={styles.perfilField}>
                    <Text style={[
                      styles.perfilLabel,
                      focusedField === 'name' && styles.perfilLabelFocused
                    ]}>
                      Nombre Completo
                    </Text>
                    <TextInput
                      style={styles.perfilInput}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <View style={[
                      styles.perfilInputLine,
                      focusedField === 'name' && styles.perfilInputLineFocused
                    ]} />
                  </View>

                  <View style={styles.perfilField}>
                    <Text style={[
                      styles.perfilLabel,
                      focusedField === 'telefono' && styles.perfilLabelFocused
                    ]}>
                      Teléfono
                    </Text>
                    <TextInput
                      style={styles.perfilInput}
                      value={telefono}
                      onChangeText={setTelefono}
                      keyboardType="phone-pad"
                      onFocus={() => setFocusedField('telefono')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <View style={[
                      styles.perfilInputLine,
                      focusedField === 'telefono' && styles.perfilInputLineFocused
                    ]} />
                  </View>

                  {/* Botones de Guardar y Cancelar */}
                  <View style={styles.perfilEditButtonsRow}>
                    <TouchableOpacity
                      style={styles.perfilCancelButton}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.perfilCancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.perfilSaveButton}
                      onPress={handleSaveChanges}
                    >
                      <Text style={styles.perfilSaveButtonText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Información de perfil (cuando no está editando) */}
              {!isEditing && (
                <View style={styles.perfilInfoSection}>
                  <View style={styles.perfilInfoItem}>
                    <Text style={styles.perfilInfoLabel}>Nombre Completo:</Text>
                    <Text style={styles.perfilInfoValue}>{name}</Text>
                  </View>
                  <View style={styles.perfilInfoItem}>
                    <Text style={styles.perfilInfoLabel}>Email:</Text>
                    <Text style={styles.perfilInfoValue}>{email}</Text>
                  </View>
                  <View style={styles.perfilInfoItem}>
                    <Text style={styles.perfilInfoLabel}>Teléfono:</Text>
                    <Text style={styles.perfilInfoValue}>{telefono}</Text>
                  </View>
                  
                  {/* Botón de cambiar contraseña */}
                  <View style={styles.changePasswordContainer}>
                    <TouchableOpacity
                      style={styles.changePasswordButton}
                      onPress={() => setShowChangePassword(true)}
                    >
                      <Text style={styles.changePasswordButtonText}>Cambiar Contraseña</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Botón de Cerrar Sesión */}
                  <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                      <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'asociaciones' && (
            <View style={styles.tabContent}>
              <View style={styles.asociacionesHeader}>
                <Text style={styles.perfilSectionTitle}>Mis Asociaciones</Text>
                {isFamilyAdmin && (
                  <TouchableOpacity
                    style={styles.addAsociacionButton}
                    onPress={() => setShowRequestAssociationModal(true)}
                  >
                    <Text style={styles.addAsociacionButtonText}>+ Agregar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {asociaciones.length > 1 && (
                <Text style={styles.asociacionesSubtitle}>
                  Toca una asociación para activarla
                </Text>
              )}
              
              {loadingAsociaciones ? (
                <Text style={styles.loadingText}>Cargando asociaciones...</Text>
              ) : asociaciones.length === 0 ? (
                <Text style={styles.emptyText}>No tienes asociaciones</Text>
              ) : (
                <FlatList
                  data={asociaciones}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => {
                    const isActive = item.isActive;
                    return (
                    <TouchableOpacity
                      style={[
                        styles.asociacionItem,
                        isActive && styles.asociacionItemActiva
                      ]}
                      onPress={() => handleSelectAsociacion(item._id)}
                      disabled={isActive}
                    >
                      <View style={styles.asociacionInfo}>
                        <View style={styles.asociacionHeader}>
                          <Text style={styles.asociacionInstitucion}>{item.account.nombre}</Text>
                          {asociacionActiva === item._id && (
                            <View style={styles.asociacionActivaBadge}>
                              <Text style={styles.asociacionActivaText}>ACTIVA</Text>
                            </View>
                          )}
                        </View>
                        {item.division && (
                          <Text style={styles.asociacionDivision}>{item.division.nombre}</Text>
                        )}
                        {item.student && (
                          <View style={styles.studentInfoContainer}>
                            <View style={styles.studentAvatarContainer}>
                              {item.student.avatar ? (
                                <Image 
                                  source={{ uri: item.student.avatar }} 
                                  style={styles.studentAvatar}
                                  resizeMode="cover"
                                  onLoad={() => console.log('✅ [PerfilScreen] Avatar del estudiante cargado:', item.student.nombre, item.student.avatar)}
                                  onError={(error) => {
                                    console.error('❌ [PerfilScreen] Error cargando avatar del estudiante:', item.student.nombre, error.nativeEvent);
                                    console.error('❌ [PerfilScreen] URL del avatar:', item.student.avatar);
                                  }}
                                />
                              ) : (
                                <Text style={styles.studentAvatarPlaceholder}>👤</Text>
                              )}
                              {isFamilyAdmin && (
                                <TouchableOpacity
                                  style={styles.editStudentAvatarButton}
                                  onPress={() => handleEditStudentAvatar(item.student)}
                                >
                                  <Image
                                    source={require('../assets/design/icons/camera.png')}
                                    style={styles.editStudentAvatarIcon}
                                    resizeMode="contain"
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                            <View style={styles.studentTextInfo}>
                              <Text style={styles.studentName}>
                                {item.student.nombre} {item.student.apellido}
                              </Text>
                              <Text style={styles.studentLabel}>Estudiante</Text>
                            </View>
                          </View>
                        )}
                        
                        <View style={styles.asociacionDetails}>
                          <Text style={styles.asociacionRol}>Rol: {getRoleDisplayName(item.role.nombre)}</Text>
                          <Text style={styles.asociacionStatus}>
                            Estado: {item.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    );
                  }}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {activeTab === 'quienRetira' && (
            <View style={styles.tabContent}>
              <View style={styles.quienRetiraHeader}>
                <Text style={styles.perfilSectionTitle}>Personas Autorizadas</Text>
                <TouchableOpacity
                  style={styles.addPersonaButton}
                  onPress={handleAddPersonaAutorizada}
                >
                  <Text style={styles.addPersonaButtonText}>+ Agregar</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={personasAutorizadas}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.personaItem}>
                    <View style={styles.personaInfo}>
                      <Text style={styles.personaNombre}>{item.nombre} {item.apellido}</Text>
                      <Text style={styles.personaDni}>DNI: {item.dni}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removePersonaButton}
                      onPress={() => handleRemovePersonaAutorizada(item._id)}
                    >
                      <Text style={styles.removePersonaButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          )}


        </ScrollView>
        
        {/* Modal para Avatar */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAvatarModal}
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.avatarModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Avatar</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowAvatarModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.avatarGrid}>
                {avatarOptions.map((avatar, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.avatarOption}
                    onPress={() => handleSelectAvatar(avatar)}
                  >
                    <Text style={styles.avatarOptionText}>{avatar}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
    
        {/* Popup para agregar asociación */}
        <AddAssociationPopup
          visible={showAddAssociationPopup}
          onClose={() => setShowAddAssociationPopup(false)}
          onAdd={handleAddAssociation}
        />


      </KeyboardAvoidingView>

              {/* Modal del menú lateral */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={closeMenu}
        >
          <View style={styles.menuModalOverlay}>
            <View style={styles.menuModalContainer}>
              <SideMenu 
                navigation={{}} 
                onClose={closeMenu}
                onOpenActiveAssociation={() => {
                  closeMenu();
                  onOpenActiveAssociation?.();
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Modal para solicitar asociación */}
        <Modal
          visible={showRequestAssociationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRequestAssociationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addPersonaModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Familiar</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowRequestAssociationModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={requestNombre}
                    onChangeText={setRequestNombre}
                    placeholder="Ingresa el nombre"
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Apellido *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={requestApellido}
                    onChangeText={setRequestApellido}
                    placeholder="Ingresa el apellido"
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={requestEmail}
                    onChangeText={setRequestEmail}
                    placeholder="Ingresa el email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                
                <Text style={styles.modalDescription}>
                  Si el usuario ya existe, se creará la asociación inmediatamente. 
                  Si no existe, se creará un nuevo usuario y se enviará una invitación por email.
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowRequestAssociationModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleRequestAssociation}
                >
                  <Text style={styles.saveButtonText}>Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para agregar persona autorizada */}
        <Modal
          visible={showAddPersonaModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseAddPersonaModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addPersonaModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Persona Autorizada</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={handleCloseAddPersonaModal}
                >
                  <Text style={styles.modalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPersonaData.nombre}
                    onChangeText={(text) => setNewPersonaData(prev => ({ ...prev, nombre: text }))}
                    placeholder="Ingrese el nombre"
                    maxLength={50}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Apellido *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPersonaData.apellido}
                    onChangeText={(text) => setNewPersonaData(prev => ({ ...prev, apellido: text }))}
                    placeholder="Ingrese el apellido"
                    maxLength={50}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DNI *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPersonaData.dni}
                    onChangeText={(text) => setNewPersonaData(prev => ({ ...prev, dni: text }))}
                    placeholder="Ingrese el DNI"
                    keyboardType="numeric"
                    maxLength={15}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseAddPersonaModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePersonaAutorizada}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Pantalla de cambio de contraseña - Full Screen */}
        {showChangePassword && (
          <View style={styles.fullScreenOverlay}>
            <ChangePasswordScreen 
              isFirstLogin={false}
              onPasswordChanged={handlePasswordChanged}
              onBack={() => setShowChangePassword(false)}
              onLogout={handleLogoutAfterPasswordChange}
            />
          </View>
        )}

      </View>
    );
  };

const styles = StyleSheet.create({
  editIconImage: {
    width: 16,
    height: 16
  },
  perfilContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50, // Reducido para eliminar espacio extra

  },
  perfilContent: {
    flex: 1,
  },
  perfilScrollView: {
    flex: 1,
  },
  perfilScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  perfilHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Reducido aún más el margen inferior
    marginTop: 0, // Eliminado el margen superior
  },
  perfilTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 20,
  },
  perfilAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20, // Reducido aún más el margen inferior
  },
  perfilAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  perfilAvatarEditable: {
    backgroundColor: '#0E5FCE',
  },
  perfilAvatarIcon: {
    fontSize: 40,
  },
  perfilAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  perfilAvatarEditOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfilAvatarEditIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  avatarHintText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  perfilNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  perfilEmail: {
    fontSize: 16,
    color: '#666666',
  },
  perfilForm: {
    flex: 1,
  },
  perfilSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 15,
    marginTop: 10, // Reducido aún más el margen superior
  },
  perfilSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  perfilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  perfilHalfField: {
    width: '48%',
  },
  perfilField: {
    marginBottom: 20,
  },
  perfilLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  perfilLabelFocused: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  perfilInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  perfilInputDisabled: {
    color: '#999999',
    backgroundColor: 'transparent',
  },
  perfilInputLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  perfilInputLineFocused: {
    backgroundColor: '#0E5FCE',
  },
  perfilButtonsContainer: {
    marginTop: 30,
  },
  perfilEditButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  perfilCancelButton: {
    flex: 1,
    backgroundColor: '#666666',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  perfilCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  perfilSaveButton: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  perfilSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos para la sección de asociaciones
  perfilSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addAssociationButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAssociationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  associationsContainer: {
    marginBottom: 20,
  },
  associationItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  associationInfo: {
    flex: 1,
  },
  associationInstitution: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 8,
  },
  associationDetails: {
    marginTop: 5,
  },
  associationRole: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  associationDivision: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  associationDni: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  associationStatus: {
    fontSize: 12,
    color: '#999',
  },
  noAssociationsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  // Estilos para el modal de avatar
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#666',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  avatarOptionSelected: {
    backgroundColor: '#0E5FCE',
  },
  avatarOptionText: {
    fontSize: 24,
  },
  // Estilos para el modal del menú
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContainer: {
    flex: 1,
    width: '80%',
    maxWidth: 300,
  },
  // Estilos para el botón de editar
  editButtonContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  editProfileButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para las pestañas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // Estilos para la información del perfil
  perfilInfoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
  },
  perfilInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  perfilInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  perfilInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  // Estilos para asociaciones
  asociacionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  asociacionItemSelected: {
    borderColor: '#0E5FCE',
    backgroundColor: '#F0F8FF',
  },
  asociacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  asociacionInstitucion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  asociacionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  asociacionStatusActive: {
    backgroundColor: '#E8F5E8',
  },
  asociacionStatusInactive: {
    backgroundColor: '#FFE8E8',
  },
  asociacionStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  asociacionDivision: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  asociacionRol: {
    fontSize: 14,
    color: '#0E5FCE',
    fontWeight: '500',
  },
  // Estilos para quién retira
  quienRetiraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPersonaButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPersonaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  personaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  personaInfo: {
    flex: 1,
  },
  personaNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  personaDni: {
    fontSize: 14,
    color: '#666',
  },
  removePersonaButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePersonaButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para el modal de agregar persona autorizada
  addPersonaModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalContent: {
    marginVertical: 20,
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
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Estilos para el botón de cerrar sesión
  logoutContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para asociaciones
  asociacionesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAsociacionButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAsociacionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  asociacionesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  asociacionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  asociacionItemActiva: {
    borderColor: '#0E5FCE',
    backgroundColor: '#F8FBFF',
  },
  asociacionInfo: {
    flex: 1,
  },
  asociacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  asociacionActivaBadge: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  asociacionActivaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  asociacionInstitucion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  asociacionDivision: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  asociacionStudent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  studentAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    textAlign: 'center',
    lineHeight: 60,
    fontSize: 24,
    color: '#666666',
  },
  editStudentAvatarButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editStudentAvatarIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  studentTextInfo: {
    flex: 1,
    marginLeft: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  studentLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  asociacionDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  asociacionRol: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  asociacionStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 0,
  },
  removeAsociacionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeAsociacionButtonText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordContainer: {
    marginTop: 20,
  },
  changePasswordButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  changePasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0E5FCE',
    zIndex: 9999,
    elevation: 9999,
  },
});

export default PerfilScreen; 