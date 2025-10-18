import { useState } from 'react';
import { Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { checkImagePermissions, checkCameraPermissions } from '../utils/permissionUtils';

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

  const handleImageResponse = (response: ImagePickerResponse) => {
    setIsImagePickerOpen(false);

    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      console.log('Error:', `Error al seleccionar la imagen: ${response.errorMessage || response.errorCode}`);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        setSelectedImage(asset.uri);
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
    
    // Verificar permisos antes de abrir la galería
    const hasPermission = await checkImagePermissions();
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
