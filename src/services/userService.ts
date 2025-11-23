import { apiClient } from './api';
import AsyncStorage from '../utils/storage';
import { processImage, ImageProcessingPresets } from './imageProcessor';

export interface UpdateAvatarResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: string;
      role: any;
    };
  };
}

export class UserService {
  static async updateAvatar(imageUri: string): Promise<UpdateAvatarResponse> {
    try {
      console.log('🖼️ [UserService] Actualizando avatar');
      console.log('🖼️ [UserService] Image URI:', imageUri);
      
      // Procesar la imagen antes de subirla
      console.log('🖼️ [UserService] Procesando imagen...');
      const processedImage = await processImage(imageUri, ImageProcessingPresets.avatar);
      console.log('✅ [UserService] Imagen procesada:', processedImage.width, 'x', processedImage.height);
      
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      
      // Obtener el nombre del archivo de la URI
      const fileName = imageUri.split('/').pop() || 'avatar.jpg';
      const fileType = 'image/jpeg'; // Siempre JPEG después del procesamiento
      
      console.log('🖼️ [UserService] File name:', fileName);
      console.log('🖼️ [UserService] File type:', fileType);
      
      // Agregar la imagen procesada al FormData
      const imageFile = {
        uri: processedImage.uri,
        type: fileType,
        name: fileName,
      } as any;
      
      formData.append('avatar', imageFile);
      
      console.log('🖼️ [UserService] FormData creado, enviando request...');
      
      const response = await apiClient.put('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ [UserService] Avatar actualizado exitosamente');
      console.log('✅ [UserService] Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [UserService] Error actualizando avatar:', error);
      console.error('❌ [UserService] Error response:', error.response?.data);
      console.error('❌ [UserService] Error status:', error.response?.status);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Error al actualizar el avatar'
      };
    }
  }
}
