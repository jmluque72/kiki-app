import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import { useNotifications } from '../src/hooks/useNotifications';
import { NotificationService } from '../src/services/notificationService';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useLoading } from '../contexts/LoadingContext';
import { useStudents } from '../src/hooks/useStudents';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import { fonts } from '../src/config/fonts';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onShowSuccess?: (message: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible, onClose, onShowSuccess }) => {
  // Verificar si el usuario es coordinador usando la asociación activa
  const { activeAssociation } = useAuth();
  const isCoordinador = activeAssociation?.role?.nombre === 'coordinador';
  
  // Para coordinadores, iniciar en la pestaña "enviar"
  const [activeTab, setActiveTab] = useState<'received' | 'send'>(isCoordinador ? 'send' : 'received');
  const [showSendForm, setShowSendForm] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'coordinador' as string, // Tipo específico para coordinadores
    recipients: [] as string[]
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotificationDetails, setSelectedNotificationDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const { notifications, recipients, loading, markAsRead, deleteNotification, sendNotification, loadRecipients, loadNotifications } = useNotifications();
  const { selectedInstitution } = useInstitution();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showError } = useCustomAlert();
  
  // Log de notificaciones en el componente
  useEffect(() => {
    console.log('📱 NotificationCenter - Notificaciones actualizadas:', notifications);
    console.log('📱 NotificationCenter - Cantidad:', notifications?.length || 0);
  }, [notifications]);
  
  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  const isFamilyViewer = activeAssociation?.role?.nombre === 'familyviewer';
  
  // Debug temporal para verificar el rol
  console.log('NotificationCenter - Usuario:', user?.name);
  console.log('NotificationCenter - Rol del usuario:', user?.role?.nombre);
  console.log('NotificationCenter - Asociación activa:', activeAssociation ? {
    account: activeAssociation.account?.nombre,
    role: activeAssociation.role?.nombre,
    division: activeAssociation.division?.nombre
  } : null);
  console.log('NotificationCenter - Es coordinador:', isCoordinador);
  
  // Cuando se abre el modal y el usuario es coordinador, ir automáticamente a la pestaña "enviar"
  useEffect(() => {
    if (visible && isCoordinador) {
      setActiveTab('send');
    }
  }, [visible, isCoordinador]);
  
  // Hook para obtener estudiantes
  const { students, loading: studentsLoading } = useStudents(
    selectedInstitution?.account._id,
    selectedInstitution?.division?._id
  );

  // Estado para manejar la selección de alumnos
  const [selectedStudents, setSelectedStudents] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (visible && selectedInstitution) {
      if (selectedInstitution.account?._id) {
        loadRecipients(selectedInstitution.account._id, selectedInstitution.division?._id);
      }
      // Recargar notificaciones cuando cambie la institución
      loadNotifications();
    }
  }, [visible, selectedInstitution, loadNotifications]);

  // Si el usuario no es coordinador y está en la pestaña "send", redirigir a "received"
  useEffect(() => {
    if (!isCoordinador && activeTab === 'send') {
      setActiveTab('received');
    }
  }, [isCoordinador, activeTab]);

  const handleClose = () => {
    onClose();
  };

  // Asegurar que el popup se cierre cuando el modal se cierre
  useEffect(() => {
    if (!visible) {
      // hideSuccessPopup(); // This line is removed as per the new_code
    }
  }, [visible]); // Removed hideSuccessPopup from dependency array

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      // Marcar como leída si no está leída
      if (!isNotificationRead(notification)) {
        await markAsRead(notification._id);
      }
      
      // Para tutores (familyadmin/familyviewer): mostrar popup simple
      // Para coordinadores: mostrar popup con detalles completos
      if (isCoordinador) {
        // Coordinadores ven detalles completos con estadísticas
        setSelectedNotificationDetails(notification);
        setShowDetailsModal(true);
      } else {
        // Tutores ven popup simple sin datos de lecturas
        setSelectedNotificationDetails(notification);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error: any) {
      console.log('Error al eliminar la notificación:', error.message || 'Error al eliminar la notificación');
    }
  };

  const handleShowDetails = async (notificationId: string) => {
    try {
      setLoadingDetails(true);
      const details = await NotificationService.getNotificationDetails(notificationId);
      setSelectedNotificationDetails(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.log('Error al cargar detalles de la notificación:', error.message || 'Error al cargar detalles de la notificación');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Función para verificar si una notificación está leída
  const isNotificationRead = (notification: any) => {
    return notification.status === 'read' || 
           notification.readBy?.some((read: any) => read.user === user?._id);
  };

  // Función para seleccionar/deseleccionar un alumno
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Función para seleccionar/deseleccionar todos los alumnos
  const toggleAllStudents = () => {
    const allSelected = students.length > 0 && students.every(student => selectedStudents[student._id]);
    
    if (allSelected) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedStudents({});
    } else {
      // Si no todos están seleccionados, seleccionar todos
      const newSelection: { [key: string]: boolean } = {};
      students.forEach(student => {
        newSelection[student._id] = true;
      });
      setSelectedStudents(newSelection);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }
    
    if (formData.title.length > 100) {
      showError('Error', 'El título no puede exceder 100 caracteres');
      return;
    }
    
    if (formData.message.length > 256) {
      showError('Error', 'El mensaje no puede exceder 256 caracteres');
      return;
    }
    
    if (!formData.title.trim() || !formData.message.trim()) {
      console.log('Error: Por favor completa todos los campos');
      return;
    }

    if (!selectedInstitution) {
      console.log('Error: No hay institución seleccionada');
      return;
    }

    // Validar que la institución tenga account
    if (!selectedInstitution.account || !selectedInstitution.account._id) {
      console.log('Error: La institución no tiene cuenta válida');
      return;
    }

    // Obtener IDs de alumnos seleccionados
    const selectedStudentIds = Object.keys(selectedStudents).filter(id => selectedStudents[id]);

    if (selectedStudentIds.length === 0) {
      console.log('Error: Por favor selecciona al menos un alumno');
      return;
    }

    try {
      setSendingNotification(true);
      showLoading('Enviando notificación...');
      
      await sendNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        accountId: selectedInstitution.account._id,
        divisionId: selectedInstitution.division?._id || undefined,
        recipients: selectedStudentIds
      });

      hideLoading();
      
      // Mostrar popup de éxito
      onShowSuccess?.('Notificación enviada exitosamente');
      
      // Esperar un momento para que se vea el popup y luego cerrar el modal
      setTimeout(() => {
        // Resetear formulario
        setFormData({
          title: '',
          message: '',
          type: 'coordinador',
          recipients: []
        });
        setSelectedStudents({});
        setShowSendForm(false);
        setSendingNotification(false);
        
        // Cerrar el modal del centro de notificaciones
        onClose();
      }, 2000); // 2 segundos para que se vea el popup completo
      
    } catch (error: any) {
      hideLoading();
      setSendingNotification(false);
      console.log('Error al enviar notificación:', error.message || 'Error al enviar notificación');
      showError('Error', error.message || 'Error al enviar notificación');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coordinador': return '#0E5FCE';
      case 'institucion': return '#4A90E2';
      default: return '#4A90E2';
    }
  };

  // Iconos para tipos de notificación
  const notificationIcons: { [key: string]: any } = {
    coordinador: require('../assets/design/icons/kiki_notificaciones.png'),
    institucion: require('../assets/design/icons/kiki_notificaciones.png')
  };
  
  // Filtrar notificaciones para mostrar solo coordinador e institucion
  const filteredNotifications = (notifications || []).filter((notification: any) => {
    if (!notification || !notification.type) return false;
    const type = notification.type.toLowerCase();
    return type === 'coordinador' || type === 'institucion';
  });

  const getTypeIcon = (type: string) => {
    return notificationIcons[type] || notificationIcons.coordinador;
  };

  const renderNotification = ({ item }: { item: any }) => {
    // Validar que el item sea válido
    if (!item || !item._id) {
      return null;
    }
    
    const isRead = isNotificationRead(item);
    
    // Validar propiedades requeridas
    const notificationTitle = item.title || 'Sin título';
    const notificationType = item.type || 'coordinador';
    // El sender puede tener 'name' (User) o 'nombre' (si viene del servidor transformado)
    const senderName = item.sender?.name || item.sender?.nombre || 'Desconocido';
    
    // Obtener nombre del estudiante si es familyadmin o familyviewer
    let studentName = null;
    if ((isFamilyAdmin || isFamilyViewer) && item.recipients && item.recipients.length > 0) {
      // El servidor ya combina nombre y apellido en el campo 'nombre' para estudiantes
      // Buscar el primer recipient que tenga nombre (puede ser estudiante o usuario)
      const studentRecipient = item.recipients.find((recipient: any) => 
        recipient.nombre && !recipient.name // Si tiene 'nombre' pero no 'name', es estudiante
      );
      if (studentRecipient && studentRecipient.nombre) {
        studentName = studentRecipient.nombre;
      } else {
        // Si no encontramos uno con 'nombre', buscar cualquier recipient con nombre
        const anyRecipient = item.recipients.find((recipient: any) => recipient.nombre);
        if (anyRecipient) {
          studentName = anyRecipient.nombre;
        }
      }
    }
    
    return (
      <View style={[
        styles.notificationItem,
        isRead && styles.notificationRead
      ]}>
        {/* Indicador de estado de lectura */}
        <View style={[
          styles.readStatusIndicator,
          isRead ? styles.readIndicator : styles.unreadIndicator
        ]} />
        
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationClick(item)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationHeader}>
            <Image
              source={getTypeIcon(notificationType)}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
            <View style={styles.notificationInfo}>
              <Text style={[
                styles.notificationTitle,
                !isRead && styles.notificationTitleUnread
              ]}>
                {notificationTitle}
              </Text>
              <Text style={styles.notificationSender}>
                {senderName}
              </Text>
              {studentName && (
                <Text style={styles.studentName}>
                  Hijo: {studentName}
                </Text>
              )}
            </View>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(notificationType) }]}>
              <Text style={styles.typeText}>{notificationType.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={[
            styles.notificationMessage,
            !isRead && styles.notificationMessageUnread
          ]}>
            {item.message}
          </Text>
          
          <Text style={styles.notificationDate}>
            {new Date(item.sentAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </TouchableOpacity>
        
        {/* Botones para coordinadores */}
        {isCoordinador && (
          <View style={styles.coordinatorButtonsContainer}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => handleShowDetails(item._id)}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(item._id)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSendForm = () => (
    <ScrollView 
      style={styles.sendFormContainer}
      contentContainerStyle={styles.sendFormContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.formTitle}>Enviar Nueva Notificación</Text>
      

      {/* Título */}
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Título:</Text>
          <Text style={styles.characterCount}>
            {formData.title.length}/100
          </Text>
        </View>
        <TextInput
          style={styles.textInput}
          value={formData.title}
          onChangeText={(text) => {
            if (text.length <= 100) {
              setFormData(prev => ({ ...prev, title: text }));
            }
          }}
          placeholder="Ingresa el título de la notificación"
          placeholderTextColor="#999"
          maxLength={100}
        />
      </View>

      {/* Mensaje */}
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Mensaje:</Text>
          <Text style={[
            styles.characterCount,
            formData.message.length > 256 && styles.characterCountError
          ]}>
            {formData.message.length}/256
          </Text>
        </View>
        <TextInput
          style={[styles.textInput, styles.messageInput]}
          value={formData.message}
          onChangeText={(text) => {
            if (text.length <= 256) {
              setFormData(prev => ({ ...prev, message: text }));
            }
          }}
          placeholder="Ingresa el mensaje de la notificación"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          maxLength={256}
        />
      </View>

      {/* Selección de alumnos */}
      <View style={styles.studentsSection}>
        <View style={styles.studentsHeader}>
          <Text style={styles.label}>Alumnos destinatarios:</Text>
          <TouchableOpacity onPress={toggleAllStudents} style={styles.selectAllButton}>
            <Text style={styles.selectAllButtonText}>
              {students.length > 0 && students.every(student => selectedStudents[student._id]) 
                ? 'Deseleccionar todos' 
                : 'Seleccionar todos'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {studentsLoading ? (
          <Text style={styles.loadingText}>Cargando alumnos...</Text>
        ) : students.length === 0 ? (
          <Text style={styles.noStudentsText}>No hay alumnos disponibles</Text>
        ) : (
          <View style={styles.studentsGrid}>
            {students.map((student) => (
              <TouchableOpacity
                key={student._id}
                style={styles.studentItem}
                onPress={() => toggleStudentSelection(student._id)}
                activeOpacity={0.7}
              >
                <View style={styles.studentAvatar}>
                  {student.avatar ? (
                    <Image 
                      source={{ uri: student.avatar }} 
                      style={styles.studentAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.studentIcon}>👤</Text>
                  )}
                  {selectedStudents[student._id] && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.studentNombre}>{student.nombre}</Text>
                <Text style={styles.studentApellido}>{student.apellido}</Text>
                <Text style={styles.studentDivision}>{student.division?.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Botón de enviar */}
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            sendingNotification && styles.sendButtonDisabled
          ]}
          onPress={handleSendNotification}
          disabled={sendingNotification}
          activeOpacity={sendingNotification ? 1 : 0.7}
        >
          <Text style={styles.sendButtonText}>
            {sendingNotification ? 'Enviando...' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Centro de Notificaciones</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs - Solo para coordinadores */}
        {isCoordinador && (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'received' && styles.activeTab]}
              onPress={() => setActiveTab('received')}
            >
              <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
                Enviadas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'send' && styles.activeTab]}
              onPress={() => {
                setActiveTab('send');
                setShowSendForm(true);
              }}
            >
              <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
                Enviar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {!isCoordinador ? (
            // Para tutores: siempre mostrar lista de notificaciones recibidas
            <View style={styles.receivedContainer}>
              {loading ? (
                <Text style={styles.loadingText}>Cargando notificaciones...</Text>
              ) : filteredNotifications.length === 0 ? (
                <Text style={styles.noNotificationsText}>No hay notificaciones recibidas</Text>
              ) : (
                <FlatList
                  data={filteredNotifications}
                  renderItem={renderNotification}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          ) : (
            // Para coordinadores: mostrar según la pestaña activa
            activeTab === 'received' ? (
              <View style={styles.receivedContainer}>
                {loading ? (
                  <Text style={styles.loadingText}>Cargando notificaciones...</Text>
                ) : filteredNotifications.length === 0 ? (
                  <Text style={styles.noNotificationsText}>No hay notificaciones recibidas</Text>
                ) : (
                  <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            ) : (
              <View style={styles.sendContainer}>
                {renderSendForm()}
              </View>
            )
          )}
        </View>
      </View>

      {/* Success Popup */}
      {/* SuccessPopup component is no longer used, so this block is removed */}
      
      {/* Modal de detalles de notificación */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsModalHeader}>
            <Text style={styles.detailsModalTitle}>Detalles de la Notificación</Text>
            <TouchableOpacity
              style={styles.detailsModalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.detailsModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.detailsModalContent}>
            {loadingDetails ? (
              <Text style={styles.loadingText}>Cargando detalles...</Text>
            ) : selectedNotificationDetails ? (
              <View>
                {/* Información básica - visible para todos */}
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Información de la Notificación</Text>
                  
                  {/* Header con icono y tipo */}
                  <View style={styles.notificationHeaderDetails}>
                    <Image
                      source={getTypeIcon(selectedNotificationDetails.type)}
                      style={styles.notificationIconDetails}
                      resizeMode="contain"
                    />
                    <View style={styles.notificationHeaderInfo}>
                      <Text style={styles.notificationTitleDetails}>{selectedNotificationDetails.title}</Text>
                      <View style={[styles.typeBadgeDetails, { backgroundColor: getTypeColor(selectedNotificationDetails.type) }]}>
                        <Text style={styles.typeTextDetails}>{selectedNotificationDetails.type.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Mensaje principal */}
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Mensaje:</Text>
                    <Text style={styles.messageText}>{selectedNotificationDetails.message}</Text>
                  </View>
                  
                  {/* Información del remitente y fecha */}
                  <View style={styles.metaInfoContainer}>
                    <View style={styles.metaInfoItem}>
                      <Text style={styles.metaInfoLabel}>Enviado por:</Text>
                      <Text style={styles.metaInfoValue}>{selectedNotificationDetails.sender?.nombre}</Text>
                    </View>
                    <View style={styles.metaInfoItem}>
                      <Text style={styles.metaInfoLabel}>Fecha:</Text>
                      <Text style={styles.metaInfoValue}>
                        {new Date(selectedNotificationDetails.sentAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Solo coordinadores ven estadísticas de lectura */}
                {isCoordinador && (
                  <>
                    {/* Estadísticas de lectura */}
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsSectionTitle}>Estadísticas de Lectura</Text>
                      <View style={styles.readStatsContainer}>
                        <View style={styles.readStatItem}>
                          <Text style={styles.readStatLabel}>Total destinatarios:</Text>
                          <Text style={styles.readStatValue}>{selectedNotificationDetails.stats?.totalRecipients || selectedNotificationDetails.recipients?.length || 0}</Text>
                        </View>
                        <View style={styles.readStatItem}>
                          <Text style={[styles.readStatLabel, { color: '#4CAF50' }]}>Leídas por padres:</Text>
                          <Text style={[styles.readStatValue, { color: '#4CAF50' }]}>{selectedNotificationDetails.stats?.readByParents || 0}</Text>
                        </View>
                        <View style={styles.readStatItem}>
                          <Text style={[styles.readStatLabel, { color: '#FF5722' }]}>Pendientes:</Text>
                          <Text style={[styles.readStatValue, { color: '#FF5722' }]}>
                            {selectedNotificationDetails.stats?.pendingRecipients || 0}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Lista de destinatarios que leyeron (solo padres) */}
                    {selectedNotificationDetails.readBy && selectedNotificationDetails.readBy.length > 0 && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSectionTitle}>Leída por padres:</Text>
                        <View style={styles.readByList}>
                          {selectedNotificationDetails.readBy
                            .filter((read: any) => {
                              if (!read?.user) return false;
                              // Excluir coordinadores
                              if (read.user?.role?.nombre === 'coordinador') return false;
                              // Excluir el creador/sender de la notificación
                              if (read.user?._id === selectedNotificationDetails.sender?._id) return false;
                              // Solo incluir tutores (familyadmin y familyviewer)
                              return read.user?.role?.nombre === 'familyadmin' || read.user?.role?.nombre === 'familyviewer';
                            })
                            .map((read: any, index: number) => (
                              <View key={index} style={styles.readByItem}>
                                <Text style={styles.readByUser}>
                                  {read.user?.nombre || 'Usuario desconocido'}
                                </Text>
                                <Text style={styles.readByDate}>
                                  {new Date(read.readAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    )}

                    {/* Lista de destinatarios pendientes (estudiantes cuyos padres no leyeron) */}
                    {selectedNotificationDetails.pendingRecipients && selectedNotificationDetails.pendingRecipients.length > 0 && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSectionTitle}>Pendiente de lectura:</Text>
                        <View style={styles.unreadByList}>
                          {selectedNotificationDetails.pendingRecipients.map((recipient: any, index: number) => (
                            <View key={index} style={styles.unreadByItem}>
                              <View style={styles.pendingStudentInfo}>
                                <Text style={styles.pendingStudentName}>
                                  {recipient.nombre || recipient.name || 'Usuario desconocido'}
                                </Text>
                                {recipient.tutor && (
                                  <Text style={styles.pendingTutorInfo}>
                                    Tutor: {recipient.tutor.name} ({recipient.tutor.email})
                                  </Text>
                                )}
                                {!recipient.tutor && (
                                  <Text style={styles.pendingNoTutorInfo}>
                                    Sin tutor asignado
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* Para tutores: mensaje simple de confirmación */}
                {!isCoordinador && (
                  <View style={styles.detailsSection}>
                    <View style={styles.simpleConfirmationContainer}>
                      <Text style={styles.simpleConfirmationText}>
                        ✅ Notificación leída correctamente
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 50,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0E5FCE',
  },
  headerTitle: {
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
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0E5FCE',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 0, // Sin padding superior cuando no hay pestañas
  },
  receivedContainer: {
    flex: 1,
    padding: 15,
  },
  sendContainer: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationContent: {
    padding: 15,
  },
  notificationRead: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: '#E9ECEF',
  },

  readStatusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 1,
  },
  unreadIndicator: {
    backgroundColor: '#0E5FCE',
  },
  readIndicator: {
    backgroundColor: '#E9ECEF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#666666',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  notificationTitleUnread: {
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  notificationSender: {
    fontSize: 12,
    color: '#666666',
  },
  studentName: {
    fontSize: 12,
    color: '#0E5FCE',
    fontWeight: '600',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMessageUnread: {
    fontWeight: '500',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999999',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 50,
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 50,
  },
  sendFormContainer: {
    flex: 1,
  },
  sendFormContent: {
    padding: 15,
    paddingBottom: 50,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'normal',
  },
  characterCountError: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  studentsSection: {
    marginBottom: 40,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectAllButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#0E5FCE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  selectAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noStudentsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  studentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  studentItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  studentIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  studentAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  checkMark: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  studentNombre: {
    fontSize: 10,
    color: '#0E5FCE',
    textAlign: 'center',
    fontWeight: '500',
  },
  studentApellido: {
    fontSize: 10,
    color: '#0E5FCE',
    textAlign: 'center',
    fontWeight: '500',
  },
  studentDivision: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    marginTop: 1,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 30,
  },
  sendButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
    shadowColor: '#0E5FCE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteButtonContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Estilos para información adicional de coordinadores
  coordinatorInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  readStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  readStatItem: {
    alignItems: 'center',
  },
  readStatLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  readStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  readByContainer: {
    marginBottom: 15,
  },
  readByTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  readByList: {
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    padding: 10,
  },
  readByItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E8',
  },
  readByUser: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  readByDate: {
    fontSize: 11,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  unreadByContainer: {
    marginBottom: 10,
  },
  unreadByTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 8,
  },
  unreadByList: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 10,
  },
  unreadByItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  unreadByUser: {
    fontSize: 13,
    color: '#D84315',
    fontWeight: '500',
  },
  pendingStudentInfo: {
    flex: 1,
  },
  pendingStudentName: {
    fontSize: 14,
    color: '#D84315',
    fontWeight: '600',
    marginBottom: 4,
  },
  pendingTutorInfo: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  pendingNoTutorInfo: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  // Estilos para botones de coordinadores
  coordinatorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#0E5FCE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Estilos para el modal de detalles
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsModalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModalCloseText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  detailsModalContent: {
    flex: 1,
    padding: 20,
  },
  detailsSection: {
    marginBottom: 25,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#0E5FCE',
    paddingBottom: 5,
  },
  detailsItem: {
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 20,
  },
  // Estilos para el nuevo diseño del modal de detalles
  notificationHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  notificationIconDetails: {
    width: 32,
    height: 32,
    marginRight: 15,
    tintColor: '#0E5FCE',
  },
  notificationHeaderInfo: {
    flex: 1,
  },
  notificationTitleDetails: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 24,
  },
  typeBadgeDetails: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  typeTextDetails: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  metaInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaInfoItem: {
    flex: 1,
    marginRight: 10,
  },
  metaInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  metaInfoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  // Estilos para confirmación simple de tutores
  simpleConfirmationContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  simpleConfirmationText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationCenter; 