import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import CommonHeader from '../components/CommonHeader';
import { useAuth } from '../contexts/AuthContext';

const NotificationsScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recibidas');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  // Verificar si el usuario es coordinador
  const userRole = user?.role?.nombre?.toLowerCase();
  const isCoordinator = userRole === 'coordinator';
  // Debug: mostrar el rol actual en consola
  console.log('Usuario actual:', user?.nombre);
  console.log('Rol del usuario:', userRole);
  console.log('Es coordinador:', isCoordinator);

  const notifications = [
    {
      id: '1',
      title: 'Nuevo evento creado',
      message: 'Se ha creado un nuevo evento: Visita al ZOO',
      time: 'Hace 2 horas',
      read: false,
    },
    {
      id: '2',
      title: 'Recordatorio de actividad',
      message: 'No olvides completar la actividad de hoy',
      time: 'Hace 1 día',
      read: true,
    },
    {
      id: '3',
      title: 'Asociación aprobada',
      message: 'Tu asociación con la institución ha sido aprobada',
      time: 'Hace 3 días',
      read: true,
    },
  ];

  const handleSendNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Aquí iría la lógica para enviar la notificación
    Alert.alert('Éxito', 'Notificación enviada correctamente');
    setNewNotification({ title: '', message: '', target: 'all' });
  };

  const renderTabs = () => {
    if (!isCoordinator) {
      return null; // No mostrar pestañas si no es coordinador
    }

    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recibidas' && styles.activeTab]}
          onPress={() => setActiveTab('recibidas')}
        >
          <Text style={[styles.tabText, activeTab === 'recibidas' && styles.activeTabText]}>
            Recibidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'enviar' && styles.activeTab]}
          onPress={() => setActiveTab('enviar')}
        >
          <Text style={[styles.tabText, activeTab === 'enviar' && styles.activeTabText]}>
            Enviar
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSendNotificationForm = () => {
    if (!isCoordinator || activeTab !== 'enviar') {
      return null;
    }

    return (
      <View style={styles.sendFormContainer}>
        <Text style={styles.formTitle}>Enviar Nueva Notificación</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Título</Text>
          <TextInput
            style={styles.input}
            value={newNotification.title}
            onChangeText={(text) => setNewNotification({...newNotification, title: text})}
            placeholder="Ingresa el título de la notificación"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mensaje</Text>
          <TextInput
            style={styles.input}
            value={newNotification.message}
            onChangeText={(text) => setNewNotification({...newNotification, message: text})}
            placeholder="Ingresa el mensaje"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={handleSendNotification}>
          <Text style={styles.sendButtonText}>Enviar Notificación</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
              <CommonHeader onOpenNotifications={() => {}} activeStudent={null} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.debugText}>Usuario: {user?.nombre || 'No definido'}</Text>
          <Text style={styles.debugText}>Rol: {userRole || 'No definido'}</Text>
          <Text style={styles.debugText}>Es coordinador: {isCoordinator ? 'Sí' : 'No'}</Text>
        </View>

        {renderTabs()}

        {activeTab === 'recibidas' && (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
              >
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}

            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay notificaciones</Text>
              </View>
            )}
          </View>
        )}

        {renderSendNotificationForm()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  debugText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
  },
  notificationsContainer: {
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0E5FCE',
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  // Estilos para las pestañas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#0E5FCE',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  // Estilos para el formulario de envío
  sendFormContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
