import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { fonts } from '../src/config/fonts';

interface PushNotificationPreferencesProps {
  onClose?: () => void;
}

interface NotificationPreferences {
  attendanceReminders: boolean;
  eventNotifications: boolean;
  generalNotifications: boolean;
  pickupNotifications: boolean;
}

const PushNotificationPreferences: React.FC<PushNotificationPreferencesProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { isEnabled, requestPermissions, sendTestNotification } = usePushNotifications();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    attendanceReminders: true,
    eventNotifications: true,
    generalNotifications: true,
    pickupNotifications: true,
  });
  
  const [loading, setLoading] = useState(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Aquí deberías cargar las preferencias desde el servidor o AsyncStorage
      // Por ahora usamos valores por defecto
      console.log('🔔 Cargando preferencias de notificaciones...');
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setLoading(true);
      
      // Aquí deberías guardar las preferencias en el servidor
      // await NotificationService.updatePreferences(user._id, newPreferences);
      
      console.log('🔔 Guardando preferencias:', newPreferences);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Éxito', 'Preferencias guardadas correctamente');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    if (!isEnabled) {
      Alert.alert(
        'Notificaciones Deshabilitadas',
        'Primero debes habilitar las notificaciones push para configurar las preferencias.',
        [
          { text: 'Habilitar', onPress: requestPermissions },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const handleTestNotification = () => {
    if (!isEnabled) {
      Alert.alert(
        'Notificaciones Deshabilitadas',
        'Primero debes habilitar las notificaciones push para enviar notificaciones de prueba.',
        [
          { text: 'Habilitar', onPress: requestPermissions },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    sendTestNotification();
  };

  const getRoleSpecificOptions = () => {
    const role = user?.role?.nombre;
    
    switch (role) {
      case 'coordinador':
        return [
          {
            key: 'attendanceReminders' as keyof NotificationPreferences,
            title: 'Recordatorios de Asistencia',
            description: 'Recibir notificaciones cuando los padres no han marcado asistencia',
            icon: '📋'
          },
          {
            key: 'eventNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones de Eventos',
            description: 'Recibir notificaciones sobre nuevos eventos o cambios',
            icon: '📅'
          },
          {
            key: 'generalNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones Generales',
            description: 'Recibir notificaciones generales de la institución',
            icon: '📢'
          }
        ];
        
      case 'familyadmin':
      case 'familyviewer':
        return [
          {
            key: 'attendanceReminders' as keyof NotificationPreferences,
            title: 'Recordatorios de Asistencia',
            description: 'Recibir recordatorios para marcar la asistencia de tu hijo/a',
            icon: '📋'
          },
          {
            key: 'pickupNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones de Retiro',
            description: 'Recibir notificaciones sobre quién retira a tu hijo/a',
            icon: '🚗'
          },
          {
            key: 'eventNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones de Eventos',
            description: 'Recibir notificaciones sobre eventos escolares',
            icon: '📅'
          },
          {
            key: 'generalNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones Generales',
            description: 'Recibir notificaciones generales de la institución',
            icon: '📢'
          }
        ];
        
      default:
        return [
          {
            key: 'generalNotifications' as keyof NotificationPreferences,
            title: 'Notificaciones Generales',
            description: 'Recibir notificaciones generales',
            icon: '📢'
          }
        ];
    }
  };

  const roleOptions = getRoleSpecificOptions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración de Notificaciones</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado de las notificaciones */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: isEnabled ? '#4CAF50' : '#FF5722' }]} />
            <Text style={styles.statusText}>
              Notificaciones Push: {isEnabled ? 'Habilitadas' : 'Deshabilitadas'}
            </Text>
          </View>
          {!isEnabled && (
            <TouchableOpacity style={styles.enableButton} onPress={requestPermissions}>
              <Text style={styles.enableButtonText}>Habilitar Notificaciones</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Preferencias por rol */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.sectionTitle}>
            Preferencias para {user?.role?.nombre === 'coordinador' ? 'Coordinadores' : 'Familiares'}
          </Text>
          
          {roleOptions.map((option) => (
            <View key={option.key} style={styles.preferenceItem}>
              <View style={styles.preferenceContent}>
                <View style={styles.preferenceHeader}>
                  <Text style={styles.preferenceIcon}>{option.icon}</Text>
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>{option.title}</Text>
                    <Text style={styles.preferenceDescription}>{option.description}</Text>
                  </View>
                </View>
                <Switch
                  value={preferences[option.key]}
                  onValueChange={() => handleTogglePreference(option.key)}
                  disabled={!isEnabled || loading}
                  trackColor={{ false: '#E0E0E0', true: '#0E5FCE' }}
                  thumbColor={preferences[option.key] ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Botón de prueba */}
        {isEnabled && (
          <View style={styles.testContainer}>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={handleTestNotification}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>Enviar Notificación de Prueba</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>💡 Información</Text>
          <Text style={styles.infoText}>
            • Las notificaciones push te permiten recibir actualizaciones importantes incluso cuando no tengas la app abierta{'\n'}
            • Puedes cambiar estas preferencias en cualquier momento{'\n'}
            • Si deshabilitas las notificaciones, no recibirás ningún tipo de notificación push
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#333333',
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
    color: '#666666',
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
    flex: 1,
  },
  enableButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  preferencesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#333333',
    marginBottom: 15,
  },
  preferenceItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  preferenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666666',
    lineHeight: 18,
  },
  testContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#1976D2',
    lineHeight: 20,
  },
});

export default PushNotificationPreferences;
