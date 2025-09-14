import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import { ActivityService } from '../src/services/activityService';
import favoriteService from '../src/services/favoriteService';
import { useInstitution } from '../contexts/InstitutionContext';
import ImageFullScreen from './ImageFullScreen';

interface Activity {
  _id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  entidad: string;
  entidadId: string;
  imagenes: string[];
  participantes: string;
  datos: any;
  account: {
    nombre: string;
    razonSocial: string;
  };
  division: {
    nombre: string;
    descripcion: string;
  };
  usuario: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActivityDetailModalProps {
  visible: boolean;
  activity: Activity | null;
  userRole: string;
  onClose: () => void;
  onEdit?: (activityId: string) => void;
}

const { width, height } = Dimensions.get('window');

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  visible,
  activity,
  userRole,
  onClose,
  onEdit
}) => {
  const { getActiveStudent } = useInstitution();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Si no está visible o no hay actividad, no renderizar nada
  if (!visible || !activity) return null;

  const canEdit = userRole === 'coordinador';
  const isFamilyUser = userRole === 'familyadmin' || userRole === 'familyviewer';
  const activeStudent = getActiveStudent();


  // Verificar si la actividad es favorita cuando se abre el modal
  useEffect(() => {
    if (visible && activity && isFamilyUser && activeStudent) {
      checkFavoriteStatus();
    }
  }, [visible, activity, isFamilyUser, activeStudent]);

  const checkFavoriteStatus = async () => {
    try {
      const favoriteStatus = await favoriteService.checkFavorite(activity._id, activeStudent._id);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeStudent || loadingFavorite) return;

    setLoadingFavorite(true);
    try {
      const newFavoriteStatus = !isFavorite;
      await favoriteService.toggleFavorite(activity._id, activeStudent._id, newFavoriteStatus);
      setIsFavorite(newFavoriteStatus);
      
      Alert.alert(
        'Éxito',
        newFavoriteStatus ? 'Agregado a favoritos' : 'Eliminado de favoritos'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleImagePress = () => {
    if (isFamilyUser && activity.imagenes && activity.imagenes.length > 0) {
      setShowFullScreen(true);
    }
  };

  // Para usuarios familiares, abrir directamente la pantalla fullscreen
  const handleActivityPress = () => {
    if (isFamilyUser && activity.imagenes && activity.imagenes.length > 0) {
      setShowFullScreen(true);
    }
  };

  const handleFullScreenClose = () => {
    setShowFullScreen(false);
  };

  const handleImageIndexChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleFavoriteToggle = (newFavoriteStatus: boolean) => {
    setIsFavorite(newFavoriteStatus);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityEmoji = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'login':
        return '🔐';
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'register':
        return '📝';
      default:
        return '📋';
    }
  };



  const handleDelete = () => {
    if (canEdit) {
      Alert.alert(
        'Eliminar Actividad',
        '¿Estás seguro de que quieres eliminar esta actividad?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🗑️ [ActivityDetailModal] Iniciando eliminación de actividad:', activity._id);
                
                const result = await ActivityService.deleteActivity(activity._id);
                
                if (result.success) {
                  console.log('✅ [ActivityDetailModal] Actividad eliminada exitosamente');
                  
                  // Cerrar el modal
                  onClose();
                  
                  // Mostrar mensaje de éxito
                  Alert.alert(
                    'Éxito',
                    'Actividad eliminada exitosamente',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          // Recargar la pantalla del home
                          if (onEdit) {
                            onEdit('refresh');
                          }
                        }
                      }
                    ]
                  );
                } else {
                  console.log('❌ [ActivityDetailModal] Error al eliminar actividad:', result.message);
                  
                  Alert.alert(
                    'Error',
                    result.message || 'Error al eliminar la actividad',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                console.error('❌ [ActivityDetailModal] Error inesperado:', error);
                
                Alert.alert(
                  'Error',
                  'Error inesperado al eliminar la actividad',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    }
  };

  console.log('🔍 [ActivityDetailModal] Renderizando modal:', { visible, activityId: activity._id });
  
  // Si no está visible, no renderizar nada
  if (!visible) {
    console.log('🔍 [ActivityDetailModal] Modal no visible, retornando null');
    return null;
  }
  
  // Para usuarios familiares, mostrar directamente la pantalla fullscreen
  if (isFamilyUser && activity.imagenes && activity.imagenes.length > 0) {
    return (
      <>
        {/* Pantalla de imagen completa para usuarios familiares */}
        {activeStudent && (
          <ImageFullScreen
            visible={visible}
            images={activity.imagenes || []}
            currentIndex={currentImageIndex}
            onClose={onClose}
            onIndexChange={handleImageIndexChange}
            activityId={activity._id}
            studentId={activeStudent._id}
            isFavorite={isFavorite}
            onFavoriteToggle={handleFavoriteToggle}
            activityTitle={activity.titulo}
            activityDescription={activity.descripcion}
          />
        )}
      </>
    );
  }

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Actividad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            {/* Carrusel de imágenes para usuarios familiares */}
            {isFamilyUser && activity.imagenes && activity.imagenes.length > 0 ? (
              <View style={styles.carouselContainer}>
                <FlatList
                  data={activity.imagenes}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentImageIndex(index);
                  }}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity 
                      style={styles.carouselImageContainer}
                      onPress={handleImagePress}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: item }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                      {/* Botón de favorito */}
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleToggleFavorite}
                        disabled={loadingFavorite}
                      >
                        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
                          {isFavorite ? '❤️' : '🤍'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
                {/* Indicadores de página */}
                {activity.imagenes.length > 1 && (
                  <View style={styles.pageIndicators}>
                    {activity.imagenes.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.pageIndicator,
                          index === currentImageIndex && styles.pageIndicatorActive
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* Carrusel de imágenes para coordinadores */
              activity.imagenes && activity.imagenes.length > 0 ? (
                <View style={styles.imageContainer}>
                  <FlatList
                    data={activity.imagenes}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.carouselContainer}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                      setCurrentImageIndex(index);
                    }}
                    renderItem={({ item }) => (
                      <View style={styles.carouselImageContainer}>
                        <Image
                          source={{ uri: item }}
                          style={styles.carouselImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  {/* Indicadores de página */}
                  {activity.imagenes.length > 1 && (
                    <View style={styles.pageIndicators}>
                      {activity.imagenes.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.pageIndicator,
                            index === currentImageIndex && styles.pageIndicatorActive
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageEmoji}>{getActivityEmoji(activity.tipo)}</Text>
                  <Text style={styles.noImageText}>Sin imagen</Text>
                </View>
              )
            )}

            <Text style={styles.activityTitle}>{activity.titulo || activity.descripcion}</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>Institución: {activity.account?.nombre}</Text>
              {activity.division && (
                <Text style={styles.infoValue}>División: {activity.division.nombre}</Text>
              )}
              <Text style={styles.infoValue}>Creado por: {activity.usuario?.name}</Text>
              <Text style={styles.infoValue}>Fecha: {formatDate(activity.createdAt)}</Text>
              {activity.participantes && (
                <Text style={styles.infoValue}>Participantes: {activity.participantes}</Text>
              )}
            </View>
          </ScrollView>

          {/* Footer con acciones */}
          {canEdit && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
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
  modalContainer: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#0E5FCE',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  mainImage: {
    width: width * 0.6,
    height: 150,
    borderRadius: 15,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: '#FF8C42',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  noImageContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F5F5F5',
    margin: 10,
    marginBottom: 15,
    borderRadius: 15,
  },
  noImageEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  noImageText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: fonts.medium,
  },
  infoSection: {
    padding: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
    paddingVertical: 5,
  },
  dataSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  dataTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    marginBottom: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#666666',
    flex: 1,
  },
  dataValue: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
  gallerySection: {
    padding: 20,
  },
  galleryTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    marginBottom: 15,
  },
  galleryImageContainer: {
    marginRight: 10,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  // Estilos para el carrusel
  carouselContainer: {
    height: 250,
    marginBottom: 20,
  },
  carouselImageContainer: {
    width: width * 0.9,
    height: 250,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  favoriteIconActive: {
    fontSize: 26,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  pageIndicatorActive: {
    backgroundColor: '#FF8C42',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
});

export default ActivityDetailModal;
