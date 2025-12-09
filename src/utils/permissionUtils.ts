import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const checkImagePermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      // En iOS, los permisos se manejan automáticamente con las descripciones en Info.plist
      console.log('📱 [PERMISSIONS] iOS - Permisos manejados automáticamente');
      return true;
    } else if (Platform.OS === 'android') {
      // En Android 13+ (API 33+), usar READ_MEDIA_IMAGES
      // En versiones anteriores, usar READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version;
      const isAndroid13Plus = androidVersion >= 33;
      
      let permission: any;
      if (isAndroid13Plus) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        console.log('📱 [PERMISSIONS] Android 13+ detectado, usando READ_MEDIA_IMAGES');
      } else {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        console.log('📱 [PERMISSIONS] Android < 13, usando READ_EXTERNAL_STORAGE');
      }
      
      const permissionStatus = await check(permission);
      console.log('📱 [PERMISSIONS] Android permission status:', permissionStatus);
      
      if (permissionStatus === RESULTS.GRANTED) {
        console.log('✅ [PERMISSIONS] Permiso ya otorgado');
        return true;
      } else if (permissionStatus === RESULTS.DENIED) {
        console.log('📱 [PERMISSIONS] Permiso denegado, solicitando...');
        const requestResult = await request(permission);
        console.log('📱 [PERMISSIONS] Resultado de solicitud:', requestResult);
        
        if (requestResult === RESULTS.GRANTED) {
          console.log('✅ [PERMISSIONS] Permiso otorgado');
          return true;
        } else if (requestResult === RESULTS.BLOCKED) {
          console.log('⚠️ [PERMISSIONS] Permiso bloqueado permanentemente');
          Alert.alert(
            'Permisos Requeridos',
            'La app necesita acceso a la galería para seleccionar imágenes. Por favor, habilita los permisos en Configuración.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configuración', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        } else {
          console.log('❌ [PERMISSIONS] Permiso denegado por el usuario');
          return false;
        }
      } else if (permissionStatus === RESULTS.BLOCKED) {
        console.log('⚠️ [PERMISSIONS] Permiso bloqueado permanentemente');
        Alert.alert(
          'Permisos Requeridos',
          'La app necesita acceso a la galería para seleccionar imágenes. Por favor, habilita los permisos en Configuración.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      } else {
        console.log('❌ [PERMISSIONS] Estado de permiso desconocido:', permissionStatus);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('📱 [PERMISSIONS] Error verificando permisos:', error);
    // En caso de error, intentar abrir el selector de imágenes de todas formas
    // react-native-image-picker puede manejar los permisos internamente
    console.log('⚠️ [PERMISSIONS] Error en verificación, continuando de todas formas...');
    return true;
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
