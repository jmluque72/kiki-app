import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { apiClient } from '../src/services/api';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onStudentFound: (student: any) => void;
}

const { width, height } = Dimensions.get('window');

export const QRScanner: React.FC<QRScannerProps> = ({
  visible,
  onClose,
  onStudentFound
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const onSuccess = async (e: any) => {
    if (scanned) return;
    
    setScanned(true);
    const qrCode = e.data;
    
    console.log('🔍 [QR SCANNER] Código QR escaneado:', qrCode);
    
    try {
      // Buscar estudiante por código QR
      const response = await apiClient.get(`/api/students/by-qr/${qrCode}`);
      
      if (response.data.success) {
        const student = response.data.data;
        console.log('✅ [QR SCANNER] Estudiante encontrado:', student);
        
        Alert.alert(
          'Estudiante Encontrado',
          `${student.nombre} ${student.apellido}\nDNI: ${student.dni}`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setScanned(false)
            },
            {
              text: 'Marcar Asistencia',
              onPress: () => {
                onStudentFound(student);
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
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
      console.error('❌ [QR SCANNER] Error:', error);
      Alert.alert(
        'Error',
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
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.auto}
          topContent={
            <View style={styles.topContent}>
              <Text style={styles.topText}>
                Escanea el código QR del estudiante
              </Text>
              <Text style={styles.subText}>
                Apunta la cámara al código QR para marcar la asistencia
              </Text>
            </View>
          }
          bottomContent={
            <View style={styles.bottomContent}>
              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          }
          cameraStyle={styles.camera}
          showMarker={true}
          markerStyle={styles.marker}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
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
  camera: {
    height: height * 0.6,
    width: width,
  },
  marker: {
    borderColor: '#0E5FCE',
    borderWidth: 2,
  },
});

export default QRScanner;
