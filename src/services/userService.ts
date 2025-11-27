import { Platform } from 'react-native';
import { apiClient } from './api';
import AsyncStorage from '../utils/storage';
import { processImage, ImageProcessingPresets } from './imageProcessor';
import { API_FULL_URL } from '../config/apiConfig';

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
      
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      
      let imageFile: any;
      
      // En Android, usar la imagen directamente (ya fue copiada a lugar permanente en useImagePicker)
      // Si falló la copia, usar la original de todas formas (puede funcionar si el archivo aún existe)
      // En iOS, procesar la imagen primero
      if (Platform.OS === 'android') {
        console.log('📱 [UserService] Android - usando imagen directamente');
        
        // Verificar si la URI es temporal (falló la copia)
        let imageUriToUse = imageUri;
        if (imageUri.includes('rn_image_picker_lib_temp')) {
          console.warn('⚠️ [UserService] ADVERTENCIA: URI es archivo temporal en Android');
          console.warn('⚠️ [UserService] Esto puede causar "Network Error" si el archivo ya no es accesible');
          console.warn('⚠️ [UserService] Intentando subir de todas formas con fetch...');
        }
        
        // Asegurar que la URI tenga el prefijo file:// si no lo tiene
        if (!imageUriToUse.startsWith('file://') && !imageUriToUse.startsWith('content://')) {
          imageUriToUse = `file://${imageUriToUse}`;
        }
        
        // Obtener el nombre del archivo de la URI
        const fileName = imageUri.split('/').pop() || 'avatar.jpg';
        const fileType = 'image/jpeg';
        
        console.log('🖼️ [UserService] File name:', fileName);
        console.log('🖼️ [UserService] File type:', fileType);
        console.log('🔗 [UserService] URI final:', imageUriToUse.substring(0, 80) + '...');
        
        imageFile = {
          uri: imageUriToUse,
          type: fileType,
          name: fileName,
        } as any;
      } else {
        // En iOS, procesar la imagen antes de subirla
        console.log('🍎 [UserService] iOS - procesando imagen...');
        const processedImage = await processImage(imageUri, ImageProcessingPresets.avatar);
        console.log('✅ [UserService] Imagen procesada:', processedImage.width, 'x', processedImage.height);
        
        // Obtener el nombre del archivo de la URI
        const fileName = imageUri.split('/').pop() || 'avatar.jpg';
        const fileType = 'image/jpeg'; // Siempre JPEG después del procesamiento
        
        console.log('🖼️ [UserService] File name:', fileName);
        console.log('🖼️ [UserService] File type:', fileType);
        
        imageFile = {
          uri: processedImage.uri,
          type: fileType,
          name: fileName,
        } as any;
      }
      
      formData.append('avatar', imageFile);
      
      console.log('🖼️ [UserService] FormData creado, enviando request...');
      
      // Obtener el token del storage
      let currentToken: string | null = null;
      try {
        const RefreshTokenService = require('./refreshTokenService').default;
        currentToken = await RefreshTokenService.getAccessToken();
        console.log('🔑 [UserService] Token obtenido del storage');
      } catch (tokenError) {
        console.error('❌ [UserService] Error obteniendo token:', tokenError);
      }
      
      if (!currentToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      let result: UpdateAvatarResponse;
      
      // En Android, usar fetch directamente (más confiable para archivos)
      if (Platform.OS === 'android') {
        console.log('📱 [UserService] Android - usando fetch directamente');
        
        const fetchResponse = await fetch(`${API_FULL_URL}/users/avatar`, {
          method: 'PUT',
          body: formData,
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            // NO incluir Content-Type - fetch lo establecerá automáticamente con boundary
          },
        });
        
        console.log('📡 [UserService] Response status:', fetchResponse.status);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('❌ [UserService] Error response:', errorText);
          
          // Si es 401, el token puede estar expirado
          if (fetchResponse.status === 401) {
            console.log('🔄 [UserService] Token expirado, intentando refresh...');
            try {
              const RefreshTokenService = require('./refreshTokenService').default;
              const newToken = await RefreshTokenService.refreshAccessToken();
              if (newToken) {
                console.log('✅ [UserService] Token renovado, reintentando upload...');
                const retryResponse = await fetch(`${API_FULL_URL}/users/avatar`, {
                  method: 'PUT',
                  body: formData,
                  headers: {
                    'Authorization': `Bearer ${newToken}`,
                  },
                });
                
                if (!retryResponse.ok) {
                  const retryErrorText = await retryResponse.text();
                  throw new Error(`Error ${retryResponse.status}: ${retryErrorText}`);
                }
                
                result = await retryResponse.json();
                console.log('✅ [UserService] Avatar subido con fetch después de refresh:', result);
              } else {
                throw new Error(`Error ${fetchResponse.status}: ${errorText}`);
              }
            } catch (refreshError) {
              console.error('❌ [UserService] Error refrescando token:', refreshError);
              throw new Error(`Error de autenticación: ${errorText}`);
            }
          } else {
            throw new Error(`Error ${fetchResponse.status}: ${errorText}`);
          }
        } else {
          result = await fetchResponse.json();
          console.log('✅ [UserService] Avatar subido con fetch:', result);
        }
      } else {
        // En iOS, usar apiClient (funciona bien)
        const response = await apiClient.put('/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        result = response.data;
      }
      
      console.log('✅ [UserService] Avatar actualizado exitosamente');
      console.log('✅ [UserService] Response:', result);
      
      return result;
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
