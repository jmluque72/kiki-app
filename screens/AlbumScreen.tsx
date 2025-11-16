import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import favoriteService from '../src/services/favoriteService';
import ImageFullScreen from '../components/ImageFullScreen';
import CommonHeader from '../components/CommonHeader';
import withSideMenu from '../components/withSideMenu';
import { toastService } from '../src/services/toastService';
import { getFirstMedia, getMediaType } from '../src/utils/mediaUtils';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 60) / 2; // 2 columnas con padding

interface FavoriteActivity {
  _id: string;
  student?: string | {
    _id: string;
    nombre?: string;
    apellido?: string;
  };
  activity: {
    _id: string;
    titulo: string;
    descripcion: string;
    imagenes: string[];
    fecha: string;
    participantes?: Array<{
      _id: string;
      nombre: string;
      apellido: string;
    }>;
  };
  addedAt: string;
}

interface StudentSection {
  title: string;
  data: FavoriteActivity[];
}

interface FlatListItem {
  type: 'header' | 'activityPair';
  data: any;
}

const AlbumScreen: React.FC<{ onOpenNotifications: () => void; onOpenMenu?: () => void }> = ({ onOpenNotifications, onOpenMenu }) => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  const [favorites, setFavorites] = useState<FavoriteActivity[]>([]);
  const [groupedFavorites, setGroupedFavorites] = useState<StudentSection[]>([]);
  const [flatData, setFlatData] = useState<FlatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<FavoriteActivity | null>(null);

  // Obtener el estudiante del usuario (usar activeAssociation o getActiveStudent)
  const getUserStudent = () => {
    // Priorizar la asociación activa
    if (activeAssociation?.student?._id) {
      return activeAssociation.student._id;
    }
    
    // Fallback: usar getActiveStudent del contexto
    const activeStudent = getActiveStudent();
    if (activeStudent?._id) {
      return activeStudent._id;
    }
    
    // Fallback antiguo: buscar en userAssociations
    const association = userAssociations.find(assoc => 
      assoc.role?.nombre === 'familyadmin' || assoc.role?.nombre === 'familyviewer'
    );
    
    return association?.student?._id;
  };

  // Obtener el nombre del estudiante del usuario
  const getUserStudentName = () => {
    const association = userAssociations.find(assoc => 
      assoc.role?.nombre === 'familyadmin' || assoc.role?.nombre === 'familyviewer'
    );
    if (association?.student?.nombre && association?.student?.apellido) {
      return `${association.student.nombre} ${association.student.apellido}`;
    } else if (association?.student?.nombre) {
      return association.student.nombre;
    }
    return 'Mi Estudiante';
  };

  // Agrupar actividades por estudiante
  const groupActivitiesByStudent = (activities: FavoriteActivity[]): StudentSection[] => {
    const grouped: { [key: string]: FavoriteActivity[] } = {};
    
    activities.forEach(activity => {
      let studentName = 'Mi Estudiante'; // Fallback por defecto
      
      // PRIORIDAD 1: Usar el campo student del favorito si está disponible
      // (el favorito tiene un campo student que indica a qué estudiante pertenece)
      if (activity.student) {
        const studentId = typeof activity.student === 'string' 
          ? activity.student 
          : activity.student._id;
        
        // Buscar el estudiante en las asociaciones del usuario
        const studentAssociation = userAssociations.find(assoc => 
          assoc.student?._id === studentId
        );
        
        if (studentAssociation?.student) {
          if (studentAssociation.student.nombre && studentAssociation.student.apellido) {
            studentName = `${studentAssociation.student.nombre} ${studentAssociation.student.apellido}`;
          } else if (studentAssociation.student.nombre) {
            studentName = studentAssociation.student.nombre;
          }
        }
      }
      
      // PRIORIDAD 2: Si no se encontró por student, usar participantes de la actividad
      if (studentName === 'Mi Estudiante' && activity.activity && activity.activity.participantes && activity.activity.participantes.length > 0) {
        const participant = activity.activity.participantes[0];
        if (participant.nombre && participant.apellido) {
          studentName = `${participant.nombre} ${participant.apellido}`;
        } else if (participant.nombre) {
          studentName = participant.nombre;
        }
      }
      
      // PRIORIDAD 3: Fallback al nombre del estudiante activo
      if (studentName === 'Mi Estudiante') {
        studentName = getUserStudentName();
      }
      
      if (!grouped[studentName]) {
        grouped[studentName] = [];
      }
      grouped[studentName].push(activity);
    });

    // Convertir a array de secciones y ordenar por nombre
    const sections = Object.keys(grouped)
      .sort()
      .map(studentName => ({
        title: studentName,
        data: grouped[studentName]
      }));
    
    console.log('📊 [AlbumScreen] Secciones creadas:', sections.map(s => ({ title: s.title, count: s.data.length })));
    
    return sections;
  };

  // Aplanar datos para FlatList con headers y agrupar actividades en pares
  const flattenData = (sections: StudentSection[]): FlatListItem[] => {
    const flat: FlatListItem[] = [];
    
    sections.forEach(section => {
      // Agregar header
      flat.push({
        type: 'header',
        data: section
      });
      
      // Agrupar actividades en pares para 2 columnas
      const activities = section.data;
      for (let i = 0; i < activities.length; i += 2) {
        const pair = activities.slice(i, i + 2);
        flat.push({
          type: 'activityPair',
          data: pair
        });
      }
    });
    
    return flat;
  };

  // Obtener todos los estudiantes del usuario
  const getAllUserStudents = () => {
    const students: Array<{ _id: string; nombre: string; apellido?: string }> = [];
    
    userAssociations.forEach(assoc => {
      if (assoc.student && (assoc.role?.nombre === 'familyadmin' || assoc.role?.nombre === 'familyviewer')) {
        // Evitar duplicados
        if (!students.find(s => s._id === assoc.student._id)) {
          students.push({
            _id: assoc.student._id,
            nombre: assoc.student.nombre,
            apellido: assoc.student.apellido
          });
        }
      }
    });
    
    return students;
  };

  // Cargar favoritos de todos los estudiantes del usuario
  const loadFavorites = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Obtener todos los estudiantes del usuario
      const students = getAllUserStudents();
      
      if (students.length === 0) {
        console.log('⚠️ [AlbumScreen] No se encontraron estudiantes asociados');
        setFavorites([]);
        setGroupedFavorites([]);
        setFlatData([]);
        return;
      }

      console.log('📸 [AlbumScreen] Cargando favoritos para', students.length, 'estudiante(s):', students.map(s => s.nombre));
      
      // Cargar favoritos de todos los estudiantes en paralelo
      const favoritesPromises = students.map(student => 
        favoriteService.getStudentFavorites(student._id)
      );
      
      const favoritesArrays = await Promise.all(favoritesPromises);
      
      // Combinar todos los favoritos en un solo array
      const allFavorites = favoritesArrays.flat();
      
      console.log('🔍 [AlbumScreen] Total de favoritos recibidos:', allFavorites.length);
      setFavorites(allFavorites);
      
      // Agrupar actividades por estudiante
      const grouped = groupActivitiesByStudent(allFavorites);
      setGroupedFavorites(grouped);
      
      // Aplanar datos para FlatList
      const flat = flattenData(grouped);
      setFlatData(flat);
      
      console.log('✅ [AlbumScreen] Favoritos cargados y agrupados:', allFavorites.length, 'en', grouped.length, 'secciones');
    } catch (error) {
      console.error('❌ [AlbumScreen] Error cargando favoritos:', error);
      console.log('Error: No se pudieron cargar los favoritos');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // console.log('🔄 [AlbumScreen] useEffect triggered:', {
    //   selectedInstitution: !!selectedInstitution,
    //   userAssociationsLength: userAssociations.length,
    //   userAssociations: userAssociations.map(assoc => ({
    //     role: assoc.role?.nombre,
    //     student: assoc.student?.nombre
    //   }))
    // });
    
    if (selectedInstitution && userAssociations.length > 0) {
      loadFavorites();
    } else {
      // console.log('⚠️ [AlbumScreen] Condiciones no cumplidas para cargar favoritos');
      setLoading(false);
    }
  }, [selectedInstitution, userAssociations]);

  // Función para manejar el pull to refresh
  const onRefresh = async () => {
    await loadFavorites(true);
  };

  // Manejar click en imagen
  const handleImagePress = (activity: FavoriteActivity, imageIndex: number) => {
    setSelectedActivity(activity);
    setSelectedImageIndex(imageIndex);
    setShowFullScreen(true);
  };

  // Cerrar pantalla completa
  const handleFullScreenClose = () => {
    setShowFullScreen(false);
    setSelectedActivity(null);
    setSelectedImageIndex(0);
  };

  // Cambiar imagen en pantalla completa
  const handleImageIndexChange = (newIndex: number) => {
    setSelectedImageIndex(newIndex);
  };

  // Manejar toggle de favoritos
  const handleFavoriteToggle = async (activityId: string, currentFavoriteStatus: boolean) => {
    try {
      const studentId = getUserStudent();
      if (!studentId) {
        toastService.error('Error', 'No se pudo identificar el estudiante');
        return;
      }

      if (currentFavoriteStatus) {
        // Remover de favoritos
        await favoriteService.removeFavorite(studentId, activityId);
        toastService.favorite(
          'Eliminado de favoritos',
          'La actividad se eliminó de tus favoritos'
        );
      } else {
        // Agregar a favoritos
        await favoriteService.addFavorite(studentId, activityId);
        toastService.favorite(
          'Agregado a favoritos',
          'La actividad se guardó en tus favoritos'
        );
      }

      // Recargar la lista de favoritos
      await loadFavorites();
    } catch (error) {
      console.error('❌ [AlbumScreen] Error toggling favorite:', error);
      toastService.error('Error', 'No se pudo actualizar el favorito');
    }
  };

  // Renderizar header de sección (nombre del estudiante)
  const renderSectionHeader = ({ section }: { section: StudentSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionSubtitle}>
        {section.data.length} {section.data.length === 1 ? 'actividad' : 'actividades'}
      </Text>
    </View>
  );

  // Renderizar par de actividades
  const renderActivityPair = ({ activities }: { activities: FavoriteActivity[] }) => (
    <View style={styles.activityRow}>
      {activities.map((activity, index) => (
        <View key={activity._id} style={styles.activityColumn}>
          {renderImage({ item: activity })}
        </View>
      ))}
      {/* Si solo hay una actividad, agregar espacio vacío */}
      {activities.length === 1 && <View style={styles.activityColumn} />}
    </View>
  );

  // Renderizar item del FlatList
  const renderFlatListItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return renderSectionHeader({ section: item.data });
    } else if (item.type === 'activityPair') {
      return renderActivityPair({ activities: item.data });
    }
    return null;
  };

  // Renderizar imagen individual
  const renderImage = ({ item: activity }: { item: FavoriteActivity }) => {
    // console.log('🖼️ [AlbumScreen] Renderizando actividad:', {
    //   id: activity._id,
    //   titulo: activity.activity.titulo,
    //   createdAt: activity.activity.createdAt,
    //   createdAtType: typeof activity.activity.createdAt,
    //   imagenes: activity.activity.imagenes,
    //   imagenesLength: activity.activity.imagenes?.length
    // });
    
    // Verificar que activity.activity no sea null antes de acceder a sus propiedades
    // Mostrar placeholder si no hay imágenes ni videos
    const hasMedia = activity.activity?.imagenes && activity.activity.imagenes.length > 0;
    
    if (!activity.activity) {
      return null;
    }

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.imageWrapper}
          onPress={() => hasMedia ? handleImagePress(activity, 0) : null}
        >
          {hasMedia ? (() => {
            const firstMedia = getFirstMedia(activity.activity?.imagenes || []);
            if (!firstMedia) {
              // Placeholder si no hay media válida
              return (
                <View style={styles.placeholderContainer}>
                  <View style={styles.placeholderIcon}>
                    <Text style={styles.placeholderIconText}>📷</Text>
                  </View>
                </View>
              );
            }

            return (
              <>
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
                    style={styles.image}
                    resizeMode="cover"
                    onLoad={() => {/* console.log('✅ [AlbumScreen] Media cargada:', firstMedia.url) */}}
                    onError={(error) => {/* console.log('❌ [AlbumScreen] Error cargando media:', error.nativeEvent.error, 'URL:', firstMedia.url) */}}
                  />
                )}
                {activity.activity?.imagenes && activity.activity.imagenes.length > 1 && (
                  <View style={styles.multipleImagesIndicator}>
                    <Text style={styles.multipleImagesText}>+{activity.activity.imagenes.length - 1}</Text>
                  </View>
                )}
              </>
            );
          })() : (
            // Placeholder cuando no hay imágenes ni videos
            <View style={styles.placeholderContainer}>
              <View style={styles.placeholderIcon}>
                <Text style={styles.placeholderIconText}>📷</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.activityTitle} numberOfLines={2}>
          {activity.activity?.titulo || 'Sin título'}
        </Text>
        <Text style={styles.activityDate}>
          {activity.activity?.createdAt ? new Date(activity.activity.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'Sin fecha'}
        </Text>
        {activity.activity?.division && (
          <Text style={styles.activityDivision} numberOfLines={1}>
            {activity.activity.division.nombre}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CommonHeader 
          onOpenNotifications={onOpenNotifications}
          onOpenMenu={onOpenMenu}
          activeStudent={getActiveStudent()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Cargando álbum...</Text>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <CommonHeader 
          onOpenNotifications={onOpenNotifications}
          onOpenMenu={onOpenMenu}
          activeStudent={getActiveStudent()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Álbum de Favoritos</Text>
          <Text style={styles.emptyText}>
            Aún no tienes actividades favoritas.{'\n'}
            Marca actividades como favoritas para verlas aquí.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader 
        onOpenNotifications={onOpenNotifications}
        onOpenMenu={onOpenMenu}
        activeStudent={getActiveStudent()}
      />
      
      {/* Header del álbum */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Álbum de Favoritos</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} {favorites.length === 1 ? 'actividad' : 'actividades'} favorita{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Grid de imágenes agrupadas por estudiante */}
      <FlatList
        data={flatData}
        renderItem={renderFlatListItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Pantalla completa */}
      {showFullScreen && selectedActivity && selectedActivity.activity.imagenes && selectedActivity.activity.imagenes.length > 0 && (
        <ImageFullScreen
          visible={showFullScreen}
          images={selectedActivity.activity.imagenes}
          currentIndex={selectedImageIndex}
          onClose={handleFullScreenClose}
          onIndexChange={handleImageIndexChange}
          activityId={selectedActivity.activity._id}
          studentId={getUserStudent() || ''}
          isFavorite={true}
          onFavoriteToggle={() => handleFavoriteToggle(selectedActivity.activity._id, true)}
          activityTitle={selectedActivity.activity.titulo}
          activityDescription={selectedActivity.activity.descripcion}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    padding: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  activityColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  videoPreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  videoPreviewBackground: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
  multipleImagesIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  multipleImagesText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityTitle: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
  activityDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activityDivision: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  placeholderContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIconText: {
    fontSize: 32,
  },
  sectionHeader: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
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
    borderRadius: 8,
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
    fontSize: 24,
    color: '#FFFFFF',
  },
});

export default withSideMenu(AlbumScreen);
