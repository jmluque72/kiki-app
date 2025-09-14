import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';
import EventAuthorizationService from '../src/services/eventAuthorizationService';

interface EventAuthorizationButtonProps {
  eventId: string;
  eventTitle: string;
  requiereAutorizacion: boolean;
}

const EventAuthorizationButton: React.FC<EventAuthorizationButtonProps> = ({
  eventId,
  eventTitle,
  requiereAutorizacion,
}) => {
  const { user } = useAuth();
  const { getActiveStudent } = useInstitution();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorization, setAuthorization] = useState<any>(null);

  const activeStudent = getActiveStudent();

  // Verificar si el usuario puede autorizar (familyadmin con estudiante activo)
  const canAuthorize = user?.role?.nombre === 'familyadmin' && activeStudent && requiereAutorizacion;

  const checkAuthorization = async () => {
    if (!canAuthorize || !activeStudent) {
      setCheckingAuth(false);
      return;
    }

    setCheckingAuth(true);
    try {
      console.log('🔍 [AUTHORIZATION BUTTON] Verificando autorización:', { eventId, studentId: activeStudent._id });
      const response = await EventAuthorizationService.checkEventAuthorization(eventId, activeStudent._id);
      setAuthorization(response.authorization);
      console.log('🔍 [AUTHORIZATION BUTTON] Autorización encontrada:', response.authorization);
    } catch (error: any) {
      console.error('❌ [AUTHORIZATION BUTTON] Error verificando autorización:', error);
      setAuthorization(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthorization();
  }, [eventId, activeStudent?._id]);

  const handleAuthorize = () => {
    if (!activeStudent) return;

    const isCurrentlyAuthorized = authorization?.autorizado;
    const action = isCurrentlyAuthorized ? 'revocar' : 'autorizar';
    const actionText = isCurrentlyAuthorized ? 'Revocar autorización' : 'Autorizar participación';

    Alert.alert(
      actionText,
      `¿Estás seguro que deseas ${action} la participación de ${activeStudent.nombre} ${activeStudent.apellido} en el evento "${eventTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: actionText,
          style: isCurrentlyAuthorized ? 'destructive' : 'default',
          onPress: () => performAuthorization(!isCurrentlyAuthorized),
        },
      ]
    );
  };

  const performAuthorization = async (autorizado: boolean) => {
    if (!activeStudent) return;

    setLoading(true);
    try {
      console.log('✅ [AUTHORIZATION BUTTON] Autorizando:', { eventId, studentId: activeStudent._id, autorizado });
      const newAuth = await EventAuthorizationService.authorizeEvent(
        eventId,
        activeStudent._id,
        autorizado
      );
      setAuthorization(newAuth);
      console.log('✅ [AUTHORIZATION BUTTON] Autorización actualizada:', newAuth);
      
      Alert.alert(
        'Éxito',
        autorizado 
          ? 'Has autorizado la participación en el evento'
          : 'Has revocado la autorización para el evento'
      );
    } catch (error: any) {
      console.error('❌ [AUTHORIZATION BUTTON] Error autorizando:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al procesar la autorización'
      );
    } finally {
      setLoading(false);
    }
  };

  // No mostrar el botón si no puede autorizar
  if (!canAuthorize) {
    return null;
  }

  // Mostrar loading mientras verifica la autorización
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0E5FCE" />
        <Text style={styles.loadingText}>Verificando autorización...</Text>
      </View>
    );
  }

  const isAuthorized = authorization?.autorizado;
  const buttonText = isAuthorized ? 'Autorizado ✓' : 'Autorizar';
  const buttonStyle = isAuthorized ? styles.authorizedButton : styles.pendingButton;
  const textStyle = isAuthorized ? styles.authorizedText : styles.pendingText;

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handleAuthorize}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          {buttonText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  pendingButton: {
    backgroundColor: '#0E5FCE',
  },
  authorizedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#FFFFFF',
  },
  authorizedText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default EventAuthorizationButton;
