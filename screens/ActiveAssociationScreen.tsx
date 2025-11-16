import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { fonts } from '../src/config/fonts';
import { useAuth } from "../contexts/AuthContextHybrid"
import { ActiveAssociationService, AvailableAssociation } from '../src/services/activeAssociationService';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import { processStudentImage, prepareStudentImageForUpload } from '../src/services/studentImageService';
import { apiClient } from '../src/services/api';
import { checkImagePermissions } from '../src/utils/permissionUtils';

interface ActiveAssociationScreenProps {
  onBack: () => void;
}

const ActiveAssociationScreen: React.FC<ActiveAssociationScreenProps> = ({ onBack }) => {
  const { activeAssociation, refreshActiveAssociation } = useAuth();
  const [availableAssociations, setAvailableAssociations] = useState<AvailableAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);


  useEffect(() => {
    console.log('🎯 [ActiveAssociationScreen] useEffect ejecutándose...');
    loadAvailableAssociations();
  }, []);

  // Debug log para ver los datos que llegan
  useEffect(() => {
    console.log('🎯 [ActiveAssociationScreen] Datos recibidos:');
    console.log('   - activeAssociation:', activeAssociation);
    console.log('   - availableAssociations:', availableAssociations.length, 'asociaciones');
    
    if (activeAssociation && availableAssociations.length > 0) {
      console.log('🎯 [ActiveAssociationScreen] Detalles de activeAssociation:', {
        id: activeAssociation._id,
        activeShared: activeAssociation.activeShared,
        account: activeAssociation.account.nombre,
        role: activeAssociation.role.nombre,
        student: activeAssociation.student?.nombre || 'Sin estudiante'
      });
    }
  }, [activeAssociation, availableAssociations]);

  const loadAvailableAssociations = async () => {
    try {
      console.log('🚀 [ActiveAssociationScreen] Iniciando carga de asociaciones...');
      setLoading(true);
      
      console.log('📡 [ActiveAssociationScreen] Llamando a ActiveAssociationService.getAvailableAssociations()...');
      const associations = await ActiveAssociationService.getAvailableAssociations();
      
      console.log('✅ [ActiveAssociationScreen] Respuesta recibida:', associations);
      console.log('📊 [ActiveAssociationScreen] Tipo de respuesta:', typeof associations);
      console.log('📊 [ActiveAssociationScreen] Es array:', Array.isArray(associations));
      console.log('📊 [ActiveAssociationScreen] Longitud:', associations?.length);
      
      setAvailableAssociations(associations);
      console.log('📋 [ActiveAssociationScreen] Asociaciones disponibles:', associations.length);
      
      // Mostrar alert con los resultados del servicio
      console.log('🔔 [ActiveAssociationScreen] Preparando alert...');
      console.log('✅ [ActiveAssociationScreen] Asociaciones cargadas exitosamente:', associations.length);
    } catch (error) {
      console.error('❌ [ActiveAssociationScreen] Error cargando asociaciones:', error);
      console.error('❌ [ActiveAssociationScreen] Error details:', error.message);
      console.error('❌ [ActiveAssociationScreen] Error stack:', error.stack);
      console.error('❌ [ActiveAssociationScreen] Error cargando asociaciones:', error.message);
    } finally {
      setLoading(false);
      console.log('🏁 [ActiveAssociationScreen] Carga completada');
    }
  };

  const handleSwitchAssociation = async (associationId: string) => {
    try {
      setSwitching(associationId);
      console.log('🔄 [ActiveAssociationScreen] Cambiando a asociación:', associationId);
      
      const success = await ActiveAssociationService.setActiveAssociation(associationId);
      
      if (success) {
        // Refrescar la asociación activa en el contexto
        await refreshActiveAssociation();
        
        // Cerrar la pantalla sin mostrar alert
        onBack();
      } else {
        console.error('❌ [ActiveAssociationScreen] No se pudo cambiar la asociación activa');
      }
    } catch (error) {
      console.error('❌ [ActiveAssociationScreen] Error cambiando asociación:', error);
      console.error('❌ [ActiveAssociationScreen] No se pudo cambiar la asociación activa');
    } finally {
      setSwitching(null);
    }
  };

  const openGalleryForStudent = async (student: any) => {
    console.log('📱 [GALLERY] Abriendo galería para estudiante:', student.nombre);
    console.log('📱 [GALLERY] Student ID:', student._id);
    console.log('📱 [GALLERY] Active association role:', activeAssociation?.role?.nombre);
    
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
        console.log('📱 [GALLERY] Usuario canceló la galería');
        return;
      } 
      
      if (response.errorCode || response.error) {
        console.error('📱 [GALLERY] Error de galería:', response.errorCode, response.errorMessage);
        Alert.alert('Error', 'No se pudo abrir la galería');
        return;
      }
      
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        handleUploadStudentAvatar(student, response.assets[0].uri);
      } else {
        Alert.alert('Error', 'No se encontraron imágenes');
      }
    });
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
        console.log('✅ [STUDENT AVATAR] Avatar del estudiante actualizado exitosamente');
        
        // Actualizar el avatar en el estado local
        setAvailableAssociations(prev => prev.map(assoc => {
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
        }));
        
        // Recargar las asociaciones
        await loadAvailableAssociations();
        
        // Refrescar la asociación activa para que el header se actualice
        await refreshActiveAssociation();
        
        Alert.alert('Éxito', 'Avatar actualizado correctamente');
      } else {
        console.error('❌ [STUDENT AVATAR] Error del servidor:', result.message);
        Alert.alert('Error', result.message || 'Error al actualizar el avatar del estudiante');
      }
    } catch (error: any) {
      console.error('❌ [STUDENT AVATAR] Error al subir avatar del estudiante:', error);
      Alert.alert('Error', 'Error al actualizar el avatar del estudiante');
    } finally {
      setUploadingAvatar(null);
    }
  };

  const renderAssociationCard = (association: AvailableAssociation) => {
    // Usar directamente el campo isActive que viene del API
    const isActive = association.isActive;
    const isSwitching = switching === association._id;
    
    // Debug logs para verificar el campo isActive
    console.log(`🔍 [ActiveAssociationScreen] ${association.account.nombre} - ${association.role.nombre}:`, {
      associationId: association._id,
      isActiveFromAPI: association.isActive,
      isActive: isActive,
      isSwitching: isSwitching,
      hasStudent: !!association.student,
      studentNombre: association.student?.nombre
    });
    
    // Alert para debug
    if (association.student) {
      Alert.alert('DEBUG CARD', `Card: ${association.account.nombre}\nEstudiante: ${association.student.nombre}\nisActive: ${isActive}\nRol: ${association.role.nombre}`);
    }

    return (
      <View
        key={association._id}
        style={[
          styles.associationCard,
          isActive && styles.activeAssociationCard
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchableArea}
          onPress={() => !isActive && handleSwitchAssociation(association._id)}
          disabled={isActive || isSwitching}
          activeOpacity={0.7}
        >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.institutionName, isActive && styles.activeText]}>
              {association.account.nombre}
            </Text>
            <Text style={[styles.roleName, isActive && styles.activeText]}>
              {getRoleDisplayName(association.role.nombre)}
            </Text>
          </View>
          
          <View style={styles.cardHeaderRight}>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVA</Text>
              </View>
            )}
            {isSwitching && (
              <ActivityIndicator size="small" color="#FF8C42" />
            )}
          </View>
        </View>

        {association.division && (
          <View style={styles.cardContent}>
            <Text style={[styles.divisionText, isActive && styles.activeText]}>
              📚 {association.division.nombre}
            </Text>
          </View>
        )}

        {association.student && (
          <View style={styles.cardContent}>
            <View style={styles.studentInfo}>
              <View style={styles.studentAvatarContainer}>
                {association.student.avatar ? (
                  <Image 
                    source={{ uri: association.student.avatar }} 
                    style={styles.studentAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.studentAvatarPlaceholder}>
                    <Text style={styles.studentAvatarText}>
                      {association.student.nombre.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.studentTextContainer}>
                <Text style={[styles.studentName, isActive && styles.activeText]}>
                  👨‍🎓 {association.student.nombre} {association.student.apellido}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!isActive && !isSwitching && (
          <View style={styles.cardFooter}>
            <Text style={styles.switchText}>Toca para cambiar</Text>
          </View>
        )}
        </TouchableOpacity>
        
        {/* Botón de cambiar avatar - fuera del TouchableOpacity, solo en la asociación activa */}
        {(() => {
          console.log('🔍 [ActiveAssociationScreen] Verificando botón - isActive:', isActive, 'hasStudent:', !!association.student, 'student:', association.student?.nombre);
          Alert.alert('DEBUG BOTÓN', `isActive: ${isActive}\nhasStudent: ${!!association.student}\nestudiante: ${association.student?.nombre || 'N/A'}`);
          
          if (isActive && association.student) {
            Alert.alert('DEBUG BOTÓN TRUE', `Botón debería aparecer - isActive: ${isActive}, estudiante: ${association.student.nombre}`);
            return (
              <TouchableOpacity
                style={styles.changeAvatarButton}
                onPress={() => {
                  Alert.alert('Botón presionado', `Cambiar avatar de ${association.student.nombre}`);
                  console.log('📷 [ActiveAssociationScreen] Botón cambiar avatar presionado para:', association.student.nombre);
                  openGalleryForStudent(association.student);
                }}
                disabled={uploadingAvatar === association.student._id}
              >
                {uploadingAvatar === association.student._id ? (
                  <ActivityIndicator size="small" color="#0E5FCE" />
                ) : (
                  <Text style={styles.changeAvatarButtonText}>Cambiar avatar</Text>
                )}
              </TouchableOpacity>
            );
          } else {
            Alert.alert('DEBUG BOTÓN FALSE', `No se muestra botón - isActive: ${isActive}, hasStudent: ${!!association.student}`);
          }
          return null;
        })()}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Cargando asociaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Asociación</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🏫 Tus Asociaciones</Text>
          <Text style={styles.infoText}>
            Selecciona la asociación que quieres usar como activa. Esta determinará qué institución, rol y estudiante se mostrarán en la aplicación.
          </Text>
        </View>

        {availableAssociations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tienes asociaciones disponibles</Text>
          </View>
        ) : (
          <View style={styles.associationsList}>
            {availableAssociations.map(renderAssociationCard)}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 La asociación activa determina qué contenido ves en la aplicación
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: fonts.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF8C42',
    fontFamily: fonts.medium,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
  },
  infoTitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  associationsList: {
    marginBottom: 20,
  },
  associationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeAssociationCard: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF8F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  institutionName: {
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  roleName: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.medium,
  },
  activeText: {
    color: '#FF8C42',
  },
  activeBadge: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  cardContent: {
    marginBottom: 8,
  },
  divisionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentTextContainer: {
    flex: 1,
  },
  studentAvatarContainer: {
    position: 'relative',
    marginRight: 8,
    width: 60,
    height: 60,
    zIndex: 100,
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
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editStudentAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
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
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editStudentAvatarIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  changeAvatarButton: {
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0E5FCE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  cardTouchableArea: {
    flex: 1,
  },
  studentAvatarText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  studentName: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.regular,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  switchText: {
    fontSize: 12,
    color: '#FF8C42',
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ActiveAssociationScreen;
