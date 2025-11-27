import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { logAppStart, appLogger } from './src/utils/logger';
import { setupGlobalErrorHandlers } from './src/utils/globalErrorHandler';
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
    if (isAuthenticated && user) {
      console.log('🔔 [APP] Push notifications hook status:', {
        isEnabled: pushNotifications.isEnabled,
        hasToken: !!pushNotifications.token,
        tokenPreview: pushNotifications.token ? pushNotifications.token.substring(0, 20) + '...' : null,
        loading: pushNotifications.loading,
        error: pushNotifications.error
      });
      
      appLogger.push('Push notifications hook status', {
        isEnabled: pushNotifications.isEnabled,
        hasToken: !!pushNotifications.token,
        loading: pushNotifications.loading,
        error: pushNotifications.error
      });
    }
  }, [pushNotifications.isEnabled, pushNotifications.token, pushNotifications.loading, pushNotifications.error, isAuthenticated, user]);


  // Detectar primer login y mostrar pantalla de cambio de contraseña
  useEffect(() => {
    console.log('🔍 [App.tsx] useEffect ejecutado - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isFirstLogin:', user?.isFirstLogin);
    
    appLogger.auth('Auth state changed', {
      isAuthenticated,
      userEmail: user?.email,
      isFirstLogin: user?.isFirstLogin,
      hasUser: !!user
    });
    
    // Solo ejecutar si el usuario está autenticado Y tiene datos completos
    if (isAuthenticated && user && user.email) {
      appLogger.auth('Usuario autenticado con datos completos', {
        userEmail: user.email,
        isFirstLogin: user.isFirstLogin,
        isFirstLoginType: typeof user.isFirstLogin,
        isFirstLoginTrue: user.isFirstLogin === true,
        userObject: JSON.stringify(user)
      });
      
      // Verificar isFirstLogin - puede ser true, false, undefined, o null
      const shouldShowChangePassword = user.isFirstLogin === true || user.isFirstLogin === 'true' || user.isFirstLogin === 1;
      
      if (shouldShowChangePassword) {
        console.log('✅ [App.tsx] PRIMER LOGIN DETECTADO - Mostrando pantalla de cambio de contraseña');
        appLogger.auth('PRIMER LOGIN DETECTADO - Mostrando pantalla de cambio de contraseña', {
          userEmail: user.email,
          isFirstLogin: user.isFirstLogin
        });
        setShowChangePassword(true);
      } else if (user.isFirstLogin === false || user.isFirstLogin === 'false' || user.isFirstLogin === 0) {
        console.log('ℹ️ [App.tsx] Usuario ya cambió contraseña, continuando flujo normal');
        appLogger.auth('Usuario ya cambió contraseña, continuando flujo normal');
        setShowChangePassword(false);
      } else {
        console.log('⚠️ [App.tsx] Usuario autenticado pero isFirstLogin es undefined/null:', user.isFirstLogin);
        appLogger.auth('Usuario autenticado pero isFirstLogin es undefined/null', {
          isFirstLogin: user.isFirstLogin,
          isFirstLoginType: typeof user.isFirstLogin
        });
        setShowChangePassword(false);
      }
    } else {
      console.log('❌ [App.tsx] No autenticado o sin usuario completo');
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
          showActiveAssociation,
          showChangePassword
        });
        
        // PRIORIDAD 1: Si debe cambiar contraseña (primer login), mostrar pantalla de cambio de contraseña
        if (showChangePassword) {
          console.log('🔑 [App.tsx] Mostrando pantalla de cambio de contraseña (primer login)');
          appLogger.navigation('Showing change password screen (first login)');
          return (
            <ChangePasswordScreen 
              isFirstLogin={true}
              onPasswordChanged={handlePasswordChanged}
            />
          );
        }
        
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
  // Nota: Los error handlers ya se configuraron en index.js antes de registrar el componente
  useEffect(() => {
    try {
      // Log de inicio de app
      logAppStart();
      
      appLogger.auth('App initialized successfully');
      console.log('✅ [APP] App component montado correctamente');
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
