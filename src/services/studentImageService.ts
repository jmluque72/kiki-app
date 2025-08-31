import { processImage, ImageProcessingPresets } from './imageProcessor';

/**
 * Procesa una imagen de estudiante antes de subirla
 * @param imageUri - URI de la imagen
 * @returns Promise con la imagen procesada
 */
export const processStudentImage = async (imageUri: string) => {
  try {
    console.log('🖼️ [STUDENT IMAGE] Procesando imagen de estudiante:', imageUri);
    
    // Procesar la imagen con configuración para estudiantes
    const processedImage = await processImage(imageUri, ImageProcessingPresets.student);
    
    console.log('✅ [STUDENT IMAGE] Imagen procesada:', processedImage.width, 'x', processedImage.height);
    
    return processedImage;
  } catch (error) {
    console.error('❌ [STUDENT IMAGE] Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Prepara la imagen de estudiante para subir
 * @param processedImage - Imagen procesada
 * @returns FormData listo para subir
 */
export const prepareStudentImageForUpload = (processedImage: any) => {
  const formData = new FormData();
  
  // Obtener el nombre del archivo de la URI
  const fileName = processedImage.uri.split('/').pop() || 'student-image.jpg';
  
  // Agregar la imagen al FormData
  const imageFile = {
    uri: processedImage.uri,
    type: 'image/jpeg',
    name: fileName,
  } as any;
  
  formData.append('avatar', imageFile);
  
  console.log('📦 [STUDENT IMAGE] Imagen preparada para subir:', fileName);
  
  return formData;
};
