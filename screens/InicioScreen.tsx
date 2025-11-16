import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useInstitution } from '../contexts/InstitutionContext';
import { useActivities } from '../src/hooks/useActivities';
import CommonHeader from '../components/CommonHeader';
import withSideMenu from '../components/withSideMenu';
import { useAuth } from "../contexts/AuthContextHybrid"
import { getRoleDisplayName } from '../src/utils/roleTranslations';
import ActivityDetailModal from '../components/ActivityDetailModal';
import CustomCalendar from '../components/CustomCalendar';
import { getFirstMedia, getMediaType } from '../src/utils/mediaUtils';

const InicioScreen = ({ onOpenNotifications, onOpenMenu, onOpenActiveAssociation }: { onOpenNotifications: () => void; onOpenMenu?: () => void; onOpenActiveAssociation?: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  
  // Verificación de seguridad para useAuth
  let user, activeAssociation;
  try {
    const authContext = useAuth();
    user = authContext.user;
    activeAssociation = authContext.activeAssociation;
  } catch (error) {
    console.error('❌ [InicioScreen] Error accediendo a useAuth:', error);
    // Valores por defecto si hay error
    user = null;
    activeAssociation = null;
  }
  
  // Usar la primera institución si no hay ninguna seleccionada
  const effectiveInstitution = selectedInstitution || (userAssociations.length > 0 ? userAssociations[0] : null);
  
  // Estado para el pull-to-refresh
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Estado para el modal de detalles de actividad
  const [selectedActivity, setSelectedActivity] = React.useState<any>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  
  // Estado para el calendario - IMPORTANTE: Declarar ANTES de usarlo
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  
  // Debug logs para ver qué institución se está usando
  console.log('🔍 [InicioScreen] effectiveInstitution:', effectiveInstitution ? {
    id: effectiveInstitution._id,
    account: effectiveInstitution.account?.nombre,
    student: effectiveInstitution.student ? {
      id: effectiveInstitution.student._id,
      name: effectiveInstitution.student.nombre,
      avatar: effectiveInstitution.student.avatar
    } : null
  } : null);
  
  const { activities, loading, error, refetch } = useActivities(
    effectiveInstitution?.account._id,
    effectiveInstitution?.division?._id,
    selectedDate
  );
  
  // Log para verificar qué se está pasando al hook
  React.useEffect(() => {
    console.log('📅 [InicioScreen] Valores pasados a useActivities:', {
      accountId: effectiveInstitution?.account._id,
      divisionId: effectiveInstitution?.division?._id,
      selectedDate: selectedDate,
      selectedDateType: typeof selectedDate,
      selectedDateValue: selectedDate ? selectedDate.toISOString() : 'null'
    });
  }, [effectiveInstitution?.account._id, effectiveInstitution?.division?._id, selectedDate]);
  
  // Log cuando selectedDate cambia
  React.useEffect(() => {
    console.log('📅 [InicioScreen] selectedDate cambió:', selectedDate);
    console.log('📅 [InicioScreen] selectedDate tipo:', typeof selectedDate);
    console.log('📅 [InicioScreen] selectedDate valor:', selectedDate ? selectedDate.toString() : 'null');
    console.log('📅 [InicioScreen] selectedDate ISO:', selectedDate ? selectedDate.toISOString() : 'null');
  }, [selectedDate]);
  
  // Debug del estado del modal
  React.useEffect(() => {
    console.log('🔍 [InicioScreen] Estado del modal:', {
      modalVisible,
      selectedActivity: selectedActivity ? selectedActivity._id : null
    });
  }, [modalVisible, selectedActivity]);

  // Función para manejar el refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing activities:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Log para debug de actividades en el home
  React.useEffect(() => {
    console.log('🔍 Debug - InicioScreen activities:', activities);
    console.log('🔍 Debug - InicioScreen effectiveInstitution:', effectiveInstitution);
    
    activities.forEach((activity, index) => {
      console.log(`🔍 Debug - Activity ${index + 1} in home:`, {
        id: activity._id,
        descripcion: activity.descripcion,
        datos: activity.datos,
        imagenes: activity.datos?.imagenes || []
      });
    });
  }, [activities, effectiveInstitution]);

  const getInstitutionName = () => {
    if (effectiveInstitution && effectiveInstitution.account) {
      return effectiveInstitution.account.nombre;
    }
    return 'La Salle'; // Fallback
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleActivityPress = (activity: any) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedActivity(null);
  };

  const handleCalendarPress = () => {
    setCalendarVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    // Normalizar la fecha al inicio del día (00:00:00) para evitar problemas de zona horaria
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    console.log('📅 [InicioScreen] handleDateSelect llamado');
    console.log('📅 [InicioScreen] Fecha seleccionada original:', date);
    console.log('📅 [InicioScreen] Fecha normalizada:', normalizedDate);
    console.log('📅 [InicioScreen] Fecha normalizada ISO:', normalizedDate.toISOString());
    setSelectedDate(normalizedDate);
    console.log('📅 [InicioScreen] selectedDate actualizado a:', normalizedDate);
    setCalendarVisible(false);
  };

  const handleClearDate = () => {
    setSelectedDate(null);
  };

  const handleEditActivity = (activityId: string) => {
    if (activityId === 'refresh') {
      // Recargar las actividades
      console.log('🔄 [InicioScreen] Recargando actividades después de eliminar');
      refetch();
    } else {
      // TODO: Navegar a la pantalla de edición de actividad
      console.log('Editar actividad:', activityId);
      // Aquí podrías navegar a ActividadScreen con el ID de la actividad
    }
  };

  const getNoActivitiesMessage = () => {
    const userRole = user?.role?.nombre;
    const roleDisplayName = getRoleDisplayName(userRole || '');
    
    if (userRole === 'coordinador') {
      return effectiveInstitution?.division 
        ? `No hay actividades hoy en ${effectiveInstitution.division.nombre}`
        : 'No hay actividades hoy en la institución';
    } else if (userRole === 'familyadmin' || userRole === 'familyviewer') {
      return effectiveInstitution?.division 
        ? `No hay actividades hoy para tu estudiante en ${effectiveInstitution.division.nombre}`
        : 'No hay actividades hoy para tu estudiante';
    } else {
      return effectiveInstitution?.division 
        ? `No hay actividades en ${effectiveInstitution.division.nombre}`
        : 'No hay actividades recientes';
    }
  };



  const renderActivityItem = (activity: any, index: number) => (
    <View key={activity._id} style={styles.activityItem}>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={2}>
          {activity.descripcion}
        </Text>
        <Text style={styles.activityLocation}>
          {activity.account?.nombre || getInstitutionName()}
          {activity.division && ` - ${activity.division.nombre}`}
        </Text>
        <View style={styles.dateEditContainer}>
          <Text style={styles.activityDate}>{formatDate(activity.createdAt)}</Text>
          <View style={styles.editIcon}>
            <Image
              source={require('../assets/design/icons/edit.png')}
              style={styles.editIconImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityEmoji = (activity: any, index: number) => (
    <View key={activity._id} style={styles.activityImageContainer}>
      <Text style={styles.activityEmoji}>{getActivityEmoji(activity.tipo)}</Text>
      {index === 1 && activities.length > 3 && (
        <View style={styles.plusBadge}>
          <Text style={styles.plusText}>+{activities.length - 3}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.homeContainer}>
      <CommonHeader
        onOpenActiveAssociation={onOpenActiveAssociation} 
        onOpenNotifications={onOpenNotifications} 
        onOpenMenu={onOpenMenu}
        showMenuButton={true}
        activeStudent={getActiveStudent()}
      />
        <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']} // Color naranja para Android
            tintColor="#FF8C42" // Color naranja para iOS
          />
        }
      >
        {/* Sección de fecha */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>
            {selectedDate 
              ? selectedDate.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : new Date().toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
            }
          </Text>
          <TouchableOpacity style={styles.calendarIcon} onPress={handleCalendarPress}>
            <Image
              source={require('../assets/design/icons/calendar.png')}
              style={[styles.calendarIconImage]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity style={styles.clearDateButton} onPress={handleClearDate}>
              <Text style={styles.clearDateText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Timeline de actividades */}
        <View style={styles.timelineContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando actividades...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar actividades</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>
                {getNoActivitiesMessage()}
              </Text>
            </View>
          ) : (
            <View style={styles.timelineTable}>
              {activities.map((activity, index) => (
                <TouchableOpacity 
                  key={activity._id} 
                  style={styles.timelineRow}
                  onPress={() => handleActivityPress(activity)}
                  activeOpacity={0.6}
                >
                  {/* Columna del ícono */}
                  <View style={styles.iconColumn}>
                    {/* Círculo en el top del border */}
                    <View style={styles.borderCircle} />
                    
                    {/* Mostrar primera imagen/video o ícono por defecto */}
                    {(activity as any).imagenes && (activity as any).imagenes.length > 0 ? (
                      (() => {
                        const firstMedia = getFirstMedia((activity as any).imagenes);
                        if (!firstMedia) {
                          return (
                            <View style={styles.timelineIcon}>
                              <Text style={styles.timelineIconText}>
                                {getActivityEmoji(activity.tipo)}
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <View style={styles.timelineImageContainer}>
                            {firstMedia.type === 'video' ? (
                              // Preview especial para videos
                              <View style={styles.videoPreviewContainer}>
                                <View style={styles.videoPreviewBackground}>
                                  <View style={styles.videoPreviewIcon}>
                                    <Text style={styles.videoPreviewIconText}>🎬</Text>
                                  </View>
                                  <Text style={styles.videoPreviewText}>VIDEO</Text>
                                </View>
                                {/* Overlay de play */}
                                <View style={styles.videoOverlay}>
                                  <View style={styles.videoPlayButton}>
                                    <Text style={styles.videoPlayIcon}>▶</Text>
                                  </View>
                                </View>
                              </View>
                            ) : (
                              // Imagen normal
                              <Image 
                                source={{ uri: firstMedia.url }}
                                style={styles.timelineImage}
                                resizeMode="cover"
                              />
                            )}
                            {/* Contador de media múltiple */}
                            {(activity as any).imagenes.length > 1 && (
                              <View style={styles.imageCountBadge}>
                                <Text style={styles.imageCountText}>+{(activity as any).imagenes.length - 1}</Text>
                              </View>
                            )}
                          </View>
                        );
                      })()
                    ) : (
                      // Placeholder cuando no hay imagen ni video
                      <View style={styles.timelineImageContainer}>
                        <View style={styles.placeholderContainer} />
                      </View>
                    )}
                  </View>
                  
                  {/* Columna del contenido */}
                  <View style={styles.contentColumn}>
                    <Text style={styles.timelineTitle} numberOfLines={1}>
                      {activity.titulo}
                    </Text>
                    <Text style={styles.timelineDescription} numberOfLines={2}>
                      {activity.descripcion}
                    </Text>
                    <Text style={styles.timelineDate}>
                      {formatDate(activity.createdAt)}
                    </Text>
                  </View>
                  

                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Modal de detalles de actividad */}
      {modalVisible && selectedActivity && (
        <ActivityDetailModal
          visible={modalVisible}
          activity={selectedActivity}
          userRole={activeAssociation?.role?.nombre || ''}
          onClose={handleCloseModal}
          onEdit={handleEditActivity}
        />
      )}

      {/* Modal del calendario */}
      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <CustomCalendar
            onDateSelect={handleDateSelect}
            onClose={() => setCalendarVisible(false)}
          />
        </View>
      </Modal>
      
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
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: '600',
  },
  calendarIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIconImage: {
    width: 32,
    height: 32,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // Aumentar padding bottom para evitar que se tape con el tab bar
  },
  timelineTable: {
    minHeight: 'auto',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  iconColumn: {
    width: 129,
    height: 120,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FF8C42',
    position: 'relative'
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 15,
    paddingTop: 10,
  },
  timelineIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF8C42',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timelineIconText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  timelineImageContainer: {
    position: 'relative',
  },
  placeholderContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: '#FF8C42',
  },
  timelineImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FF8C42',
  },
  videoPreviewContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FF8C42',
    position: 'relative',
    overflow: 'hidden',
  },
  videoPreviewBackground: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 52,
  },
  videoPreviewIcon: {
    marginBottom: 4,
  },
  videoPreviewIconText: {
    fontSize: 24,
  },
  videoPreviewText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  imageCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  borderCircle: {
    position: 'absolute',
    bottom: 80,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF8C42',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },

  timelineTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
    marginBottom: 4,
    lineHeight: 20,
  },
  timelineDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#999999',
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 100,
    paddingLeft: 0,
    width: '100%',
  },
  activityImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activityEmoji: {
    fontSize: 24,
  },
  plusBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: '#FF8C42',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  plusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  activityContent: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'flex-start',
    paddingRight: 5,
    paddingTop: 5,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 2,
    paddingRight: 15,
  },
  activityLocation: {
    fontSize: 12,
    color: '#FF8C42',
    marginBottom: 1,
  },
  activityDate: {
    fontSize: 12,
    color: '#FF8C42',
  },
  dateEditContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  editIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  editIconImage: {
    width: 16,
    height: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#0E5FCE',
    fontFamily: fonts.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF8C42',
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noActivitiesText: {
    fontSize: 16,
    color: '#B3D4F1',
    fontFamily: fonts.bold,
    textAlign: 'center',
  },

  // Estilos para el calendario
  clearDateButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearDateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Estilos para el modal del calendario
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para videos
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 52,
  },
  videoPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  videoPlayIcon: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: 'bold',
    marginLeft: 2, // Ajuste visual para centrar el triángulo
  },
  videoIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default withSideMenu(InicioScreen); 