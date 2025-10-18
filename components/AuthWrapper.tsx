import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContextHybrid';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, fallback }) => {
  try {
    const { isLoading } = useAuth();
    
    if (isLoading) {
      return fallback || (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E5FCE" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      );
    }
    
    return <>{children}</>;
  } catch (error) {
    console.error('❌ [AuthWrapper] Error en AuthWrapper:', error);
    return fallback || (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error de autenticación</Text>
        <Text style={styles.errorSubtext}>Reinicia la aplicación</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0E5FCE',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF4444',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default AuthWrapper;
