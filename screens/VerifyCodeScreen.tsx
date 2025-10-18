import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { apiClient } from '../src/services/api';
import { toastService } from '../src/services/toastService';

interface VerifyCodeScreenProps {
  email: string;
  onBack: () => void;
  onCodeVerified: (email: string, code: string) => void;
}

const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ email, onBack, onCodeVerified }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // Timer para el código
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      console.log('Error: Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/users/verify-reset-code', {
        email,
        code: codeString
      });

      if (response.data.success) {
        onCodeVerified(email, codeString);
      } else {
        toastService.error('Error', response.data.message || 'Código inválido');
      }
    } catch (error: any) {
      console.error('Error verificando código:', error);
      
      if (error.response?.status === 400) {
        toastService.error(
          'Código Inválido',
          'El código ingresado no es correcto o ha expirado. Verifica el código o solicita uno nuevo.'
        );
      } else {
        toastService.error(
          'Error',
          error.response?.data?.message || 'Error al verificar el código'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await apiClient.post('/users/forgot-password', {
        email
      });

      if (response.data.success) {
        setCode(['', '', '', '', '', '']);
        setTimeLeft(600);
        setCanResend(false);
        console.log('Código Reenviado: Se ha enviado un nuevo código de recuperación a tu email.');
      } else {
        console.log('Error:', response.data.message || 'Error al reenviar el código');
      }
    } catch (error: any) {
      console.error('Error reenviando código:', error);
      console.log('Error:', error.response?.data?.message || 'Error al reenviar el código');
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
          <Text style={styles.title}>Verifica tu código</Text>
          
          <Text style={styles.description}>
            Hemos enviado un código de 6 dígitos a:
          </Text>

          <Text style={styles.emailText}>{email}</Text>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Ingresa el código:</Text>
            <View style={styles.codeInputs}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timeLeft > 0 ? `Expira en ${formatTime(timeLeft)}` : 'Código expirado'}
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verificar Código</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <TouchableOpacity
            style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
            onPress={handleResendCode}
            disabled={!canResend || loading}
          >
            <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
              Reenviar código
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver</Text>
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
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  emailText: {
    fontSize: 16,
    color: '#FF8C42',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: fonts.bold,
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 16,
    color: '#B3D4F1',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  codeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#B3D4F1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    color: '#0E5FCE',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#B3D4F1',
    fontFamily: fonts.regular,
  },
  verifyButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#FFB299',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  resendButtonTextDisabled: {
    color: '#B3D4F1',
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

export default VerifyCodeScreen;
