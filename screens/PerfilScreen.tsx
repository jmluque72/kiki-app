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
  Alert,
  RefreshControl
} from 'react-native';
import AsyncStorage from '../src/utils/storage';
import { useInstitution } from '../contexts/InstitutionContext';
import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from "../contexts/AuthContextHybrid"
import { ActiveAssociationService } from '../src/services/activeAssociationService';
import AddAssociationPopup from '../components/AddAssociationPopup';
import CommonHeader from '../components/CommonHeader';
import SideMenu from '../components/SideMenu';
import FormulariosScreen from './FormulariosScreen';
import CompleteFormScreen from './CompleteFormScreen';
import FormRequestService, { FormRequest } from '../src/services/formRequestService';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { UserService } from '../src/services/userService';
import SharedService, { Shared } from '../src/services/sharedService';
import { toastService } from '../src/services/toastService';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import PushNotificationPreferences from '../components/PushNotificationPreferences';
import ChangePasswordScreen from './ChangePasswordScreen';
import { processStudentImage, prepareStudentImageForUpload } from '../src/services/studentImageService';
import useImagePicker from '../src/hooks/useImagePicker';
import { checkImagePermissions, checkCameraPermissions } from '../src/utils/permissionUtils';
import { apiClient } from '../src/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  telefono?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

