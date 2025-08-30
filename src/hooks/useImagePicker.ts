import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

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
      Alert.alert('Error', `Error al seleccionar la imagen: ${response.errorMessage || response.errorCode}`);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        setSelectedImage(asset.uri);
      }
    }
  };

  const takePhoto = () => {
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

  const pickImage = () => {
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
