import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { logAppStart, appLogger } from './src/utils/logger';
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
import { AuthProvider, useAuth } from './contexts/AuthContextHybrid';
import AuthSync from './components/AuthSync';
import AuthWrapper from './components/AuthWrapper';
import { SplashScreen } from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
// import PushNotificationService from './src/services/pushNotificationService';
import { toastConfig } from './src/config/toastConfig';
// import { usePushNotifications } from './src/hooks/usePushNotifications';

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
  // const pushNotifications = usePushNotifications();
  
  
  // Debug: log cuando el usuario está autenticado
  // useEffect(() => {
  //   appLogger.push('Push notifications hook status', {
  //     isEnabled: pushNotifications.isEnabled,
  //     token: pushNotifications.token,
  //     loading: pushNotifications.loading,
  //     error: pushNotifications.error
  //   });
  // }, [pushNotifications]);


  // Detectar primer login y mostrar pantalla de cambio de contraseña
  useEffect(() => {
    appLogger.auth('Auth state changed', {
      isAuthenticated,
      userEmail: user?.email,
      isFirstLogin: user?.isFirstLogin,
      hasUser: !!user
    });
    
    // Solo ejecutar si el usuario está autenticado Y tiene datos completos
    if (isAuthenticated && user && user.email) {
      appLogger.auth('Usuario autenticado con datos completos');
      
      
      if (user.isFirstLogin === true) {
        appLogger.auth('PRIMER LOGIN DETECTADO - Mostrando pantalla de cambio de contraseña', {
          userEmail: user.email
        });
        setShowChangePassword(true);
      } else if (user.isFirstLogin === false) {
        appLogger.auth('Usuario ya cambió contraseña, continuando flujo normal');
        setShowChangePassword(false);
      } else {
        appLogger.auth('Usuario autenticado pero isFirstLogin es undefined/null', {
          isFirstLogin: user.isFirstLogin
        });
        setShowChangePassword(false);
      }
    } else {
      appLogger.auth('No autenticado o sin usuario completo', {
        isAuthenticated,
        hasUser: !!user
      });
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
    try {
      if (showSplash) {
        appLogger.navigation('Showing splash screen');
        return <SplashScreen onFinish={handleSplashFinish} />;
      }

      if (isLoading) {
        appLogger.navigation('Showing loading screen');
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E5FCE' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        );
      }

      if (isAuthenticated) {
        appLogger.navigation('User is authenticated, determining screen', {
          associationsCount: associations.length,
          showInstitutionSelector,
          showActiveAssociation
        });
        
        // Si está autenticado pero no tiene asociaciones, mostrar selector
        if (associations.length === 0) {
          appLogger.navigation('No associations found, showing institution selector');
          return <InstitutionSelector onInstitutionSelected={handleInstitutionSelected} />;
        }
        
        // Si tiene asociaciones pero no se ha seleccionado ninguna, mostrar selector
        if (!showInstitutionSelector && associations.length > 0) {
          appLogger.navigation('Has associations but no institution selected, showing selector');
          setShowInstitutionSelector(true);
          return <InstitutionSelector onInstitutionSelected={handleInstitutionSelected} />;
        }
        
        // Si ya se seleccionó una institución, mostrar HomeScreen
        appLogger.navigation('Showing home screen');
        return <HomeScreen onOpenActiveAssociation={() => setShowActiveAssociation(true)} />;
      }



      if (showForgotPassword) {
        appLogger.navigation('Showing forgot password screen');
        return (
          <ForgotPasswordScreen 
            onBack={handleBackToLogin}
            onCodeSent={handleCodeSent}
          />
        );
      }

      if (showVerifyCode) {
        appLogger.navigation('Showing verify code screen');
        return (
          <VerifyCodeScreen 
            email={forgotPasswordEmail}
            onBack={handleBackToLogin}
            onCodeVerified={handleCodeVerified}
          />
        );
      }

      if (showResetPassword) {
        appLogger.navigation('Showing reset password screen');
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
        appLogger.navigation('Showing change password screen');
        return (
          <ChangePasswordScreen 
            isFirstLogin={true}
            onPasswordChanged={handlePasswordChanged}
          />
        );
      }

      if (showActiveAssociation) {
        appLogger.navigation('Showing active association screen');
        return (
          <ActiveAssociationScreen 
            onBack={() => setShowActiveAssociation(false)}
          />
        );
      }

      appLogger.navigation('Showing login screen');
      return <LoginScreen onShowForgotPassword={handleShowForgotPassword} />;
    } catch (error) {
      appLogger.crash('Error in getCurrentScreen', error as Error);
      // Fallback a login screen en caso de error
      return <LoginScreen onShowForgotPassword={handleShowForgotPassword} />;
    }
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0E5FCE" />
      {getCurrentScreen()}
    </NavigationContainer>
  );
};

const App = () => {
  // Inicializar logging al arrancar la app
  useEffect(() => {
    try {
      // Log de inicio de app
      logAppStart();
      
      appLogger.auth('App initialized successfully');
    } catch (error) {
      appLogger.crash('Error initializing app', error as Error);
      console.error('❌ [APP] Critical error during initialization:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <InstitutionProvider>
            <AuthSync>
              <AuthWrapper>
                <AppContent />
              </AuthWrapper>
            </AuthSync>
          </InstitutionProvider>
        </LoadingProvider>
      </AuthProvider>
      <Toast 
        config={toastConfig} 
        topOffset={100}
        visibilityTime={3000}
      />
    </ErrorBoundary>
  );
};

export default App;
