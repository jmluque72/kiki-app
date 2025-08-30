import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import { ActivityService } from '../src/services/activityService';

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
  // Si no está visible o no hay actividad, no renderizar nada
  if (!visible || !activity) return null;

  const canEdit = userRole === 'coordinador';
  
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

          <View style={styles.modalContent}>
            {/* Imagen principal */}
            {activity.imagenes && activity.imagenes.length > 0 ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: activity.imagenes[0] }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
                {activity.imagenes.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>+{activity.imagenes.length - 1}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageEmoji}>{getActivityEmoji(activity.tipo)}</Text>
                <Text style={styles.noImageText}>Sin imagen</Text>
              </View>
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
          </View>

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
    minHeight: 300,
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
});

export default ActivityDetailModal;
