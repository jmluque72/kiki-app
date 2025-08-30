import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useLoading } from '../contexts/LoadingContext';
import { AuthService } from '../src/services/authService';
import { Account } from '../src/services/api';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';

interface RegisterScreenProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onBackToLogin }) => {
  const { showAlert, hideAlert, isVisible, alertConfig } = useCustomAlert();
  
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();





  const validateForm = () => {
    // Validar que los campos requeridos estén completos
    return nombre.trim() && email.trim() && password.trim();
  };



  const handleRegister = async () => {
    if (!validateForm()) {
      showAlert({
        title: 'Error',
        message: 'Por favor, completa los campos requeridos: Nombre, Email y Contraseña',
        type: 'error',
        confirmText: 'OK',
        onConfirm: hideAlert,
      });
      return;
    }

    showLoading('Registrando usuario...');
    
    try {
      const userData = {
        email,
        password,
        nombre,
        apellido,
        telefono: telefono || undefined
      };

      const response = await AuthService.registerMobile(userData);
      console.log('Registro exitoso:', response);
      
      hideLoading();
      
      // Usar el mensaje del servidor si está disponible
      const successMessage = response?.message || 'Tu cuenta ha sido registrada exitosamente. Ya puedes iniciar sesión.';
      
      showAlert({
        title: 'Registro Exitoso',
        message: successMessage,
        type: 'success',
        confirmText: 'Ir al Login',
        onConfirm: () => {
          hideAlert();
          onBackToLogin();
        },
      });
    } catch (error: any) {
      hideLoading();
      
      let errorMessage = error.message || 'Error al registrar usuario';
      
      if (errorMessage.includes('\n')) {
        const errors = errorMessage.split('\n');
        const formattedErrors = errors.map((err: string) => {
          const fieldTranslations: { [key: string]: string } = {
            'telefono': 'Teléfono',
            'email': 'Email',
            'nombre': 'Nombre',
            'password': 'Contraseña'
          };
          
          const [field, message] = err.split(': ');
          const translatedField = fieldTranslations[field] || field;
          return `• ${translatedField}: ${message}`;
        });
        
        errorMessage = 'Errores de validación:\n' + formattedErrors.join('\n');
      }
      
      showAlert({
        title: 'Error de Registro',
        message: errorMessage,
        type: 'error',
        confirmText: 'OK',
        onConfirm: hideAlert,
      });
    }
  };



  const renderForm = () => (
    <View style={styles.formSection}>
      <View style={styles.inputContainer}>
        <Text style={[
          styles.inputLabel,
          focusedField === 'nombre' && styles.inputLabelFocused
        ]}>
          Nombre
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'nombre' && styles.inputFocused
          ]}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ingresa tu nombre"
          placeholderTextColor="#B3D4F1"
          onFocus={() => setFocusedField('nombre')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[
          styles.inputLabel,
          focusedField === 'apellido' && styles.inputLabelFocused
        ]}>
          Apellido
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'apellido' && styles.inputFocused
          ]}
          value={apellido}
          onChangeText={setApellido}
          placeholder="Ingresa tu apellido"
          placeholderTextColor="#B3D4F1"
          onFocus={() => setFocusedField('apellido')}
          onBlur={() => setFocusedField(null)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[
          styles.inputLabel,
          focusedField === 'telefono' && styles.inputLabelFocused
        ]}>
          Teléfono
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'telefono' && styles.inputFocused
          ]}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ingresa tu teléfono"
          placeholderTextColor="#B3D4F1"
          onFocus={() => setFocusedField('telefono')}
          onBlur={() => setFocusedField(null)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[
          styles.inputLabel,
          focusedField === 'email' && styles.inputLabelFocused
        ]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'email' && styles.inputFocused
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="Ingresa tu email"
          placeholderTextColor="#B3D4F1"
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[
          styles.inputLabel,
          focusedField === 'password' && styles.inputLabelFocused
        ]}>
          Contraseña
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'password' && styles.inputFocused
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor="#B3D4F1"
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
      >
        <Text style={styles.registerButtonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );



  return (
    <>
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

        {/* Form Content */}
        {renderForm()}

        {/* Back to Login */}
        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.bottomText}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
        
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoImage: {
    width: 180,
    height: 140,
  },

  formSection: {
    flex: 1,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#B3D4F1',
    marginBottom: 8,
    fontWeight: '400',
  },
  inputLabelFocused: {
    color: '#FF8C42',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  inputFocused: {
    borderBottomColor: '#FF8C42',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  inputText: {
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#B3D4F1',
  },



  registerButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
    height: 50,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 20,
  },
  bottomIndicator: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginHorizontal: 120,
    marginBottom: 20,
  },

});

export default RegisterScreen; 