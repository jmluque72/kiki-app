import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '../src/config/fonts';
import { useLoading } from '../contexts/LoadingContext';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContextHybrid';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';

interface LoginScreenProps {
  onShowForgotPassword?: () => void;
}

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

const LoginScreen: React.FC<LoginScreenProps> = ({ onShowForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { login } = useAuth();
  const { showAlert, hideAlert, showLoginError, showNetworkError, isVisible, alertConfig } = useCustomAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: 'Campos Requeridos',
        message: 'Por favor, completa todos los campos',
        type: 'warning',
        confirmText: 'Entendido',
        onConfirm: hideAlert,
      });
      return;
    }

    //showLoading('Iniciando sesión...');
    
    try {
      await login(email, password);
      hideLoading();
      // La sincronización de asociaciones se maneja automáticamente en AuthSync
    } catch (error: any) {
      // Primero ocultar el loading para evitar conflictos con el Modal
      hideLoading();
      
      // Usar métodos específicos según el tipo de error
      if (error.message.includes('Usuario o contraseña incorrectos')) {
        showLoginError('Las credenciales ingresadas no son correctas. Verifica tu email y contraseña.');
      } else if (error.message.includes('No se pudo conectar')) {
        showNetworkError();
      } else if (error.message.includes('Error interno del servidor')) {
        showAlert({
          title: 'Error del Servidor',
          message: 'El servidor está experimentando problemas. Inténtalo más tarde.',
          type: 'warning',
          confirmText: 'Entendido',
          onConfirm: hideAlert,
        });
      } else if (error.message.includes('Request failed')) {
        // Error genérico de Axios
        showNetworkError();
      } else {
        showLoginError(error.message || 'Error inesperado al iniciar sesión');
      }
    }
  };

  const handleForgotPassword = () => {
    if (onShowForgotPassword) {
      onShowForgotPassword();
    }
  };



  return (
    <>
      <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID="login-screen"
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
          <View style={styles.inputContainer}>
            <Text style={[
              styles.inputLabel,
              focusedField === 'email' && styles.inputLabelFocused
            ]}>
              Email
            </Text>
            <TextInput
              testID="email-input"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              placeholderTextColor="#B3D4F1"
              selectionColor="#FFFFFF"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <View style={[
              styles.inputLine,
              focusedField === 'email' && styles.inputLineFocused
            ]} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[
              styles.inputLabel,
              focusedField === 'password' && styles.inputLabelFocused
            ]}>
              Contraseña
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                testID="password-input"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="off"
                autoCorrect={false}
                placeholderTextColor="#B3D4F1"
                selectionColor="#FFFFFF"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                testID="eye-icon"
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <EyeIcon size={20} isVisible={showPassword} />
              </TouchableOpacity>
            </View>
            <View style={[
              styles.inputLine,
              focusedField === 'password' && styles.inputLineFocused
            ]} />
          </View>

          <TouchableOpacity
            testID="login-button"
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.bottomText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom indicator */}
        <View style={styles.bottomIndicator} />
      </ScrollView>
    </KeyboardAvoidingView>
    
    <CustomAlert
      visible={isVisible}
      title={alertConfig?.title || ''}
      message={alertConfig?.message || ''}
      confirmText={alertConfig?.confirmText}
      cancelText={alertConfig?.cancelText}
      type={alertConfig?.type}
      onConfirm={alertConfig?.onConfirm}
      onCancel={alertConfig?.onCancel}
    />
  </>
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
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 18,
    color: '#B3D4F1',
    marginBottom: 2,
    fontFamily: fonts.regular,
  },
  inputLabelFocused: {
    color: '#FF8C42',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 0,
    paddingRight: 50,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 2,
    padding: 8,
  },
  inputLine: {
    height: 1,
    backgroundColor: '#B3D4F1',
    marginTop: 1,
  },
  inputLineFocused: {
    backgroundColor: '#FF8C42',
    height: 2,
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomIndicator: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginHorizontal: 120,
    marginBottom: 20,
  },
});

export default LoginScreen; 