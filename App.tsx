import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import HomeScreen from './screens/HomeScreen';
import InstitutionSelector from './components/InstitutionSelector';
import ActiveAssociationScreen from './screens/ActiveAssociationScreen';
import { LoadingProvider } from './contexts/LoadingContext';
import { InstitutionProvider } from './contexts/InstitutionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthSync from './components/AuthSync';
import { SplashScreen } from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import PushNotificationService from './src/services/pushNotificationService';
import { toastConfig } from './src/config/toastConfig';
import { usePushNotifications } from './src/hooks/usePushNotifications';

const AppContent = () => {
  const { isAuthenticated, isLoading, associations, user, updateUserAfterPasswordChange } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  const [showActiveAssociation, setShowActiveAssociation] = useState(false);

  // Inicializar push notifications cuando el usuario esté autenticado
  const pushNotifications = usePushNotifications();
  
  // Debug: log cuando el usuario está autenticado
  useEffect(() => {
    console.log('🔔 [APP] Push notifications hook status:', {
      isEnabled: pushNotifications.isEnabled,
      token: pushNotifications.token,
      loading: pushNotifications.loading,
      error: pushNotifications.error
    });
  }, [pushNotifications]);


  // Detectar primer login y mostrar pantalla de cambio de contraseña
  useEffect(() => {
    console.log('🔑 [APP] useEffect ejecutado - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isFirstLogin:', user?.isFirstLogin);
    console.log('🔑 [APP] Tipo de isFirstLogin:', typeof user?.isFirstLogin, 'Valor exacto:', user?.isFirstLogin);
    
    // Solo ejecutar si el usuario está autenticado Y tiene datos completos
    if (isAuthenticated && user && user.email) {
      console.log('🔑 [APP] Usuario autenticado con datos completos');
      
      if (user.isFirstLogin === true) {
        console.log('🔑 [APP] ¡PRIMER LOGIN DETECTADO! Mostrando pantalla de cambio de contraseña');
        console.log('🔑 [APP] Usuario:', user.email, 'isFirstLogin:', user.isFirstLogin);
        setShowChangePassword(true);
      } else if (user.isFirstLogin === false) {
        console.log('🔑 [APP] Usuario ya cambió contraseña, continuando flujo normal');
        setShowChangePassword(false);
      } else {
        console.log('🔑 [APP] Usuario autenticado pero isFirstLogin es undefined/null:', user.isFirstLogin);
        setShowChangePassword(false);
      }
    } else {
      console.log('🔑 [APP] No autenticado o sin usuario completo - isAuthenticated:', isAuthenticated, 'user:', user);
      // Asegurar que no se muestre pantalla de cambio de contraseña si no hay usuario
      setShowChangePassword(false);
    }
  }, [isAuthenticated, user]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handlePasswordChanged = () => {
    console.log('🔑 Contraseña cambiada exitosamente');
    updateUserAfterPasswordChange();
    setShowChangePassword(false);
  };




  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowVerifyCode(false);
    setShowResetPassword(false);
    setForgotPasswordEmail('');
    setVerificationCode('');
  };

  const handleCodeSent = (email: string) => {
    setForgotPasswordEmail(email);
    setShowForgotPassword(false);
    setShowVerifyCode(true);
  };

  const handleCodeVerified = (email: string, code: string) => {
    setVerificationCode(code);
    setShowVerifyCode(false);
    setShowResetPassword(true);
  };

  const handlePasswordReset = () => {
    setShowResetPassword(false);
    setForgotPasswordEmail('');
    setVerificationCode('');
  };

  const handleInstitutionSelected = () => {
    setShowInstitutionSelector(false);
  };

  // Determinar qué pantalla mostrar
  const getCurrentScreen = () => {
    if (showSplash) {
      return <SplashScreen onFinish={handleSplashFinish} />;
    }

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E5FCE' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }

    if (isAuthenticated) {
      // Si está autenticado pero no tiene asociaciones, mostrar selector
      if (associations.length === 0) {
        return <InstitutionSelector onInstitutionSelected={handleInstitutionSelected} />;
      }
      
      // Si tiene asociaciones pero no se ha seleccionado ninguna, mostrar selector
      if (!showInstitutionSelector && associations.length > 0) {
        setShowInstitutionSelector(true);
        return <InstitutionSelector onInstitutionSelected={handleInstitutionSelected} />;
      }
      
      // Si ya se seleccionó una institución, mostrar HomeScreen
      return <HomeScreen onOpenActiveAssociation={() => setShowActiveAssociation(true)} />;
    }



    if (showForgotPassword) {
      return (
        <ForgotPasswordScreen 
          onBack={handleBackToLogin}
          onCodeSent={handleCodeSent}
        />
      );
    }

    if (showVerifyCode) {
      return (
        <VerifyCodeScreen 
          email={forgotPasswordEmail}
          onBack={handleBackToLogin}
          onCodeVerified={handleCodeVerified}
        />
      );
    }

    if (showResetPassword) {
      return (
        <ResetPasswordScreen 
          email={forgotPasswordEmail}
          code={verificationCode}
          onBack={handleBackToLogin}
          onPasswordReset={handlePasswordReset}
        />
      );
    }

    if (showChangePassword) {
      return (
        <ChangePasswordScreen 
          isFirstLogin={true}
          onPasswordChanged={handlePasswordChanged}
        />
      );
    }

    if (showActiveAssociation) {
      return (
        <ActiveAssociationScreen 
          onBack={() => setShowActiveAssociation(false)}
        />
      );
    }

    return <LoginScreen onShowForgotPassword={handleShowForgotPassword} />;
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0E5FCE" />
      {getCurrentScreen()}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <InstitutionProvider>
            <AuthSync>
              <AppContent />
            </AuthSync>
          </InstitutionProvider>
        </LoadingProvider>
      </AuthProvider>
      <Toast 
        config={toastConfig} 
        style={{ zIndex: 99999, elevation: 1000 }}
        topOffset={100}
        visibilityTime={3000}
      />
    </ErrorBoundary>
  );
};

export default App;
