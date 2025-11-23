import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import { ActiveAssociationService } from '../src/services/activeAssociationService';
import { toastService } from '../src/services/toastService';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import { fonts } from '../src/config/fonts';
import SharedService from '../src/services/sharedService';
import { processStudentImage, prepareStudentImageForUpload } from '../src/services/studentImageService';
import { apiClient } from '../src/services/api';
import { checkImagePermissions } from '../src/utils/permissionUtils';

interface AssociationsScreenProps {
  onBack: () => void;
}

const AssociationsScreen: React.FC<AssociationsScreenProps> = ({ onBack }) => {
  const { user, activeAssociation, associations, refreshActiveAssociation, logout } = useAuth();
  const { userAssociations, setUserAssociations } = useInstitution();
  
  // Debug: Verificar que los contextos estén funcionando
  console.log('DEBUG AssociationsScreen - useAuth context:', { user, activeAssociation, associations });
  console.log('DEBUG AssociationsScreen - useInstitution context:', { userAssociations });
  const [loadingAsociaciones, setLoadingAsociaciones] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [asociacionActiva, setAsociacionActiva] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';

  useEffect(() => {
    console.log('DEBUG useEffect - activeAssociation:', activeAssociation);
    console.log('DEBUG useEffect - userAssociations:', userAssociations);
    
    if (activeAssociation && userAssociations.length > 0) {
      // Buscar la asociación que coincide con la asociación activa
      const matchingAssociation = userAssociations.find(assoc => 
        assoc._id === activeAssociation._id || 
        assoc.student?._id === activeAssociation.student?._id
      );
      
      if (matchingAssociation) {
        const matchingIdString = String(matchingAssociation._id);
        console.log('DEBUG useEffect - Found matching association:', matchingAssociation._id);
        console.log('DEBUG useEffect - Setting asociacionActiva to:', matchingIdString);
        setAsociacionActiva(matchingIdString);
      } else if (userAssociations.length > 0) {
        const firstIdString = String(userAssociations[0]._id);
        console.log('DEBUG useEffect - No matching association, using first userAssociation:', userAssociations[0]._id);
        setAsociacionActiva(firstIdString);
      }
    } else if (userAssociations.length > 0) {
      const firstIdString = String(userAssociations[0]._id);
      console.log('DEBUG useEffect - No activeAssociation, using first userAssociation:', userAssociations[0]._id);
      setAsociacionActiva(firstIdString);
    }
  }, [activeAssociation, userAssociations]);

  // Debug: Log para verificar la asociación activa
  useEffect(() => {
    console.log('DEBUG AssociationsScreen - activeAssociation:', activeAssociation);
    console.log('DEBUG AssociationsScreen - userAssociations:', userAssociations);
    console.log('DEBUG AssociationsScreen - asociacionActiva:', asociacionActiva);
  }, [activeAssociation, userAssociations, asociacionActiva]);

  const handleSelectAsociacion = async (asociacionId: string) => {
    const asociacionIdString = String(asociacionId);
    const asociacionActivaString = String(asociacionActiva || '');
    
    if (asociacionIdString === asociacionActivaString) {
      return;
    }

    try {
      setLoadingAsociaciones(true);
      await ActiveAssociationService.setActiveAssociation(asociacionId);
      setAsociacionActiva(asociacionIdString);
      
      // Refrescar la asociación activa en el contexto global
      await refreshActiveAssociation();
      
      toastService.success('Asociación activada exitosamente');
      
      // Cerrar después de 1 segundo
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error al activar asociación:', error);
      toastService.error('Error al activar asociación');
    } finally {
      setLoadingAsociaciones(false);
    }
  };

  const handleInviteFamilyViewer = async () => {
    if (!inviteEmail.trim() || !inviteName.trim() || !inviteLastName.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!activeAssociation?.student?._id) {
      Alert.alert('Error', 'No se encontró el estudiante activo');
      return;
    }

    setLoadingInvite(true);
    try {
      await SharedService.requestAssociation({
        email: inviteEmail.trim(),
        nombre: inviteName.trim(),
        apellido: inviteLastName.trim(),
        studentId: activeAssociation.student._id
      });

      toastService.success('Invitación enviada correctamente');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteLastName('');
    } catch (error: any) {
      console.error('Error al enviar invitación:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar la invitación';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingInvite(false);
    }
  };

  const openGalleryForStudent = async (student: any) => {
    console.log('📱 [GALLERY] Abriendo galería para estudiante:', student.nombre);
    console.log('📱 [GALLERY] Student ID:', student._id);
    
    // Verificar permisos primero
    const hasPermissions = await checkImagePermissions();
    if (!hasPermissions) {
      console.log('📱 [GALLERY] Permisos denegados');
      return;
    }
    
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('📱 [GALLERY] Usuario canceló la selección');
        return;
      }

      if (response.errorCode) {
        console.error('📱 [GALLERY] Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Error al abrir la galería');
        return;
      }

      if (response.assets && response.assets.length > 0 && response.assets[0]?.uri) {
        handleUploadStudentAvatar(student, response.assets[0].uri);
      } else {
        Alert.alert('Error', 'No se encontraron imágenes válidas');
      }
    });
  };

  const refreshAssociations = async () => {
    try {
      console.log('🔄 [AssociationsScreen] Refrescando asociaciones...');
      const updatedAssociations = await SharedService.getUserAssociations();
      setUserAssociations(updatedAssociations);
      console.log('✅ [AssociationsScreen] Asociaciones refrescadas:', updatedAssociations.length);
    } catch (error: any) {
      console.error('❌ [AssociationsScreen] Error refrescando asociaciones:', error);
      toastService.error('Error al refrescar asociaciones');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refrescar asociaciones
      await refreshAssociations();
      // También refrescar la asociación activa
      await refreshActiveAssociation();
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUploadStudentAvatar = async (student: any, imageUri: string) => {
    try {
      setUploadingAvatar(student._id);
      console.log('🖼️ [STUDENT AVATAR] Procesando imagen del estudiante:', student.nombre);
      
      // Procesar la imagen antes de subirla
      const processedImage = await processStudentImage(imageUri);
      console.log('✅ [STUDENT AVATAR] Imagen procesada:', processedImage.width, 'x', processedImage.height);
      
      // Preparar la imagen para subir
      const formData = prepareStudentImageForUpload(processedImage);
      
      const response = await apiClient.put(`/students/${student._id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      if (result.success) {
        console.log('✅ [STUDENT AVATAR] Avatar actualizado exitosamente');
        toastService.success('Avatar actualizado exitosamente');
        
        // Refrescar la asociación activa para obtener el nuevo avatar
        await refreshActiveAssociation();
        // Refrescar las asociaciones para ver el nuevo avatar en la lista
        await refreshAssociations();
      } else {
        throw new Error(result.message || 'Error al actualizar el avatar');
      }
    } catch (error: any) {
      console.error('❌ [STUDENT AVATAR] Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el avatar';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploadingAvatar(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Asociaciones</Text>
      </View>

      {/* Botón Invitar - Solo para familyadmin */}
      {isFamilyAdmin && (
        <View style={styles.inviteSection}>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Text style={styles.inviteButtonText}>+ Invitar Familiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {userAssociations.length > 1 && (
          <Text style={styles.subtitle}>
            Toca una asociación para activarla
          </Text>
        )}

        {loadingAsociaciones ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E5FCE" />
            <Text style={styles.loadingText}>Cargando asociaciones...</Text>
          </View>
        ) : userAssociations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes asociaciones</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  'Cerrar Sesión',
                  '¿Estás seguro de que deseas cerrar sesión?',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel'
                    },
                    {
                      text: 'Cerrar Sesión',
                      style: 'destructive',
                      onPress: () => logout()
                    }
                  ]
                );
              }}
            >
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={userAssociations}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0E5FCE']}
                tintColor="#0E5FCE"
              />
            }
            renderItem={({ item }) => {
              const itemIdString = String(item._id);
              const asociacionActivaString = String(asociacionActiva);
              const isActive = itemIdString === asociacionActivaString;
              
              console.log('DEBUG renderItem:');
              console.log('  item._id:', item._id);
              console.log('  itemIdString:', itemIdString);
              console.log('  itemIdString length:', itemIdString.length);
              console.log('  asociacionActiva:', asociacionActiva);
              console.log('  asociacionActivaString:', asociacionActivaString);
              console.log('  asociacionActivaString length:', asociacionActivaString.length);
              console.log('  isActive:', isActive);
              console.log('  itemIdString === asociacionActivaString:', itemIdString === asociacionActivaString);
              console.log('  === COMPARISON ===');
              
              return (
                <View
                  style={[
                    styles.asociacionItem,
                    isActive && styles.asociacionItemActiva
                  ]}
                >
                  <TouchableOpacity
                    style={styles.asociacionTouchable}
                    onPress={() => handleSelectAsociacion(item._id)}
                    disabled={isActive}
                  >
                    <View style={styles.asociacionInfo}>
                      <View style={styles.asociacionHeader}>
                        <Text style={styles.asociacionInstitucion}>{item.account.nombre}</Text>
                        {isActive && (
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
                              />
                            ) : (
                              <View style={styles.studentAvatarPlaceholder}>
                                <Text style={styles.studentAvatarText}>
                                  {item.student.nombre.charAt(0)}
                                </Text>
                              </View>
                            )}
                            {/* Botón de cámara sobre el avatar - solo en la asociación activa y si es familyadmin */}
                            {isActive && (item.role?.nombre === 'familyadmin' || isFamilyAdmin) && (
                              <View style={styles.editStudentAvatarButton}>
                                <TouchableOpacity
                                  style={styles.editStudentAvatarButtonInner}
                                  onPress={() => {
                                    openGalleryForStudent(item.student);
                                  }}
                                  disabled={uploadingAvatar === item.student._id}
                                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                  {uploadingAvatar === item.student._id ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <Image
                                      source={require('../assets/design/icons/camera.png')}
                                      style={styles.editStudentAvatarIcon}
                                      resizeMode="contain"
                                    />
                                  )}
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          <View style={styles.studentTextContainer}>
                            <Text style={styles.studentName}>
                              {item.student.nombre} {item.student.apellido}
                            </Text>
                            <Text style={styles.studentRole}>
                              {getRoleDisplayName(item.role?.nombre || '')}
                            </Text>
                          </View>
                        </View>
                      )}
                      {!item.student && (
                        <Text style={styles.asociacionRole}>
                          {getRoleDisplayName(item.role?.nombre || '')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modal de Invitación */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invitar Familiar</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={inviteName}
              onChangeText={setInviteName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={inviteLastName}
              onChangeText={setInviteLastName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleInviteFamilyViewer}
                disabled={loadingInvite}
              >
                {loadingInvite ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Enviar</Text>
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
    backgroundColor: '#FFFFFF',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  asociacionItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  asociacionItemActiva: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0E5FCE',
  },
  asociacionInfo: {
    flex: 1,
  },
  asociacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  asociacionInstitucion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  asociacionActivaBadge: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  asociacionActivaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  asociacionDivision: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  studentAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editStudentAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  editStudentAvatarButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editStudentAvatarIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  studentTextContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  studentRole: {
    fontSize: 12,
    color: '#666666',
  },
  asociacionRole: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  asociacionTouchable: {
    flex: 1,
  },
  // Estilos para el botón de invitar
  inviteSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inviteButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para el modal
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  sendButton: {
    backgroundColor: '#0E5FCE',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssociationsScreen;