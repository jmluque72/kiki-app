import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import InstitutionSelector from './components/InstitutionSelector';
import { LoadingProvider } from './contexts/LoadingContext';
import { InstitutionProvider } from './contexts/InstitutionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthSync from './components/AuthSync';
import { SplashScreen } from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const { isAuthenticated, isLoading, associations } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
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
      return <HomeScreen />;
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
    </ErrorBoundary>
  );
};

export default App;
