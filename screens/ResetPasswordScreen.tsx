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

interface ResetPasswordScreenProps {
  email: string;
  code: string;
  onBack: () => void;
  onPasswordReset: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ 
  email, 
  code, 
  onBack, 
  onPasswordReset 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  };

  const validateConfirmPassword = (confirm: string) => {
    if (confirm !== newPassword) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    setPasswordError('');
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError('');
  };

  const handleResetPassword = async () => {
    // Validar contraseña
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    // Validar confirmación
    const confirmValidation = validateConfirmPassword(confirmPassword);
    if (confirmValidation) {
      setConfirmPasswordError(confirmValidation);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/users/reset-password', {
        email,
        code,
        newPassword
      });

      if (response.data.success) {
        Alert.alert(
          '¡Contraseña Actualizada!',
          'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
          [
            {
              text: 'OK',
              onPress: onPasswordReset
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Error al actualizar la contraseña');
      }
    } catch (error: any) {
      console.error('Error reseteando contraseña:', error);
      
      if (error.response?.status === 400) {
        Alert.alert(
          'Código Inválido',
          'El código de verificación no es válido o ha expirado. Por favor, solicita un nuevo código.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Error al actualizar la contraseña'
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
          <Text style={styles.title}>Establece tu nueva contraseña</Text>
          
          <Text style={styles.description}>
            Crea una contraseña segura para tu cuenta. 
            Asegúrate de recordarla para futuros inicios de sesión.
          </Text>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor="#B3D4F1"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputLine} />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor="#B3D4F1"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputLine} />
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementIcon, newPassword.length >= 6 && styles.requirementMet]}>
                {newPassword.length >= 6 ? '✓' : '○'}
              </Text>
              <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementMet]}>
                Mínimo 6 caracteres
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementIcon, newPassword === confirmPassword && confirmPassword.length > 0 && styles.requirementMet]}>
                {newPassword === confirmPassword && confirmPassword.length > 0 ? '✓' : '○'}
              </Text>
              <Text style={[styles.requirementText, newPassword === confirmPassword && confirmPassword.length > 0 && styles.requirementMet]}>
                Las contraseñas coinciden
              </Text>
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetButton, 
              (loading || !newPassword || !confirmPassword || newPassword !== confirmPassword) && styles.resetButtonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.resetButtonText}>Actualizar Contraseña</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 Seguridad:</Text>
            <Text style={styles.infoText}>
              • Tu contraseña se actualiza de forma segura{'\n'}
              • El código de verificación se invalida automáticamente{'\n'}
              • Puedes iniciar sesión inmediatamente
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 0,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 20,
    color: '#B3D4F1',
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
  requirementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: fonts.bold,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    fontSize: 16,
    color: '#B3D4F1',
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#B3D4F1',
    fontFamily: fonts.regular,
  },
  requirementMet: {
    color: '#FF8C42',
    fontFamily: fonts.bold,
  },
  resetButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
  },
  infoTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.bold,
  },
  infoText: {
    fontSize: 14,
    color: '#B3D4F1',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});

export default ResetPasswordScreen;
