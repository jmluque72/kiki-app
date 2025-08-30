import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { fonts } from '../src/config/fonts';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const { width } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  type = 'info',
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#f0f9ff',
          borderColor: '#0ea5e9',
          iconColor: '#059669',
          icon: '✅',
        };
      case 'warning':
        return {
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          iconColor: '#d97706',
          icon: '⚠️',
        };
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          iconColor: '#dc2626',
          icon: '❌',
        };
      default:
        return {
          backgroundColor: '#f0f9ff',
          borderColor: '#0E5FCE',
          iconColor: '#0E5FCE',
          icon: 'ℹ️',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: typeStyles.backgroundColor, borderColor: typeStyles.borderColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#000000', fontWeight: 'bold' }]}>
              {title}
            </Text>
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.message, { color: '#000000' }]}>
              {message}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: '#FF8C42' }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  alertContainer: {
    width: width - 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: fonts.medium,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
});

export default CustomAlert; 