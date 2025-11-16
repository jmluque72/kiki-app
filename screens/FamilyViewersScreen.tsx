import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import SharedService, { FamilyViewer } from '../src/services/sharedService';
import { toastService } from '../src/services/toastService';

interface FamilyViewersScreenProps {
  onBack: () => void;
}

const FamilyViewersScreen: React.FC<FamilyViewersScreenProps> = ({ onBack }) => {
  const { activeAssociation } = useAuth();
  const { getActiveStudent } = useInstitution();
  
  const [familyViewers, setFamilyViewers] = useState<FamilyViewer[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  const activeStudent = getActiveStudent();

  useEffect(() => {
    if (isFamilyAdmin && activeStudent) {
      loadFamilyViewers();
    }
  }, [isFamilyAdmin, activeStudent]);

  // Cargar familyviewers
  const loadFamilyViewers = async () => {
    if (!isFamilyAdmin || !activeStudent) {
      console.log('⚠️ [loadFamilyViewers] Usuario no es familyadmin o no hay estudiante activo');
      return;
    }

    try {
      setLoading(true);
      const viewers = await SharedService.getFamilyViewers(activeStudent._id);
      console.log('✅ [loadFamilyViewers] Familyviewers recibidos del servidor:', viewers.length);
      setFamilyViewers(viewers);
    } catch (error: any) {
      console.error('❌ [loadFamilyViewers] Error al cargar familyviewers:', error);
      const errorMessage = error.response?.data?.message || 'Error al cargar familyviewers';
      toastService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar familyviewer
  const handleDeleteFamilyViewer = (viewer: FamilyViewer) => {
    Alert.alert(
      'Eliminar Family Viewer',
      `¿Estás seguro de que deseas eliminar a ${viewer.user.name} (${viewer.user.email})?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(viewer._id);
              await SharedService.deleteAssociation(viewer._id);
              toastService.success('Family viewer eliminado correctamente');
              // Recargar la lista
              await loadFamilyViewers();
            } catch (error: any) {
              console.error('❌ [handleDeleteFamilyViewer] Error al eliminar:', error);
              const errorMessage = error.response?.data?.message || 'Error al eliminar family viewer';
              toastService.error(errorMessage);
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  // Si no es familyadmin, mostrar mensaje de acceso denegado
  if (!isFamilyAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visualizadores</Text>
        </View>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedIcon}>🚫</Text>
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            Solo los administradores familiares pueden acceder a esta sección.
          </Text>
        </View>
      </View>
    );
  }

  // Si no hay estudiante activo
  if (!activeStudent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visualizadores</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay estudiante activo seleccionado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visualizadores</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Información del estudiante */}
      <View style={styles.studentInfo}>
        <Text style={styles.studentInfoLabel}>Estudiante:</Text>
        <Text style={styles.studentInfoName}>
          {activeStudent.nombre} {activeStudent.apellido}
        </Text>
      </View>

      {/* Lista de familyviewers */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E5FCE" />
          <Text style={styles.loadingText}>Cargando familyviewers...</Text>
        </View>
      ) : familyViewers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No hay familyviewers</Text>
          <Text style={styles.emptyText}>
            No hay usuarios con rol familyviewer asociados a este estudiante.
          </Text>
        </View>
      ) : (
        <FlatList
          data={familyViewers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.viewerCard}>
              <View style={styles.viewerInfo}>
                <Text style={styles.viewerName}>{item.user.name}</Text>
                <Text style={styles.viewerEmail}>{item.user.email}</Text>
                <Text style={styles.viewerRole}>Rol: {item.role.nombre}</Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteButton, deletingId === item._id && styles.deleteButtonDisabled]}
                onPress={() => handleDeleteFamilyViewer(item)}
                disabled={deletingId === item._id}
              >
                {deletingId === item._id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0E5FCE',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 60,
  },
  studentInfo: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  studentInfoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  studentInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  viewerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewerInfo: {
    flex: 1,
  },
  viewerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  viewerEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  viewerRole: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default FamilyViewersScreen;

