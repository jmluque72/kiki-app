import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polygon } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContextHybrid';
import { useInstitution } from '../../contexts/InstitutionContext';
import CommonHeader from '../../components/CommonHeader';
import tutorActionService from '../services/tutorActionService';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Componentes de iconos SVG con trazo azul y fondo transparente
const ActionIcon = ({ children, size = 32 }: { children: React.ReactNode; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: 'llega_tarde', 
    title: 'Llega tarde',
    description: 'El tutor informa que el alumno ingresará fuera del horario habitual.',
    icon: (
      <ActionIcon>
        <Circle cx="12" cy="12" r="10" stroke="#0E5FCE" strokeWidth="2" />
        <Path d="M12 6V12L16 14" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'ausencia_dia', 
    title: 'Ausencia del día',
    description: 'Notifica que el alumno no asistirá a la institución ese día.',
    icon: (
      <ActionIcon>
        <Circle cx="12" cy="12" r="10" stroke="#0E5FCE" strokeWidth="2" />
        <Line x1="8" y1="8" x2="16" y2="16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Line x1="16" y1="8" x2="8" y2="16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'retiro_anticipado', 
    title: 'Retiro anticipado',
    description: 'Indica que el alumno será retirado antes del horario normal.',
    icon: (
      <ActionIcon>
        <Circle cx="12" cy="12" r="10" stroke="#0E5FCE" strokeWidth="2" />
        <Path d="M12 6V12L8 16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Line x1="12" y1="18" x2="12" y2="20" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'autorizacion_retiro_tercero', 
    title: 'Autorización de retiro por tercero',
    description: 'El tutor autoriza a otra persona (nombre y DNI) a retirar al alumno.',
    icon: (
      <ActionIcon>
        <Circle cx="9" cy="7" r="4" stroke="#0E5FCE" strokeWidth="2" />
        <Path d="M3 21V19C3 15.6863 5.68629 13 9 13H15C18.3137 13 21 15.6863 21 19V21" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="18" cy="5" r="3" stroke="#0E5FCE" strokeWidth="2" />
      </ActionIcon>
    )
  },
  { 
    id: 'solicita_reunion', 
    title: 'Solicita reunión',
    description: 'Pedido formal de reunión con institución/seño.',
    icon: (
      <ActionIcon>
        <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#0E5FCE" strokeWidth="2" />
        <Line x1="8" y1="2" x2="8" y2="6" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Line x1="16" y1="2" x2="16" y2="6" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Line x1="3" y1="10" x2="21" y2="10" stroke="#0E5FCE" strokeWidth="2" />
        <Circle cx="12" cy="15" r="2" fill="#0E5FCE" />
      </ActionIcon>
    )
  },
  { 
    id: 'pedido_informacion_dia', 
    title: 'Pedido de información del día',
    description: 'El tutor solicita un breve resumen del día del alumno.',
    icon: (
      <ActionIcon>
        <Circle cx="12" cy="12" r="10" stroke="#0E5FCE" strokeWidth="2" />
        <Circle cx="12" cy="9" r="1" fill="#0E5FCE" />
        <Path d="M12 12V16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Path d="M8 19H16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'consulta_conducta_adaptacion', 
    title: 'Consulta sobre conducta o adaptación',
    description: 'Inquietud sobre comportamiento o proceso de adaptación.',
    icon: (
      <ActionIcon>
        <Circle cx="12" cy="12" r="9" stroke="#0E5FCE" strokeWidth="2" />
        <Circle cx="9" cy="9" r="1.5" fill="#0E5FCE" />
        <Circle cx="15" cy="9" r="1.5" fill="#0E5FCE" />
        <Path d="M8 15C8 15 9 17 12 17C15 17 16 15 16 15" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'trae_medicacion', 
    title: 'Trae medicación',
    description: 'Informa que llega con medicación y requiere resguardo o administración.',
    icon: (
      <ActionIcon>
        <Path d="M12 2L15 8H21L16 12L18 18L12 15L6 18L8 12L3 8H9L12 2Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'aviso_alergia_condicion', 
    title: 'Aviso de alergia o condición temporal',
    description: 'Comunica alergias nuevas, irritaciones o molestias del día.',
    icon: (
      <ActionIcon>
        <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="12" r="2" fill="#0E5FCE" />
      </ActionIcon>
    )
  },
  { 
    id: 'cambio_ropa_necesario', 
    title: 'Cambio de ropa necesario',
    description: 'Solicita o informa que puede necesitar una muda extra.',
    icon: (
      <ActionIcon>
        <Path d="M6 2H18C19.1 2 20 2.9 20 4V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 6H16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Path d="M8 10H16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Path d="M8 14H16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Path d="M8 18H12" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'olvido_pertenencias', 
    title: 'Olvidó pertenencias',
    description: 'Aviso de objetos o elementos faltantes.',
    icon: (
      <ActionIcon>
        <Path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="3" y1="6" x2="21" y2="6" stroke="#0E5FCE" strokeWidth="2" />
        <Circle cx="12" cy="12" r="2" fill="#0E5FCE" />
        <Line x1="12" y1="14" x2="12" y2="18" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
      </ActionIcon>
    )
  },
  { 
    id: 'objeto_importante_mochila', 
    title: 'Objeto importante en la mochila',
    description: 'Documentos, carpeta, medicación u objeto relevante.',
    icon: (
      <ActionIcon>
        <Path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="3" y1="6" x2="21" y2="6" stroke="#0E5FCE" strokeWidth="2" />
        <Path d="M8 10V18M12 10V18M16 10V18" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="6" r="1.5" fill="#0E5FCE" />
      </ActionIcon>
    )
  },
  { 
    id: 'autorizacion_especial', 
    title: 'Autorización especial',
    description: 'Permisos puntuales (actividades, salidas, fotos, etc.).',
    icon: (
      <ActionIcon>
        <Path d="M9 12L11 14L15 10" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0E5FCE" strokeWidth="2" />
      </ActionIcon>
    )
  },
  { 
    id: 'consulta_alimentacion', 
    title: 'Consulta sobre alimentación',
    description: 'Inquietudes relacionadas a comida, leche, colaciones o hábitos.',
    icon: (
      <ActionIcon>
        <Path d="M3 12C3 8 6 5 10 5H14C18 5 21 8 21 12C21 16 18 19 14 19H10C6 19 3 16 3 12Z" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8 12H16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 8V16" stroke="#0E5FCE" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="9" cy="9" r="1" fill="#0E5FCE" />
        <Circle cx="15" cy="9" r="1" fill="#0E5FCE" />
      </ActionIcon>
    )
  },
];

interface TutorQuickActionsScreenProps {
  onOpenNotifications: () => void;
  onOpenMenu: () => void;
  onOpenActiveAssociation?: () => void;
}

const TutorQuickActionsScreen: React.FC<TutorQuickActionsScreenProps> = ({
  onOpenNotifications,
  onOpenMenu,
  onOpenActiveAssociation
}) => {
  const { activeAssociation } = useAuth();
  const { getActiveStudent } = useInstitution();
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStudent = getActiveStudent();
  
  // Verificar si el usuario es familyviewer
  const currentRole = activeAssociation?.role?.nombre || '';
  const isFamilyViewer = currentRole === 'familyviewer';

  const handleActionPress = (action: QuickAction) => {
    // Si es familyviewer, mostrar mensaje y no abrir el modal
    if (isFamilyViewer) {
      Alert.alert(
        'Acción no disponible',
        'Solo están disponibles para el tutor',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedAction(action);
    setComment('');
    setShowCommentModal(true);
  };

  const handleCloseModal = () => {
    setShowCommentModal(false);
    setSelectedAction(null);
    setComment('');
  };

  const handleSubmit = async () => {
    if (!selectedAction || !activeStudent || !activeAssociation) {
      Alert.alert('Error', 'No se pudo obtener la información necesaria');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Atención', 'Por favor, ingresa un comentario');
      return;
    }

    setIsSubmitting(true);

    try {
      const divisionId = activeAssociation.division?._id?.toString();
      if (!divisionId) {
        Alert.alert('Error', 'No se pudo obtener la división del estudiante');
        return;
      }

      await tutorActionService.createTutorAction({
        actionType: selectedAction.id,
        actionTitle: selectedAction.title,
        comment: comment.trim(),
        studentId: activeStudent._id.toString(),
        divisionId: divisionId,
      });

      Alert.alert('Éxito', 'Tu comunicación ha sido enviada a los coordinadores', [
        {
          text: 'OK',
          onPress: () => {
            handleCloseModal();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Error enviando acción del tutor:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar la comunicación. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        onOpenNotifications={onOpenNotifications}
        onOpenMenu={onOpenMenu}
        onOpenActiveAssociation={onOpenActiveAssociation}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Comunicaciones rápidas</Text>
          <Text style={styles.subtitle}>
            Seleccioná una opción para informar a la institución.
          </Text>

          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  isFamilyViewer && styles.actionButtonDisabled
                ]}
                onPress={() => handleActionPress(action)}
                activeOpacity={isFamilyViewer ? 1 : 0.7}
                disabled={isFamilyViewer}
              >
                <View style={[
                  styles.iconContainer,
                  isFamilyViewer && styles.iconContainerDisabled
                ]}>
                  {action.icon}
                </View>
                <Text style={[
                  styles.actionText,
                  isFamilyViewer && styles.actionTextDisabled
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  styles.actionDescription,
                  isFamilyViewer && styles.actionDescriptionDisabled
                ]} numberOfLines={2}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal de comentario */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedAction?.title}
                </Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Comentario:</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe tu comentario aquí..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCloseModal}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // Espacio para el header completo
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Espacio para el bottom tab
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0E5FCE',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    color: '#0E5FCE',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionButtonDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
    opacity: 0.6,
  },
  iconContainerDisabled: {
    opacity: 0.5,
  },
  actionTextDisabled: {
    color: '#999999',
  },
  actionDescriptionDisabled: {
    color: '#999999',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0E5FCE',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TutorQuickActionsScreen;

