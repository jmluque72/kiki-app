import { processImage, processMultipleImages, ImageProcessingPresets } from './imageProcessor';
import { Platform } from 'react-native';

export interface ActivityImageUpload {
  imageUri: string;
  processedImage?: any;
}

/**
 * Procesa y sube una imagen para una actividad
 * @param imageUri - URI de la imagen
 * @returns Promise con la imagen procesada
 */
export const processActivityImage = async (imageUri: string) => {
  try {
    console.log('🖼️ [ACTIVITY IMAGE] Procesando imagen para actividad:', imageUri);
    
    // Procesar la imagen con configuración para actividades
    const processedImage = await processImage(imageUri, ImageProcessingPresets.activity);
    
    console.log('✅ [ACTIVITY IMAGE] Imagen procesada:', processedImage.width, 'x', processedImage.height);
    
    return processedImage;
  } catch (error) {
    console.error('❌ [ACTIVITY IMAGE] Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Procesa múltiples imágenes para una actividad
 * @param imageUris - Array de URIs de imágenes
 * @returns Promise con las imágenes procesadas
 */
export const processActivityImages = async (imageUris: string[]) => {
  try {
    console.log('🖼️ [ACTIVITY IMAGE] Procesando', imageUris.length, 'imágenes para actividad');
    
    // Procesar todas las imágenes con configuración para actividades
    const processedImages = await processMultipleImages(imageUris, ImageProcessingPresets.activity);
    
    console.log('✅ [ACTIVITY IMAGE] Imágenes procesadas:', processedImages.length);
    
    return processedImages;
  } catch (error) {
    console.error('❌ [ACTIVITY IMAGE] Error procesando imágenes:', error);
    throw error;
  }
};

/**
 * Prepara las imágenes para subir a S3
 * @param processedImages - Array de imágenes procesadas
 * @returns Array de objetos FormData listos para subir
 */
export const prepareImagesForUpload = (processedImages: any[]) => {
  const formDataArray = [];
  
  for (let i = 0; i < processedImages.length; i++) {
    const image = processedImages[i];
    const formData = new FormData();
    
    // Obtener el nombre del archivo de la URI
    const fileName = image.uri.split('/').pop() || `activity-image-${i}.jpg`;
    
    // Verificar el tipo de URI en Android
    if (Platform.OS === 'android') {
      console.log(`📱 [ACTIVITY IMAGE] Android - URI tipo: ${image.uri.substring(0, 10)}...`);
      if (image.uri.startsWith('content://')) {
        console.warn('⚠️ [ACTIVITY IMAGE] ADVERTENCIA: URI es content:// en Android, puede causar problemas en FormData');
        console.warn('⚠️ [ACTIVITY IMAGE] URI completa:', image.uri);
      } else if (image.uri.startsWith('file://')) {
        console.log('✅ [ACTIVITY IMAGE] URI es file://, debería funcionar correctamente');
      }
    }
    
    // Agregar la imagen al FormData
    const imageFile = {
      uri: image.uri,
      type: 'image/jpeg',
      name: fileName,
    } as any;
    
    console.log(`📤 [ACTIVITY IMAGE] Preparando imagen ${i + 1}:`, {
      uri: image.uri.substring(0, 50) + '...',
      fileName,
      platform: Platform.OS
    });
    
    formData.append('image', imageFile);
    formDataArray.push(formData);
  }
  
  console.log('📦 [ACTIVITY IMAGE] Preparadas', formDataArray.length, 'imágenes para subir');
  
  return formDataArray;
};
