import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const checkImagePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      // En iOS, los permisos se manejan automáticamente con las descripciones en Info.plist
      console.log('📱 [PERMISSIONS] iOS - Permisos manejados automáticamente');
      return true;
    } else if (Platform.OS === 'android') {
      // En Android, verificar permisos de almacenamiento
      const storagePermission = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      
      console.log('📱 [PERMISSIONS] Android storage permission:', storagePermission);
      
      if (storagePermission === RESULTS.GRANTED) {
        return true;
      } else if (storagePermission === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        console.log('📱 [PERMISSIONS] Android storage permission request result:', requestResult);
        return requestResult === RESULTS.GRANTED;
      } else {
        console.log('📱 [PERMISSIONS] Android storage permission denied permanently');
        Alert.alert(
          'Permisos Requeridos',
          'La app necesita acceso a la galería para seleccionar imágenes. Por favor, habilita los permisos en Configuración.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('📱 [PERMISSIONS] Error verificando permisos:', error);
    return false;
  }
};

export const checkCameraPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      console.log('📱 [PERMISSIONS] iOS - Permisos de cámara manejados automáticamente');
      return true;
    } else if (Platform.OS === 'android') {
      const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
      
      console.log('📱 [PERMISSIONS] Android camera permission:', cameraPermission);
      
      if (cameraPermission === RESULTS.GRANTED) {
        return true;
      } else if (cameraPermission === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
        console.log('📱 [PERMISSIONS] Android camera permission request result:', requestResult);
        return requestResult === RESULTS.GRANTED;
      } else {
        console.log('📱 [PERMISSIONS] Android camera permission denied permanently');
        Alert.alert(
          'Permisos Requeridos',
          'La app necesita acceso a la cámara para tomar fotos. Por favor, habilita los permisos en Configuración.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('📱 [PERMISSIONS] Error verificando permisos de cámara:', error);
    return false;
  }
};
