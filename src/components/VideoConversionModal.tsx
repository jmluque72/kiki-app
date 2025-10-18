import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { VideoConversionResult } from '../services/videoConversionService';

interface VideoConversionModalProps {
  visible: boolean;
  isConverting: boolean;
  progress: number;
  result: VideoConversionResult | null;
  error: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

const VideoConversionModal: React.FC<VideoConversionModalProps> = ({
  visible,
  isConverting,
  progress,
  result,
  error,
  onClose,
  onRetry
}) => {
  const getStatusText = () => {
    if (isConverting) {
      return `Convirtiendo video... ${progress}%`;
    }
    if (error) {
      return 'Error en la conversión';
    }
    if (result?.success) {
      return 'Conversión completada';
    }
    return 'Preparando conversión...';
  };

  const getStatusColor = () => {
    if (error) return '#EF4444';
    if (result?.success) return '#10B981';
    return '#3B82F6';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = () => {
    if (!result?.originalSize || !result?.convertedSize) return null;
    const ratio = ((result.originalSize - result.convertedSize) / result.originalSize) * 100;
    return ratio > 0 ? `${ratio.toFixed(1)}%` : '0%';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Conversión de Video</Text>
            {!isConverting && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            {/* Indicador de progreso */}
            <View style={styles.progressContainer}>
              {isConverting ? (
                <ActivityIndicator size="large" color="#3B82F6" />
              ) : (
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusIconText}>
                    {error ? '✕' : result?.success ? '✓' : '⏳'}
                  </Text>
                </View>
              )}
            </View>

            {/* Texto de estado */}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>

            {/* Barra de progreso */}
            {isConverting && (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
            )}

            {/* Información del resultado */}
            {result && result.success && (
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>Conversión exitosa</Text>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetail}>
                    Tamaño original: {formatFileSize(result.originalSize)}
                  </Text>
                  <Text style={styles.resultDetail}>
                    Tamaño convertido: {formatFileSize(result.convertedSize)}
                  </Text>
                  {getCompressionRatio() && (
                    <Text style={styles.resultDetail}>
                      Compresión: {getCompressionRatio()}
                    </Text>
                  )}
                  {result.duration && (
                    <Text style={styles.resultDetail}>
                      Duración: {result.duration}s
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Información de error */}
            {error && (
              <View style={styles.errorInfo}>
                <Text style={styles.errorTitle}>Error en la conversión</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Botones de acción */}
            <View style={styles.actions}>
              {error && onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              )}
              
              {!isConverting && (
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    result?.success ? styles.successButton : styles.closeButtonStyle
                  ]} 
                  onPress={onClose}
                >
                  <Text style={styles.actionButtonText}>
                    {result?.success ? 'Continuar' : 'Cerrar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  resultInfo: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 12,
  },
  resultDetails: {
    gap: 8,
  },
  resultDetail: {
    fontSize: 14,
    color: '#374151',
  },
  errorInfo: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  closeButtonStyle: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoConversionModal;
