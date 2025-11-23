import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import FormRequestService, { FormRequest } from '../src/services/formRequestService';
import { toastService } from '../src/services/toastService';
// Iconos reemplazados con texto/emoji ya que lucide-react-native no está instalado

interface FormulariosScreenProps {
  onBack: () => void;
  onCompleteForm: (formRequest: FormRequest) => void;
}

const FormulariosScreen: React.FC<FormulariosScreenProps> = ({ onBack, onCompleteForm }) => {
  const { user, activeAssociation } = useAuth();
  const { getActiveStudent } = useInstitution();
  
  const activeStudent = getActiveStudent();
  
  const [formRequests, setFormRequests] = useState<FormRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentStudent = getActiveStudent();
    if (user && currentStudent) {
      loadFormRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadFormRequests = async () => {
    const currentStudent = getActiveStudent();
    console.log('📋 [FormulariosScreen] loadFormRequests iniciado:', {
      userId: user?._id,
      studentId: currentStudent?._id
    });
    
    if (!user?._id || !currentStudent?._id) {
      console.log('❌ [FormulariosScreen] Usuario o estudiante no encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 [FormulariosScreen] Llamando a getAllForms...');
      const forms = await FormRequestService.getAllForms(user._id, currentStudent._id);
      console.log('📋 [FormulariosScreen] Formularios obtenidos:', forms.length);
      setFormRequests(forms);
    } catch (error: any) {
      console.error('❌ [FormulariosScreen] Error cargando formularios:', error);
      console.error('❌ [FormulariosScreen] Error details:', error.response?.data || error.message);
      toastService.error('Error al cargar formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteForm = async (formRequest: FormRequest) => {
    // Si el formulario está aprobado, mostrar las respuestas en modo solo lectura
    // Si está rechazado o completado, permitir editar
    if (formRequest.estado === 'aprobado') {
      try {
        const currentStudent = getActiveStudent();
        if (!user?._id || !currentStudent?._id) {
          toastService.error('Error: Usuario o estudiante no encontrado');
          return;
        }
        
        const response = await FormRequestService.getFormResponse(
          formRequest.formRequest._id,
          currentStudent._id,
          user._id
        );
        
        if (response) {
          // Mostrar las respuestas en un modal o pantalla de solo lectura
          Alert.alert(
            'Formulario Completado',
            `Este formulario fue completado el ${response.fechaCompletado ? new Date(response.fechaCompletado).toLocaleDateString('es-AR') : 'fecha desconocida'}. Puedes ver tus respuestas en el detalle.`,
            [
              { text: 'Ver Respuestas', onPress: () => onCompleteForm(formRequest) },
              { text: 'Cerrar', style: 'cancel' }
            ]
          );
        } else {
          toastService.error('No se encontraron las respuestas del formulario');
        }
      } catch (error: any) {
        console.error('Error cargando respuesta:', error);
        toastService.error('Error al cargar las respuestas');
      }
    } else {
      // Si no está completado, abrir para completarlo
      onCompleteForm(formRequest);
    }
  };

  const getStatusBadge = (formRequest: FormRequest) => {
    const estado = formRequest.estado || (formRequest.completado ? 'completado' : (formRequest.hasDraft ? 'en_progreso' : 'en_progreso'));
    
    switch (estado) {
      case 'aprobado':
        return (
          <View style={styles.statusBadgeApproved}>
            <Text style={styles.statusBadgeIcon}>✓</Text>
            <Text style={styles.statusBadgeTextApproved}>Aprobado</Text>
          </View>
        );
      case 'completado':
        return (
          <View style={styles.statusBadgeCompleted}>
            <Text style={styles.statusBadgeIcon}>✓</Text>
            <Text style={styles.statusBadgeTextCompleted}>Completado</Text>
          </View>
        );
      case 'rechazado':
        return (
          <View style={styles.statusBadgeRejected}>
            <Text style={styles.statusBadgeIcon}>✗</Text>
            <Text style={styles.statusBadgeTextRejected}>Rechazado</Text>
          </View>
        );
      default:
        if (formRequest.hasDraft) {
          return (
            <View style={styles.statusBadgeInProgress}>
              <Text style={styles.statusBadgeIcon}>⏱️</Text>
              <Text style={styles.statusBadgeTextInProgress}>En Progreso</Text>
            </View>
          );
        }
        return (
          <View style={styles.statusBadgePending}>
            <Text style={styles.statusBadgeIcon}>⚠️</Text>
            <Text style={styles.statusBadgeTextPending}>Pendiente</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Formularios</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E5FCE" />
          <Text style={styles.loadingText}>Cargando formularios...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Formularios</Text>
      </View>

      <ScrollView style={styles.content}>
        {formRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No hay formularios</Text>
            <Text style={styles.emptyText}>
              No hay formularios disponibles para este estudiante
            </Text>
          </View>
        ) : (
          <View style={styles.formsList}>
            {formRequests.map((formRequest) => (
              <TouchableOpacity
                key={formRequest._id}
                style={[
                  styles.formCard,
                  formRequest.requerido && styles.formCardRequired
                ]}
                onPress={() => handleCompleteForm(formRequest)}
              >
                <View style={styles.formCardHeader}>
                  <View style={styles.formCardTitleContainer}>
                    <Text style={styles.formCardIcon}>📋</Text>
                    <Text style={styles.formCardTitle}>
                      {formRequest.formRequest.nombre}
                    </Text>
                  </View>
                  {formRequest.requerido && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredBadgeText}>Requerido</Text>
                    </View>
                  )}
                </View>
                
                {formRequest.formRequest.descripcion && (
                  <Text style={styles.formCardDescription}>
                    {formRequest.formRequest.descripcion}
                  </Text>
                )}

                <View style={styles.formCardFooter}>
                  <View style={styles.formCardInfo}>
                    <Text style={styles.formCardInfoText}>
                      División: {formRequest.division.nombre}
                    </Text>
                  </View>
                  {getStatusBadge(formRequest)}
                </View>

                <View style={styles.formCardAction}>
                  <Text style={styles.formCardActionText}>
                    {formRequest.estado === 'aprobado'
                      ? 'Ver Respuestas →'
                      : formRequest.estado === 'rechazado'
                        ? 'Completar Nuevamente →'
                        : formRequest.completado 
                          ? 'Ver Respuestas →' 
                          : formRequest.hasDraft 
                            ? 'Continuar →' 
                            : 'Completar →'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
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
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  formsList: {
    gap: 16
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  formCardRequired: {
    borderColor: '#EF4444',
    borderWidth: 2
  },
  formCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  formCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  formCardIcon: {
    fontSize: 24,
    marginRight: 8
  },
  formCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
    flex: 1
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  requiredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626'
  },
  formCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20
  },
  formCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  formCardInfo: {
    flex: 1
  },
  formCardInfoText: {
    fontSize: 14,
    color: '#6B7280'
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusBadgeIcon: {
    fontSize: 14
  },
  statusBadgeTextPending: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444'
  },
  statusBadgeInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusBadgeTextInProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B'
  },
  statusBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusBadgeTextCompleted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669'
  },
  statusBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusBadgeTextApproved: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857'
  },
  statusBadgeRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusBadgeTextRejected: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626'
  },
  formCardAction: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  formCardActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E5FCE',
    textAlign: 'center'
  }
});

export default FormulariosScreen;

