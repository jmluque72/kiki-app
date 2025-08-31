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
const LockIcon = () => <Text style={{ fontSize: 64, color: '#0E5FCE' }}>🔒</Text>;
const EyeIcon = () => <Text style={{ fontSize: 20, color: '#666666' }}>👁️</Text>;
const EyeOffIcon = () => <Text style={{ fontSize: 20, color: '#666666' }}>🙈</Text>;
const CheckCircleIcon = ({ color }: { color: string }) => <Text style={{ fontSize: 16, color }}>✓</Text>;
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
      const response = await apiClient.post('/api/users/reset-password', {
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Contraseña</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LockIcon />
          </View>

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
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
            <View style={styles.requirementItem}>
              <CheckCircleIcon color={newPassword.length >= 6 ? '#4CAF50' : '#CCCCCC'} />
              <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementMet]}>
                Mínimo 6 caracteres
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <CheckCircleIcon color={newPassword === confirmPassword && confirmPassword.length > 0 ? '#4CAF50' : '#CCCCCC'} />
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 8,
  },
  requirementsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#0E5FCE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#B3D4F1',
  },
  resetButtonText: {
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

export default ResetPasswordScreen;
