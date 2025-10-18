import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { fonts } from '../src/config/fonts';

interface PushNotificationSettingsProps {
  onClose?: () => void;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ onClose }) => {
  const {
    isEnabled,
    token,
    loading,
    error,
    requestPermissions,
    sendTestNotification,
    openSettings,
  } = usePushNotifications();

  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      // Si están habilitadas, abrir configuración del sistema
      openSettings();
    } else {
      // Si no están habilitadas, solicitar permisos
      setIsRequestingPermissions(true);
      try {
        const granted = await requestPermissions();
        if (!granted) {
          console.log('Permisos Denegados: Para recibir notificaciones push, necesitas habilitar los permisos en la configuración de la app.');
        }
      } catch (error) {
        console.log('Error: No se pudieron solicitar los permisos para notificaciones.');
      } finally {
        setIsRequestingPermissions(false);
      }
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
  };

  const getStatusText = () => {
    if (loading || isRequestingPermissions) {
      return 'Verificando...';
    }
    if (error) {
      return 'Error en configuración';
    }
    if (isEnabled) {
      return 'Habilitadas';
    }
    return 'Deshabilitadas';
  };

  const getStatusColor = () => {
    if (loading || isRequestingPermissions) {
      return '#FFA500';
    }
    if (error) {
      return '#FF0000';
    }
    if (isEnabled) {
      return '#00AA00';
    }
    return '#666666';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones Push</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Estado actual */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {(loading || isRequestingPermissions) && (
              <ActivityIndicator size="small" color="#0E5FCE" style={styles.loadingIndicator} />
            )}
          </View>
        </View>

        {/* Token del dispositivo (solo para debug) */}
        {__DEV__ && token && (
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Token del dispositivo:</Text>
            <Text style={styles.tokenText} numberOfLines={3}>
              {token}
            </Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={handleToggleNotifications}
            disabled={loading || isRequestingPermissions}
          >
            <Text style={styles.actionButtonText}>
              {isEnabled ? 'Abrir Configuración' : 'Habilitar Notificaciones'}
            </Text>
          </TouchableOpacity>

          {isEnabled && (
            <TouchableOpacity
              style={[styles.actionButton, styles.testButton]}
              onPress={handleTestNotification}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Enviar Notificación de Prueba</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>¿Qué son las notificaciones push?</Text>
          <Text style={styles.infoText}>
            Las notificaciones push te permiten recibir actualizaciones importantes sobre tu hijo/a, 
            como nuevas actividades, eventos o comunicaciones de la institución, incluso cuando no 
            tengas la app abierta.
          </Text>
        </View>
      </View>
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
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    flex: 1,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  tokenContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#666666',
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#333333',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#D32F2F',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#0E5FCE',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#666666',
    lineHeight: 20,
  },
});

export default PushNotificationSettings;
