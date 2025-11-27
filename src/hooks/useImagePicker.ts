import { useState } from 'react';
import { Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { checkCameraPermissions } from '../utils/permissionUtils';
import ImageResizer from 'react-native-image-resizer';

interface UseImagePickerReturn {
  selectedImage: string | null;
  pickImage: () => void;
  takePhoto: () => void;
  clearImage: () => void;
  isImagePickerOpen: boolean;
}

const useImagePicker = (): UseImagePickerReturn => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  // Función para copiar imagen temporal a lugar permanente en Android
  // IMPORTANTE: Debe llamarse INMEDIATAMENTE después de recibir la respuesta del picker
  // porque los archivos temporales se eliminan muy rápido
  const copyImageToPermanentLocation = async (imageUri: string): Promise<string> => {
    if (Platform.OS !== 'android') {
      return imageUri; // En iOS, retornar URI original
    }

    try {
      console.log('📱 [IMAGE PICKER] Copiando archivo temporal a lugar permanente:', imageUri);
      
      // Si ya es un archivo permanente (no temporal), retornar tal cual
      if (!imageUri.includes('rn_image_picker_lib_temp')) {
        console.log('✅ [IMAGE PICKER] Archivo ya es permanente, no necesita copia');
        return imageUri;
      }

      // Usar ImageResizer para copiar el archivo (sin redimensionar, solo copiar)
      // Esto crea una copia permanente en el cache de la app
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const outputPath = `permanent_avatar_${timestamp}_${random}.jpg`;
      
      console.log('📁 [IMAGE PICKER] Creando copia permanente con outputPath:', outputPath);
      
      const result = await ImageResizer.createResizedImage(
        imageUri,
        10000, // Dimensiones muy grandes para no redimensionar (solo copiar)
        10000,
        'JPEG',
        100, // Calidad máxima para no perder calidad
        0,
        outputPath, // outputPath explícito para crear archivo permanente
        true, // keepMetadata
        { mode: 'contain' }
      );

      console.log('✅ [IMAGE PICKER] Archivo copiado exitosamente a:', result.uri);
      return result.uri;
    } catch (error: any) {
      console.error('❌ [IMAGE PICKER] Error copiando archivo, usando URI original:', error);
      // Si falla la copia, retornar URI original (puede funcionar si el archivo aún existe)
      return imageUri;
    }
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    setIsImagePickerOpen(false);

    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      console.log('Error:', `Error al seleccionar la imagen: ${response.errorMessage || response.errorCode}`);
      return;
    }

    if (response.assets && response.assets[0] && response.assets[0].uri) {
      const imageUri = response.assets[0].uri;
      
      // En Android, copiar la imagen a un lugar permanente INMEDIATAMENTE
      // Esto debe hacerse de forma síncrona en el callback para que el archivo temporal aún exista
      if (Platform.OS === 'android') {
        console.log('📱 [IMAGE PICKER] Android detectado - copiando imagen inmediatamente');
        console.log('🔗 [IMAGE PICKER] URI original:', imageUri);
        copyImageToPermanentLocation(imageUri)
          .then((permanentUri) => {
            console.log('✅ [IMAGE PICKER] Imagen copiada exitosamente');
            console.log('🔗 [IMAGE PICKER] URI permanente:', permanentUri);
            setSelectedImage(permanentUri);
          })
          .catch((error) => {
            console.error('❌ [IMAGE PICKER] Error copiando imagen, usando original:', error);
            console.error('❌ [IMAGE PICKER] Error details:', error);
            // Usar original de todas formas - puede funcionar si el archivo aún existe
            setSelectedImage(imageUri);
          });
      } else {
        // En iOS, usar directamente
        setSelectedImage(imageUri);
      }
    }
  };

  const takePhoto = async () => {
    console.log('📱 [IMAGE PICKER] Abriendo cámara...');
    
    // Verificar permisos antes de abrir la cámara
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      return;
    }
    
    setIsImagePickerOpen(true);
    
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, handleImageResponse);
  };

  const pickImage = async () => {
    console.log('📱 [IMAGE PICKER] Abriendo galería...');
    
    // react-native-image-picker maneja los permisos internamente
    // NO verificar permisos manualmente - la librería lo hace automáticamente
    // En Android 13+, usa READ_MEDIA_IMAGES automáticamente
    
    setIsImagePickerOpen(true);
    
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    pickImage,
    takePhoto,
    clearImage,
    isImagePickerOpen,
  };
};

export default useImagePicker;
