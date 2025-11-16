import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts } from '../src/config/fonts';
import { logCriticalError, appLogger } from '../src/utils/logger';
// import { reportError } from '../src/config/sentryConfig';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente render muestre la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log detallado del error para debugging
    const errorDetails = {
      name: error?.name || 'UnknownError',
      message: error?.message || 'Error desconocido',
      stack: error?.stack || 'No stack trace available',
      componentStack: errorInfo?.componentStack || 'No component stack',
      errorInfo: errorInfo || {},
    };

    console.error('🚨 [ERROR BOUNDARY] Error capturado:', errorDetails);
    console.error('🚨 [ERROR BOUNDARY] Error completo:', error);
    console.error('🚨 [ERROR BOUNDARY] ErrorInfo completo:', errorInfo);
    
    // Log del error para debugging
    appLogger.crash('Error Boundary capturó un error', error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'MainErrorBoundary',
      errorDetails,
    });
    
    // Reportar a Sentry (deshabilitado)
    // reportError(error, {
    //   errorInfo,
    //   componentStack: errorInfo.componentStack,
    //   errorBoundary: 'MainErrorBoundary',
    // });
    
    // Log crítico para debugging
    logCriticalError(error, 'ErrorBoundary', {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorDetails,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Error desconocido';
      const errorName = this.state.error?.name || 'Error';
      
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Algo salió mal</Text>
            <Text style={styles.errorMessage}>
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetailsContainer}>
                <Text style={styles.errorDetailsTitle}>Detalles del error (solo en desarrollo):</Text>
                <Text style={styles.errorDetailsText}>{errorName}: {errorMessage}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStackText} numberOfLines={5}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 300,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  errorDetailsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#666666',
    marginBottom: 8,
  },
  errorDetailsText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#333333',
    marginBottom: 8,
  },
  errorStackText: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: '#666666',
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;
