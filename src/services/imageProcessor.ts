import { Image } from 'react-native';
import ImageResizer from 'react-native-image-resizer';

export interface ImageProcessingOptions {
  maxWidth?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG';
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Procesa una imagen para optimizarla antes de subirla al servidor
 * @param imageUri - URI de la imagen original
 * @param options - Opciones de procesamiento
 * @returns Promise<ProcessedImage> - Imagen procesada
 */
export const processImage = async (
  imageUri: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
  const {
    maxWidth = 800,
    quality = 0.85,
    format = 'JPEG'
  } = options;

  try {
    console.log('🖼️ [IMAGE PROCESSOR] Procesando imagen:', imageUri);
    console.log('📏 [IMAGE PROCESSOR] Ancho máximo:', maxWidth, 'px');

    // Obtener dimensiones de la imagen
    const imageInfo = await getImageInfo(imageUri);
    console.log('📊 [IMAGE PROCESSOR] Dimensiones originales:', imageInfo.width, 'x', imageInfo.height);

    // Verificar si la imagen ya es más pequeña que el ancho máximo
    if (imageInfo.width <= maxWidth) {
      console.log('✅ [IMAGE PROCESSOR] Imagen ya es más pequeña que', maxWidth, 'px, optimizando calidad...');
      
      // Aunque no necesite redimensionar, podemos optimizar la calidad
      const result = await ImageResizer.createResizedImage(
        imageUri,
        imageInfo.width,
        imageInfo.height,
        format,
        quality * 100, // Convertir a porcentaje (0-100)
        0, // rotation
        undefined, // outputPath
        false, // keepMetadata
        { mode: 'contain' }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: result.size || 0
      };
    }

    // Calcular nuevas dimensiones manteniendo la proporción
    const aspectRatio = imageInfo.width / imageInfo.height;
    const newWidth = maxWidth;
    const newHeight = Math.round(maxWidth / aspectRatio);

    console.log('📐 [IMAGE PROCESSOR] Nuevas dimensiones:', newWidth, 'x', newHeight);

    // Usar react-native-image-resizer para procesar la imagen
    console.log('🖼️ [IMAGE PROCESSOR] Redimensionando imagen...');
    
    const result = await ImageResizer.createResizedImage(
      imageUri,
      newWidth,
      newHeight,
      format,
      quality * 100, // Convertir a porcentaje (0-100)
      0, // rotation
      undefined, // outputPath
      false, // keepMetadata
      { mode: 'contain' }
    );

    const processedImage: ProcessedImage = {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: result.size || 0
    };

    console.log('✅ [IMAGE PROCESSOR] Imagen procesada exitosamente');
    console.log('📦 [IMAGE PROCESSOR] Tamaño original:', (imageInfo.size || 0), 'bytes');
    console.log('📦 [IMAGE PROCESSOR] Tamaño procesado:', result.size, 'bytes');
    console.log('📊 [IMAGE PROCESSOR] Reducción:', result.size && imageInfo.size ? 
      ((1 - result.size / imageInfo.size) * 100).toFixed(1) + '%' : 'N/A');

    return processedImage;
  } catch (error) {
    console.error('❌ [IMAGE PROCESSOR] Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Obtiene información de una imagen
 * @param imageUri - URI de la imagen
 * @returns Promise con información de la imagen
 */
const getImageInfo = (imageUri: string): Promise<{
  width: number;
  height: number;
  size?: number;
}> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (width, height) => {
        console.log('📊 [IMAGE PROCESSOR] Imagen cargada:', width, 'x', height);
        resolve({ width, height });
      },
      (error) => {
        console.error('❌ [IMAGE PROCESSOR] Error obteniendo dimensiones:', error);
        reject(error);
      }
    );
  });
};

/**
 * Optimiza múltiples imágenes
 * @param imageUris - Array de URIs de imágenes
 * @param options - Opciones de procesamiento
 * @returns Promise<ProcessedImage[]> - Array de imágenes procesadas
 */
export const processMultipleImages = async (
  imageUris: string[],
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage[]> => {
  console.log('🖼️ [IMAGE PROCESSOR] Procesando', imageUris.length, 'imágenes...');

  const processedImages: ProcessedImage[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    try {
      console.log(`📸 [IMAGE PROCESSOR] Procesando imagen ${i + 1}/${imageUris.length}`);
      const processedImage = await processImage(imageUris[i], options);
      processedImages.push(processedImage);
    } catch (error) {
      console.error(`❌ [IMAGE PROCESSOR] Error procesando imagen ${i + 1}:`, error);
      // Continuar con las siguientes imágenes
    }
  }

  console.log('✅ [IMAGE PROCESSOR] Procesamiento completado:', processedImages.length, 'imágenes');
  return processedImages;
};

/**
 * Configuración recomendada para diferentes tipos de imágenes
 */
export const ImageProcessingPresets = {
  // Para avatares de usuario
  avatar: {
    maxWidth: 400,
    quality: 0.8,
    format: 'JPEG' as const
  },
  
  // Para imágenes de actividades
  activity: {
    maxWidth: 800,
    quality: 0.85,
    format: 'JPEG' as const
  },
  
  // Para fotos de estudiantes
  student: {
    maxWidth: 600,
    quality: 0.8,
    format: 'JPEG' as const
  },
  
  // Para imágenes de alta calidad
  highQuality: {
    maxWidth: 1200,
    quality: 0.9,
    format: 'JPEG' as const
  }
};
