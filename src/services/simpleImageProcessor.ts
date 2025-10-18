import ImageResizer from 'react-native-image-resizer';

export interface SimpleProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Procesador de imágenes simplificado y más robusto
 */
export const simpleProcessImage = async (
  imageUri: string,
  maxWidth: number = 800,
  quality: number = 85
): Promise<SimpleProcessedImage> => {
  try {
    console.log('🖼️ [SIMPLE PROCESSOR] Procesando imagen:', imageUri);
    console.log('📏 [SIMPLE PROCESSOR] Configuración:', { maxWidth, quality });

    // Obtener dimensiones de la imagen original
    const originalDimensions = await getImageDimensions(imageUri);
    console.log('📊 [SIMPLE PROCESSOR] Dimensiones originales:', originalDimensions.width, 'x', originalDimensions.height);

    // Calcular nuevas dimensiones manteniendo la proporción
    const aspectRatio = originalDimensions.width / originalDimensions.height;
    const newWidth = Math.min(maxWidth, originalDimensions.width);
    const newHeight = Math.round(newWidth / aspectRatio);

    console.log('📐 [SIMPLE PROCESSOR] Nuevas dimensiones:', newWidth, 'x', newHeight);

    // Procesar la imagen
    const result = await ImageResizer.createResizedImage(
      imageUri,
      newWidth,
      newHeight,
      'JPEG',
      quality,
      0, // rotation
      undefined, // outputPath
      false, // keepMetadata
      { mode: 'contain' }
    );

    const processedImage: SimpleProcessedImage = {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: result.size || 0
    };

    console.log('✅ [SIMPLE PROCESSOR] Imagen procesada exitosamente');
    console.log('📦 [SIMPLE PROCESSOR] Tamaño procesado:', result.size, 'bytes');
    console.log('🔗 [SIMPLE PROCESSOR] URI procesada:', result.uri);

    return processedImage;
  } catch (error) {
    console.error('❌ [SIMPLE PROCESSOR] Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Obtiene las dimensiones de una imagen
 */
const getImageDimensions = (imageUri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const { Image } = require('react-native');
    Image.getSize(
      imageUri,
      (width, height) => {
        console.log('📊 [SIMPLE PROCESSOR] Dimensiones obtenidas:', width, 'x', height);
        resolve({ width, height });
      },
      (error) => {
        console.error('❌ [SIMPLE PROCESSOR] Error obteniendo dimensiones:', error);
        reject(error);
      }
    );
  });
};

/**
 * Procesa múltiples imágenes de forma simple
 */
export const simpleProcessMultipleImages = async (
  imageUris: string[],
  maxWidth: number = 800,
  quality: number = 85
): Promise<SimpleProcessedImage[]> => {
  console.log('🖼️ [SIMPLE PROCESSOR] Procesando', imageUris.length, 'imágenes...');

  const processedImages: SimpleProcessedImage[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    try {
      console.log(`📸 [SIMPLE PROCESSOR] Procesando imagen ${i + 1}/${imageUris.length}`);
      const processedImage = await simpleProcessImage(imageUris[i], maxWidth, quality);
      processedImages.push(processedImage);
    } catch (error) {
      console.error(`❌ [SIMPLE PROCESSOR] Error procesando imagen ${i + 1}:`, error);
      // Continuar con las siguientes imágenes
    }
  }

  console.log('✅ [SIMPLE PROCESSOR] Procesamiento completado:', processedImages.length, 'imágenes');
  return processedImages;
};
