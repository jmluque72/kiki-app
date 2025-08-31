import { processImage, processMultipleImages, ImageProcessingPresets } from './imageProcessor';

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
    
    // Agregar la imagen al FormData
    const imageFile = {
      uri: image.uri,
      type: 'image/jpeg',
      name: fileName,
    } as any;
    
    formData.append('image', imageFile);
    formDataArray.push(formData);
  }
  
  console.log('📦 [ACTIVITY IMAGE] Preparadas', formDataArray.length, 'imágenes para subir');
  
  return formDataArray;
};