const PerfilScreen = ({ onOpenNotifications, onOpenMenu: onOpenMenuProp, onOpenActiveAssociation }: { onOpenNotifications: () => void; onOpenMenu?: () => void; onOpenActiveAssociation?: () => void }) => {
  const { logout, user: authUser, login, activeAssociation, refreshActiveAssociation } = useAuth();
  
  // Verificar si el usuario es familyadmin (usando el rol activo)
  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  
  
  // Ya no necesitamos pestañas, solo mostramos la información del perfil
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
  
  // Estado para pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Hook para selección de imágenes
  const { pickImage, takePhoto, selectedImage: imagePickerImage, clearImage } = useImagePicker();

  // Manejar cuando se selecciona una imagen usando el hook
  useEffect(() => {
    if (imagePickerImage) {
      setSelectedImage(imagePickerImage);
      clearImage(); // Limpiar la imagen del hook
    }
  }, [imagePickerImage, clearImage]);


  // Variables de solicitud de asociación removidas - ya no se usan en esta pantalla

  // Variables de asociaciones removidas - ya no se usan en esta pantalla

  // Estado para pantalla de cambio de contraseña
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Estados para formularios
  const [showFormularios, setShowFormularios] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedFormRequest, setSelectedFormRequest] = useState<FormRequest | null>(null);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);

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
    if (onOpenMenuProp) {
      onOpenMenuProp();
    } else {
      setShowMenu(true);
    }
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  // Ya no necesitamos manejar cambios de pestañas

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(selectedRole === roleId ? null : roleId);
  };

  // Funciones de personas autorizadas removidas - ya no se usan en esta pantalla

  // Funciones de asociaciones removidas - ya no se usan en esta pantalla

  // Función handleRequestAssociation removida - ya no se usa en esta pantalla

  const handlePasswordChanged = () => {
    console.log('🔑 Contraseña cambiada exitosamente desde el perfil');
    setShowChangePassword(false);
  };

  const handleLogoutAfterPasswordChange = async () => {
    console.log('🔑 Deslogueando usuario después de cambiar contraseña');
    setShowChangePassword(false);
    await logout();
  };

  // Función handleRemovePersonaAutorizada removida - ya no se usa en esta pantalla

  // Función loadAsociaciones removida - ya no se usa en esta pantalla

  // Función loadPersonasAutorizadas removida - ya no se usa en esta pantalla

  // Handler de pull-to-refresh: recarga todos los datos visibles en perfil
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        (async () => { await loadUserData(); })(),
        (async () => { await refreshActiveAssociation(); })(),
      ]);
    } catch (error) {
      console.error('❌ [PerfilScreen] Error en refresh:', error);
    } finally {
      setRefreshing(false);
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
      
      // Usar apiClient que ya tiene el token configurado
      const response = await apiClient.put('/users/profile', updateData);
      
      if (response.data.success) {
        console.log('✅ [PerfilScreen] Perfil actualizado exitosamente');
        const updatedUserData = response.data.data?.user || response.data.data;
        
        // Mapear la respuesta del backend al formato esperado por el contexto
        const updatedUser = {
          ...authUser, // Mantener todos los campos existentes
          ...updatedUserData,
          name: updatedUserData.nombre || updatedUserData.name || authUser?.name,
          telefono: updatedUserData.telefono || updatedUserData.phone,
          phone: updatedUserData.telefono || updatedUserData.phone,
        };
        
        // Actualizar el usuario en el contexto de autenticación (esto también lo guarda en AsyncStorage)
        login(updatedUser);
        
        // Actualizar el estado local
        setUser(updatedUser);
        setIsEditing(false);
        toastService.success('Éxito', 'Perfil actualizado correctamente');
      } else {
        throw new Error(response.data.message || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      console.error('❌ [PerfilScreen] Error al actualizar perfil:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el perfil';
      Alert.alert('Error', errorMessage);
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
          onPress: () => takePhoto(),
        },
        {
          text: 'Galería',
          onPress: () => pickImage(),
        },
      ]
    );
  };

  const openCamera = async () => {
    // Verificar permisos antes de abrir la cámara
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        console.log('Error de cámara:', response.errorCode);
        Alert.alert('Error', 'No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          setSelectedImage(image.uri);
        }
      }
    });
  };

  const openGallery = async () => {
    // Verificar permisos antes de abrir la galería
    const hasPermission = await checkImagePermissions();
    if (!hasPermission) {
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la galería');
      } else if (response.errorCode) {
        console.log('Error de galería:', response.errorCode);
        Alert.alert('Error', 'No se pudo abrir la galería');
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
    // Abrir directamente la galería para seleccionar imagen
    openGalleryForStudent(student);
  };

  const openCameraForStudent = async (student: any) => {
    console.log('📱 [CAMERA] Abriendo cámara para estudiante:', student.nombre);
    
    // Delay para evitar error de snapshot
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('📱 [CAMERA] Usuario canceló la cámara');
      } else if (response.error) {
        console.error('📱 [CAMERA] Error de cámara:', response.error);
        console.log('Error', 'No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        if (image.uri) {
          console.log('📱 [CAMERA] Imagen capturada:', image.uri);
          handleUploadStudentAvatar(student, image.uri);
        }
      }
    });
  };

  const openGalleryForStudent = async (student: any) => {
    console.log('📱 [GALLERY] Abriendo galería para estudiante:', student.nombre);
    
    // Verificar permisos primero
    const hasPermissions = await checkImagePermissions();
    if (!hasPermissions) {
      console.log('📱 [GALLERY] Permisos denegados');
      return;
    }
    
    // Delay para evitar error de snapshot
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      console.log('📱 [GALLERY] Respuesta de galería:', {
        didCancel: response.didCancel,
        error: response.error,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        assetsCount: response.assets?.length || 0
      });

      if (response.didCancel) {
        console.log('📱 [GALLERY] Usuario canceló la galería');
        return;
      } 
      
      if (response.errorCode) {
        console.error('📱 [GALLERY] Error de galería:', response.errorCode, response.errorMessage);
        console.log('Error', `Error al abrir la galería: ${response.errorMessage || response.errorCode}`);
        return;
      }
      
      if (response.error) {
        console.error('📱 [GALLERY] Error de galería:', response.error);
        console.log('Error', 'No se pudo abrir la galería');
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const image = response.assets[0];
        console.log('📱 [GALLERY] Imagen seleccionada:', {
          uri: image.uri,
          type: image.type,
          fileName: image.fileName,
          fileSize: image.fileSize
        });
        
        if (image.uri) {
          handleUploadStudentAvatar(student, image.uri);
        } else {
          console.error('📱 [GALLERY] No se pudo obtener la URI de la imagen');
          console.log('Error', 'No se pudo obtener la imagen seleccionada');
        }
      } else {
        console.error('📱 [GALLERY] No se encontraron imágenes en la respuesta');
        console.log('Error', 'No se encontraron imágenes');
      }
    });
  };

  // Función alternativa usando el hook
  const openGalleryForStudentAlternative = (student: any) => {
    console.log('📱 [GALLERY ALTERNATIVE] Abriendo galería para estudiante:', student.nombre);
    
    // Usar el hook para seleccionar imagen
    pickImage();
    
    // Cuando se seleccione una imagen, procesarla
    if (imagePickerImage) {
      console.log('📱 [GALLERY ALTERNATIVE] Imagen seleccionada:', imagePickerImage);
      handleUploadStudentAvatar(student, imagePickerImage);
      clearImage(); // Limpiar la imagen seleccionada
    }
  };

  const handleUploadStudentAvatar = async (student: any, imageUri: string) => {
    try {
      console.log('🖼️ [STUDENT AVATAR] Procesando imagen del estudiante:', student.nombre);
      
      // Procesar la imagen antes de subirla
      const processedImage = await processStudentImage(imageUri);
      console.log('✅ [STUDENT AVATAR] Imagen procesada:', processedImage.width, 'x', processedImage.height);
      console.log('📦 [STUDENT AVATAR] Tamaño procesado:', processedImage.size, 'bytes');
      
      // Preparar la imagen para subir
      const formData = prepareStudentImageForUpload(processedImage);
      
      const response = await apiClient.put(`/students/${student._id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      if (result.success) {
        console.log('✅ [STUDENT AVATAR] Avatar del estudiante actualizado exitosamente');
        console.log('🔍 [STUDENT AVATAR] Nuevo avatar URL:', result.data.student.avatar);
        
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
        
        // Refrescar la asociación activa para que el header se actualice automáticamente
        console.log('🔄 [STUDENT AVATAR] Refrescando asociación activa para actualizar header...');
        await refreshActiveAssociation();
        console.log('✅ [STUDENT AVATAR] Asociación activa refrescada - header debería actualizarse automáticamente');
      } else {
        console.error('❌ [STUDENT AVATAR] Error del servidor:', result.message || 'Error al actualizar el avatar del estudiante');
      }
    } catch (error: any) {
      console.error('❌ [STUDENT AVATAR] Error al subir avatar del estudiante:', error);
      console.log('Error', 'Error al actualizar el avatar del estudiante');
    }
  };

  // Efecto para cargar datos del usuario
  useEffect(() => {
    loadUserData();
  }, [authUser?._id]);



  // Efecto para subir imagen cuando se selecciona
  useEffect(() => {
    
    if (selectedImage && user?._id) {
      handleUploadAvatar();
    }
  }, [selectedImage]);

  // Efecto para manejar imagen seleccionada del hook
  useEffect(() => {
    if (imagePickerImage) {
      console.log('📱 [IMAGE PICKER] Imagen seleccionada del hook:', imagePickerImage);
      // Aquí puedes procesar la imagen si es necesario
    }
  }, [imagePickerImage]);






  // Debug: Log del activeStudent antes de pasarlo al CommonHeader
  const activeStudent = getActiveStudent();
  console.log('🔍 [PerfilScreen] activeStudent para CommonHeader:', activeStudent ? {
    id: activeStudent._id,
    name: activeStudent.nombre,
    avatar: activeStudent.avatar
  } : null);

  return (
    <View style={styles.perfilContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          onOpenMenu={openMenu}
          activeStudent={activeStudent}
        />
      
      <KeyboardAvoidingView
        style={styles.perfilContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.perfilScrollView}
          contentContainerStyle={styles.perfilScrollContainer}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0E5FCE"]}
              tintColor="#0E5FCE"
            />
          }
        >
          {/* Contenido del perfil */}
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

                  {/* Botón de Cerrar Sesión - REMOVIDO (está en el menú hamburguesa) */}
                </View>
              )}
            </View>



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
                openFormularios={() => {
                  closeMenu();
                  setShowFormularios(true);
                }}
                pendingFormsCount={pendingFormsCount}
              />
            </View>
          </View>
        </Modal>

        {/* Modal para solicitar asociación - REMOVIDO (ya no se usa en esta pantalla) */}


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
  // Estilos para las pestañas - REMOVIDOS (ya no se usan)
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
  // Estilos para el botón de cerrar sesión - REMOVIDOS (ya no se usan)
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