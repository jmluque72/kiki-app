import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
// Iconos simples usando texto
const ArrowLeftIcon = () => <Text style={{ fontSize: 24, color: '#0E5FCE' }}>←</Text>;
const MailIcon = () => <Text style={{ fontSize: 64, color: '#0E5FCE' }}>📧</Text>;
const AlertCircleIcon = () => <Text style={{ fontSize: 16, color: '#FF4444' }}>⚠️</Text>;
import { apiClient } from '../src/services/api';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onCodeSent: (email: string) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBack, onCodeSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    // Validar email
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Ingresa un email válido');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/users/forgot-password', {
        email: email.trim().toLowerCase()
      });

      if (response.data.success) {
        Alert.alert(
          'Código Enviado',
          'Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada.',
          [
            {
              text: 'OK',
              onPress: () => onCodeSent(email.trim().toLowerCase())
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Error al enviar el código');
      }
    } catch (error: any) {
      console.error('Error en forgot password:', error);
      
      if (error.response?.status === 404) {
        Alert.alert(
          'Usuario no encontrado',
          'No existe una cuenta con ese email. Verifica el email o regístrate.',
          [
            { text: 'Registrarse', onPress: onBack },
            { text: 'Intentar de nuevo', style: 'cancel' }
          ]
        );
      } else if (error.response?.status === 500) {
        Alert.alert(
          'Error del servidor',
          'No se pudo enviar el email. Por favor, intenta nuevamente más tarde.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Error al enviar el código de recuperación'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MailIcon />
          </View>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          
          <Text style={styles.description}>
            No te preocupes, te ayudaremos a recuperarla. 
            Ingresa tu email y te enviaremos un código de verificación.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="tu@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {emailError ? (
              <View style={styles.errorContainer}>
                <AlertCircleIcon />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            ) : null}
          </View>

          {/* Send Code Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar Código</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Información importante:</Text>
            <Text style={styles.infoText}>
              • El código expira en 10 minutos{'\n'}
              • Revisa tu carpeta de spam{'\n'}
              • Si no recibes el código, intenta nuevamente
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginLeft: 6,
  },
  sendButton: {
    backgroundColor: '#0E5FCE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#B3D4F1',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
