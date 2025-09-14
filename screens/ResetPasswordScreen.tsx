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
import Svg, { Path, Circle } from 'react-native-svg';
import { toastService } from '../src/services/toastService';
import { fonts } from '../src/config/fonts';
import { apiClient } from '../src/services/api';

// Componente de icono de ojo
const EyeIcon = ({ size = 20, isVisible = false }: { size?: number; isVisible?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4C16.418 4 20.418 6.586 22 11C20.418 15.414 16.418 18 12 18C7.582 18 3.582 15.414 2 11C3.582 6.586 7.582 4 12 4Z"
      stroke={isVisible ? "#9CA3AF" : "#FFFFFF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="11"
      r="3"
      stroke={isVisible ? "#9CA3AF" : "#FFFFFF"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
        toastService.error(
          'Código Inválido',
          'El código de verificación no es válido o ha expirado. Serás redirigido al inicio.'
        );
        // Redirigir al inicio después de mostrar el toast
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        toastService.error(
          'Error',
          error.response?.data?.message || 'Error al actualizar la contraseña. Serás redirigido al inicio.'
        );
        // Redirigir al inicio después de mostrar el toast
        setTimeout(() => {
          onBack();
        }, 2000);
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
                selectionColor="#FFFFFF"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <EyeIcon size={20} isVisible={showPassword} />
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
                selectionColor="#FFFFFF"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeIcon size={20} isVisible={showConfirmPassword} />
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
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  formSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 30,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 0,
    paddingRight: 50,
    fontFamily: fonts.regular,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 12,
    padding: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  requirementsTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: fonts.bold,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementIcon: {
    fontSize: 18,
    color: '#B3D4F1',
    marginRight: 12,
  },
  requirementText: {
    fontSize: 15,
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
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  resetButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
