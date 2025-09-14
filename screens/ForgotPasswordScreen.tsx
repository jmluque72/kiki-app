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
  ActivityIndicator,
  Image
} from 'react-native';
import { fonts } from '../src/config/fonts';
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
      const response = await apiClient.post('/users/forgot-password', {
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/design/icons/kiki_login.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          
          <Text style={styles.description}>
            No te preocupes, te ayudaremos a recuperarla. 
            Ingresa tu email y te enviaremos un código de verificación.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#B3D4F1"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              selectionColor="#FFFFFF"
            />
            <View style={styles.inputLine} />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
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

          {/* Back Button */}
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver al Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E5FCE',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoImage: {
    width: 280,
    height: 220,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: fonts.bold,
  },
  description: {
    fontSize: 16,
    color: '#B3D4F1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 18,
    color: '#B3D4F1',
    marginBottom: 2,
    fontFamily: fonts.regular,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  inputLine: {
    height: 1,
    backgroundColor: '#B3D4F1',
    marginTop: 1,
  },
  errorText: {
    color: '#FF8C42',
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.regular,
  },
  sendButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
    marginHorizontal: 0,
    height: 50,
  },
  sendButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: fonts.regular,
  },
});

export default ForgotPasswordScreen;
