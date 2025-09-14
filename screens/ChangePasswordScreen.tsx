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

interface ChangePasswordScreenProps {
  isFirstLogin?: boolean;
  onPasswordChanged: () => void;
  onBack?: () => void;
  onLogout?: () => void;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ 
  isFirstLogin = false, 
  onPasswordChanged,
  onBack,
  onLogout 
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toastService.error('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastService.error('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toastService.error('Error', 'La nueva contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        currentPassword: undefined, // Ya no enviamos contraseña actual
        newPassword: newPassword,
        isFirstLogin: isFirstLogin
      };

      const response = await apiClient.post('/users/change-password', requestData);

      if (response.data.success) {
        toastService.success('Éxito', 'Contraseña actualizada exitosamente');
        
        // Si no es primer login, desloguear al usuario
        if (!isFirstLogin && onLogout) {
          console.log('🔑 Contraseña cambiada - deslogueando usuario');
          setTimeout(() => {
            onLogout();
          }, 1500); // Esperar 1.5 segundos para que se vea el toast
        } else {
          onPasswordChanged();
        }
      } else {
        toastService.error('Error', response.data.message || 'Error al cambiar la contraseña');
      }
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      
      if (error.response?.status === 400) {
        toastService.error('Error', error.response.data.message || 'Error al cambiar la contraseña');
      } else {
        toastService.error('Error', error.response?.data?.message || 'Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  const validation = validatePassword(newPassword);

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
          <Text style={styles.title}>
            {isFirstLogin ? 'Establece tu contraseña' : 'Cambiar contraseña'}
          </Text>
          
          <Text style={styles.description}>
            {isFirstLogin 
              ? 'Por seguridad, debes establecer una nueva contraseña para tu cuenta.'
              : 'Establece una nueva contraseña segura para tu cuenta.'
            }
          </Text>

          {/* Ya no pedimos contraseña actual - Solo nueva contraseña */}

          {/* Nueva contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor="#B3D4F1"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!loading}
                selectionColor="#FFFFFF"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <EyeIcon size={20} isVisible={showNewPassword} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor="#B3D4F1"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
          </View>

          {/* Requisitos de contraseña */}
          {newPassword.length > 0 && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Requisitos de seguridad:</Text>
              <View style={styles.requirementItem}>
                <Text style={[styles.requirementIcon, validation.requirements.minLength && styles.requirementIconValid]}>
                  {validation.requirements.minLength ? '✓' : '○'}
                </Text>
                <Text style={[styles.requirementText, validation.requirements.minLength && styles.requirementTextValid]}>
                  Mínimo 8 caracteres
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text style={[styles.requirementIcon, validation.requirements.hasUpperCase && styles.requirementIconValid]}>
                  {validation.requirements.hasUpperCase ? '✓' : '○'}
                </Text>
                <Text style={[styles.requirementText, validation.requirements.hasUpperCase && styles.requirementTextValid]}>
                  Al menos una mayúscula
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text style={[styles.requirementIcon, validation.requirements.hasLowerCase && styles.requirementIconValid]}>
                  {validation.requirements.hasLowerCase ? '✓' : '○'}
                </Text>
                <Text style={[styles.requirementText, validation.requirements.hasLowerCase && styles.requirementTextValid]}>
                  Al menos una minúscula
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text style={[styles.requirementIcon, validation.requirements.hasNumbers && styles.requirementIconValid]}>
                  {validation.requirements.hasNumbers ? '✓' : '○'}
                </Text>
                <Text style={[styles.requirementText, validation.requirements.hasNumbers && styles.requirementTextValid]}>
                  Al menos un número
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Text style={[styles.requirementIcon, validation.requirements.hasSpecialChar && styles.requirementIconValid]}>
                  {validation.requirements.hasSpecialChar ? '✓' : '○'}
                </Text>
                <Text style={[styles.requirementText, validation.requirements.hasSpecialChar && styles.requirementTextValid]}>
                  Al menos un carácter especial
                </Text>
              </View>
            </View>
          )}

          {/* Botón de cambio */}
          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading || !validation.isValid || newPassword !== confirmPassword}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.changeButtonText}>
                {isFirstLogin ? 'Establecer Contraseña' : 'Cambiar Contraseña'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Botón de volver - Solo si no es primer login */}
          {!isFirstLogin && onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 30,
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
    marginBottom: 30,
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.medium,
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
    borderBottomWidth: 1,
    borderBottomColor: '#B3D4F1',
    fontFamily: fonts.regular,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 12,
    padding: 8,
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
    fontFamily: fonts.medium,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#B3D4F1',
  },
  requirementIconValid: {
    color: '#4ADE80',
  },
  requirementText: {
    fontSize: 15,
    color: '#B3D4F1',
    fontFamily: fonts.regular,
  },
  requirementTextValid: {
    color: '#4ADE80',
  },
  changeButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  changeButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
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

export default ChangePasswordScreen;
