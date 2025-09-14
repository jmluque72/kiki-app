import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import EventAuthorizationService, { EventAuthorizationsResponse } from '../src/services/eventAuthorizationService';

interface EventAuthorizationModalProps {
  visible: boolean;
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

const EventAuthorizationModal: React.FC<EventAuthorizationModalProps> = ({
  visible,
  eventId,
  eventTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [authorizations, setAuthorizations] = useState<EventAuthorizationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAuthorizations = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📋 [AUTHORIZATION MODAL] Cargando autorizaciones para evento:', eventId);
      const data = await EventAuthorizationService.getEventAuthorizations(eventId);
      setAuthorizations(data);
      console.log('📋 [AUTHORIZATION MODAL] Autorizaciones cargadas:', data.summary);
    } catch (err: any) {
      console.error('❌ [AUTHORIZATION MODAL] Error:', err);
      setError(err.response?.data?.message || 'Error al cargar autorizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && eventId) {
      loadAuthorizations();
    }
  }, [visible, eventId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAuthorizationItem = (auth: any, isAuthorized: boolean) => (
    <View key={auth._id} style={styles.authorizationItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {auth.student.nombre} {auth.student.apellido}
        </Text>
        <Text style={styles.parentInfo}>
          Tutor: {auth.familyadmin.name} ({auth.familyadmin.email})
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          isAuthorized ? styles.authorizedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.statusText,
            isAuthorized ? styles.authorizedText : styles.pendingText
          ]}>
            {isAuthorized ? 'Autorizado' : 'Pendiente'}
          </Text>
        </View>
        {isAuthorized && auth.fechaAutorizacion && (
          <Text style={styles.dateText}>
            {formatDate(auth.fechaAutorizacion)}
          </Text>
        )}
        {auth.comentarios && (
          <Text style={styles.commentText}>
            "{auth.comentarios}"
          </Text>
        )}
      </View>
    </View>
  );

  const renderStudentWithoutAuth = (student: any) => (
    <View key={student._id} style={styles.authorizationItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {student.nombre} {student.apellido}
        </Text>
        <Text style={styles.parentInfo}>
          Sin autorización registrada
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Text style={[styles.statusText, styles.pendingText]}>
            Sin respuesta
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStudentPending = (student: any) => {
    let statusText = '';
    let statusStyle = styles.pendingBadge;
    let textStyle = styles.pendingText;
    let parentInfo = '';

    if (student.hasResponse) {
      if (student.autorizado) {
        statusText = 'Autorizado';
        statusStyle = styles.authorizedBadge;
        textStyle = styles.authorizedText;
        parentInfo = 'Autorizado por tutor';
      } else {
        statusText = 'Rechazado';
        statusStyle = styles.rejectedBadge;
        textStyle = styles.rejectedText;
        parentInfo = 'Rechazado por tutor';
      }
    } else {
      statusText = 'Pendiente';
      parentInfo = 'Sin respuesta del tutor';
    }

    return (
      <View key={student._id} style={styles.authorizationItem}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {student.nombre} {student.apellido}
          </Text>
          <Text style={styles.parentInfo}>
            {parentInfo}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={[styles.statusText, textStyle]}>
              {statusText}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Autorizaciones del Evento</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          {authorizations?.event && (
            <Text style={styles.eventDetails}>
              {new Date(authorizations.event.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} - {authorizations.event.hora}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E5FCE" />
            <Text style={styles.loadingText}>Cargando autorizaciones...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadAuthorizations} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : authorizations ? (
          <ScrollView style={styles.content}>
            {/* Resumen */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{authorizations.summary.autorizados}</Text>
                  <Text style={styles.statLabel}>Autorizados</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{authorizations.summary.pendientes}</Text>
                  <Text style={styles.statLabel}>Pendientes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{authorizations.summary.rechazados}</Text>
                  <Text style={styles.statLabel}>Rechazados</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{authorizations.summary.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>

            {/* Lista completa de estudiantes de la división */}
            {authorizations.allStudentsPending && authorizations.allStudentsPending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estudiantes de la División</Text>
                {authorizations.allStudentsPending.map(student => 
                  renderStudentPending(student)
                )}
              </View>
            )}

            {/* Sección de respuestas detalladas (opcional, para referencia) */}
            {authorizations.authorizations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalles de Autorizaciones</Text>
                {authorizations.authorizations.map(auth => 
                  renderAuthorizationItem(auth, auth.autorizado)
                )}
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  eventInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventDetails: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  authorizationItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  parentInfo: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 5,
  },
  authorizedBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  authorizedText: {
    color: '#4CAF50',
  },
  pendingText: {
    color: '#FF9800',
  },
  rejectedText: {
    color: '#F44336',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    maxWidth: 150,
  },
});

export default EventAuthorizationModal;
