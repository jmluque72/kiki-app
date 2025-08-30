import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
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
  const [showRegister, setShowRegister] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
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

    if (showRegister) {
      return (
        <RegisterScreen 
          onRegister={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
        />
      );
    }

    return <LoginScreen onShowRegister={handleShowRegister} />;
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
