import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { apiClient } from '../src/services/api';

interface CameraKitQRScannerProps {
  visible: boolean;
  onClose: () => void;
  onStudentFound: (student: any) => void;
}

const { width, height } = Dimensions.get('window');

export const CameraKitQRScanner: React.FC<CameraKitQRScannerProps> = ({
  visible,
  onClose,
  onStudentFound
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Función para solicitar permisos de cámara
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permisos de Cámara',
            message: 'La aplicación necesita acceso a la cámara para escanear códigos QR',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Permisos de cámara concedidos');
          setHasPermission(true);
        } else {
          console.log('❌ Permisos de cámara denegados');
          setHasPermission(false);
          Alert.alert(
            'Permisos Requeridos',
            'Se necesitan permisos de cámara para escanear códigos QR. Por favor, habilite los permisos en la configuración de la aplicación.',
            [
              { text: 'Cancelar', onPress: onClose },
              { text: 'Configuración', onPress: onClose }
            ]
          );
        }
      } catch (err) {
        console.warn('Error solicitando permisos:', err);
        setHasPermission(false);
      }
    } else {
      // En iOS, los permisos se manejan automáticamente
      setHasPermission(true);
    }
  };

  useEffect(() => {
    if (visible && !permissionRequested) {
      setPermissionRequested(true);
      requestCameraPermission();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const onCodeRead = async (event: any) => {
    if (scanned) return;
    
    setScanned(true);
    const qrCode = event.nativeEvent.codeStringValue;
    
    console.log('🔍 [CAMERA KIT QR SCANNER] Código QR escaneado:', qrCode);
    
    try {
      // Buscar estudiante por código QR
      const response = await apiClient.get(`/students/by-qr/${qrCode}`);
      
      if (response.data.success) {
        const student = response.data.data;
        console.log('✅ [CAMERA KIT QR SCANNER] Estudiante encontrado:', student);
        
        // Marcar asistencia directamente y cerrar el scanner
        onStudentFound(student);
        onClose();
      } else {
        // Solo mostrar alerta si no encuentra el usuario
        Alert.alert(
          'Estudiante No Encontrado',
          'No se encontró ningún estudiante con este código QR',
          [
            {
              text: 'Intentar de nuevo',
              onPress: () => setScanned(false)
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ [CAMERA KIT QR SCANNER] Error:', error);
      // Solo mostrar alerta en caso de error
      Alert.alert(
        'Error de Conexión',
        'Error al buscar el estudiante. Verifique su conexión a internet.',
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {hasPermission === null ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Permisos de cámara denegados</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={requestCameraPermission}
            >
              <Text style={styles.buttonText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#666' }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              cameraType={CameraType.Back}
              scanBarcode={true}
              onReadCode={onCodeRead}
              showFrame={true}
              laserColor="#0E5FCE"
              frameColor="#0E5FCE"
            />
            
            {/* Overlay personalizado */}
            <View style={styles.overlay}>
              {/* Texto de instrucciones */}
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Escanea el código QR del estudiante
                </Text>
                <Text style={styles.subInstructionText}>
                  Apunta la cámara al código QR para marcar la asistencia
                </Text>
              </View>
              
              {/* Botón cancelar */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  instructionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subInstructionText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CameraKitQRScanner;
