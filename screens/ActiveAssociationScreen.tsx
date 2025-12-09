import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { fonts } from '../src/config/fonts';
import { useAuth } from "../contexts/AuthContextHybrid"
import { ActiveAssociationService, AvailableAssociation } from '../src/services/activeAssociationService';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import { processStudentImage, prepareStudentImageForUpload } from '../src/services/studentImageService';
import { apiClient } from '../src/services/api';
import { API_FULL_URL } from '../src/config/apiConfig';

interface ActiveAssociationScreenProps {
  onBack: () => void;
}

const ActiveAssociationScreen: React.FC<ActiveAssociationScreenProps> = ({ onBack }) => {
  const { activeAssociation, refreshActiveAssociation, token } = useAuth();
  const [availableAssociations, setAvailableAssociations] = useState<AvailableAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  // Función para copiar imagen temporal a lugar permanente en Android
  const copyImageToPermanentLocation = async (imageUri: string): Promise<string> => {
    if (Platform.OS !== 'android') {
      return imageUri; // En iOS, retornar URI original
    }

    try {
      console.log('📱 [STUDENT AVATAR] Copiando archivo temporal a lugar permanente:', imageUri);
      
      // Si ya es un archivo permanente (no temporal), retornar tal cual
      if (!imageUri.includes('rn_image_picker_lib_temp')) {
        console.log('✅ [STUDENT AVATAR] Archivo ya es permanente, no necesita copia');
        return imageUri;
      }

      // Usar ImageResizer para copiar el archivo (sin redimensionar, solo copiar)
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const outputPath = `permanent_student_${timestamp}_${random}.jpg`;
      
      console.log('📁 [STUDENT AVATAR] Creando copia permanente con outputPath:', outputPath);
      
      const result = await ImageResizer.createResizedImage(
        imageUri,
        10000, // Dimensiones muy grandes para no redimensionar (solo copiar)
        10000,
        'JPEG',
        100, // Calidad máxima
        0,
        outputPath,
        true, // keepMetadata
        { mode: 'contain' }
      );

      console.log('✅ [STUDENT AVATAR] Archivo copiado exitosamente a:', result.uri);
      return result.uri;
    } catch (error: any) {
      console.error('❌ [STUDENT AVATAR] Error copiando archivo, usando URI original:', error);
      return imageUri;
    }
  };


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
    
    try {
      // Verificar permisos, pero no bloquear completamente si falla
      const { checkImagePermissions } = require('../src/utils/permissionUtils');
      const hasPermission = await checkImagePermissions();
      console.log('📱 [GALLERY] Permiso verificado:', hasPermission);
      
      const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };

    console.log('📱 [GALLERY] Llamando a launchImageLibrary con opciones:', options);
    
    launchImageLibrary(options, (response) => {
      console.log('📱 [GALLERY] Response recibida:', {
        didCancel: response.didCancel,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        hasAssets: !!response.assets,
        assetsCount: response.assets?.length || 0
      });
      
      if (response.didCancel) {
        console.log('📱 [GALLERY] Usuario canceló la galería');
        return;
      } 
      
      if (response.errorCode || response.error) {
        console.error('📱 [GALLERY] Error de galería:', response.errorCode, response.errorMessage);
        Alert.alert('Error', `No se pudo abrir la galería: ${response.errorMessage || response.errorCode}`);
        return;
      }
      
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;
        console.log('📱 [GALLERY] Imagen seleccionada:', imageUri);
        
        // En Android, copiar la imagen a un lugar permanente antes de procesarla
        if (Platform.OS === 'android') {
          console.log('📱 [GALLERY] Android detectado - copiando imagen a lugar permanente...');
          copyImageToPermanentLocation(imageUri)
            .then((permanentUri) => {
              console.log('✅ [GALLERY] Imagen copiada exitosamente a:', permanentUri);
              handleUploadStudentAvatar(student, permanentUri);
            })
            .catch((error) => {
              console.error('❌ [GALLERY] Error copiando imagen, usando original:', error);
              // Usar URI original de todas formas - puede funcionar si el archivo aún existe
              handleUploadStudentAvatar(student, imageUri);
            });
        } else {
          // En iOS, usar directamente
          handleUploadStudentAvatar(student, imageUri);
        }
      } else {
        console.error('📱 [GALLERY] No se encontraron imágenes en la respuesta');
        Alert.alert('Error', 'No se encontraron imágenes');
      }
    });
    } catch (error: any) {
      console.error('❌ [GALLERY] Error abriendo galería:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
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
      
      // Obtener el token más reciente
      let currentToken = token;
      if (!currentToken) {
        try {
          const RefreshTokenService = require('../src/services/refreshTokenService').default;
          currentToken = await RefreshTokenService.getAccessToken();
          console.log('🔑 [STUDENT AVATAR] Token obtenido del storage');
        } catch (tokenError) {
          console.error('❌ [STUDENT AVATAR] Error obteniendo token:', tokenError);
        }
      }
      
      if (!currentToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      let result: any;
      
      // En Android, usar fetch directamente (más confiable para archivos)
      if (Platform.OS === 'android') {
        console.log('📱 [STUDENT AVATAR] Android - usando fetch directamente');
        
        const fetchResponse = await fetch(`${API_FULL_URL}/students/${student._id}/avatar`, {
          method: 'PUT',
          body: formData,
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            // NO incluir Content-Type - fetch lo establecerá automáticamente con boundary
          },
        });
        
        console.log('📡 [STUDENT AVATAR] Response status:', fetchResponse.status);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('❌ [STUDENT AVATAR] Error response:', errorText);
          
          // Si es 401, el token puede estar expirado
          if (fetchResponse.status === 401) {
            console.log('🔄 [STUDENT AVATAR] Token expirado, intentando refresh...');
            try {
              const RefreshTokenService = require('../src/services/refreshTokenService').default;
              const newToken = await RefreshTokenService.refreshAccessToken();
              if (newToken) {
                console.log('✅ [STUDENT AVATAR] Token renovado, reintentando upload...');
                const retryResponse = await fetch(`${API_FULL_URL}/students/${student._id}/avatar`, {
                  method: 'PUT',
                  body: formData,
                  headers: {
                    'Authorization': `Bearer ${newToken}`,
                  },
                });
                
                if (!retryResponse.ok) {
                  const retryErrorText = await retryResponse.text();
                  throw new Error(`Error ${retryResponse.status}: ${retryErrorText}`);
                }
                
                result = await retryResponse.json();
                console.log('✅ [STUDENT AVATAR] Avatar subido con fetch después de refresh:', result);
              } else {
                throw new Error(`Error ${fetchResponse.status}: ${errorText}`);
              }
            } catch (refreshError) {
              console.error('❌ [STUDENT AVATAR] Error refrescando token:', refreshError);
              throw new Error(`Error de autenticación: ${errorText}`);
            }
          } else {
            throw new Error(`Error ${fetchResponse.status}: ${errorText}`);
          }
        } else {
          result = await fetchResponse.json();
          console.log('✅ [STUDENT AVATAR] Avatar subido con fetch:', result);
        }
      } else {
        // En iOS, usar apiClient (funciona bien)
        const response = await apiClient.put(`/students/${student._id}/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        result = response.data;
      }
      
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
      const errorMessage = error.message || 'Error al actualizar el avatar del estudiante';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploadingAvatar(null);
    }
  };

  const renderAssociationCard = (association: AvailableAssociation) => {
    // Usar directamente el campo isActive que viene del API
    const isActive = association.isActive;
    const isSwitching = switching === association._id;
    

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
          onPress={() => {
            // Solo cambiar asociación si no está activa y no se está subiendo un avatar
            if (!isActive && !isSwitching && !uploadingAvatar) {
              handleSwitchAssociation(association._id);
            }
          }}
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
        
        {/* Botón cambiar foto fuera del TouchableOpacity padre para evitar conflictos */}
        {association.student && isActive && (
          <View style={styles.changePhotoButtonContainer}>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => {
                console.log('📷 [ActiveAssociationScreen] Botón cambiar foto presionado para:', association.student.nombre);
                console.log('📷 [ActiveAssociationScreen] Llamando a openGalleryForStudent...');
                openGalleryForStudent(association.student);
              }}
              disabled={uploadingAvatar === association.student._id}
              activeOpacity={0.7}
            >
              {uploadingAvatar === association.student._id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.changePhotoButtonText}>Cambiar foto</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!isActive && !isSwitching && (
          <View style={styles.cardFooter}>
            <Text style={styles.switchText}>Toca para cambiar</Text>
          </View>
        )}
        </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  studentTextContainer: {
    flex: 1,
    marginLeft: 8,
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
  changePhotoButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0E5FCE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButtonText: {
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
