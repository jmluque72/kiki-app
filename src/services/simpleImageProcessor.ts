import ImageResizer from 'react-native-image-resizer';
import { Platform } from 'react-native';

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
    console.log('📱 [SIMPLE PROCESSOR] Plataforma:', Platform.OS);

    // En Android, SIEMPRE especificar un outputPath explícito para archivos temporales
    // Esto asegura que ImageResizer copie el archivo a un lugar permanente antes de procesarlo
    let outputPath: string | undefined = undefined;
    if (Platform.OS === 'android') {
      // Generar un nombre único para el archivo procesado
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      outputPath = `resized_${timestamp}_${random}.jpg`;
      console.log('📁 [SIMPLE PROCESSOR] OutputPath para Android:', outputPath);
      console.log('📁 [SIMPLE PROCESSOR] Esto copiará el archivo temporal a un lugar permanente');
    }

    // En Android, procesar directamente sin obtener dimensiones primero
    // Esto evita problemas con archivos temporales que pueden ser eliminados
    // ImageResizer calculará las dimensiones automáticamente y mantendrá la proporción
    let result: any;
    
    if (Platform.OS === 'android') {
      // En Android, procesar directamente con maxWidth
      // ImageResizer mantendrá la proporción automáticamente
      console.log('📐 [SIMPLE PROCESSOR] Procesando directamente en Android (maxWidth:', maxWidth, ')');
      result = await ImageResizer.createResizedImage(
        imageUri,
        maxWidth,
        maxWidth, // ImageResizer ajustará automáticamente manteniendo proporción
        'JPEG',
        quality,
        0, // rotation
        outputPath, // outputPath explícito para asegurar URI file:// permanente
        false, // keepMetadata
        { mode: 'contain' } // Mantener proporción
      );
    } else {
      // En iOS, obtener dimensiones primero para mejor control
      try {
        const originalDimensions = await getImageDimensions(imageUri);
        console.log('📊 [SIMPLE PROCESSOR] Dimensiones originales:', originalDimensions.width, 'x', originalDimensions.height);
        
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        const newWidth = Math.min(maxWidth, originalDimensions.width);
        const newHeight = Math.round(newWidth / aspectRatio);
        
        console.log('📐 [SIMPLE PROCESSOR] Nuevas dimensiones:', newWidth, 'x', newHeight);
        
        result = await ImageResizer.createResizedImage(
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
      } catch (dimError: any) {
        console.warn('⚠️ [SIMPLE PROCESSOR] No se pudieron obtener dimensiones en iOS, procesando directamente');
        // Fallback: procesar directamente
        result = await ImageResizer.createResizedImage(
          imageUri,
          maxWidth,
          maxWidth,
          'JPEG',
          quality,
          0,
          undefined,
          false,
          { mode: 'contain' }
        );
      }
    }

    // Verificar y normalizar la URI en Android
    let finalUri = result.uri;
    if (Platform.OS === 'android') {
      // Si la URI resultante no es file://, intentar normalizarla
      if (!finalUri.startsWith('file://')) {
        console.log('⚠️ [SIMPLE PROCESSOR] URI no es file://, normalizando...');
        // Si no empieza con file://, agregarlo si es un path absoluto
        if (finalUri.startsWith('/')) {
          finalUri = `file://${finalUri}`;
        } else if (finalUri.startsWith('content://')) {
          // Si es content://, intentar usar la URI tal cual (puede funcionar en algunos casos)
          console.log('⚠️ [SIMPLE PROCESSOR] URI es content://, puede causar problemas en FormData');
          // En este caso, la URI puede no funcionar, pero lo intentamos
        }
      }
    }

    const processedImage: SimpleProcessedImage = {
      uri: finalUri,
      width: result.width,
      height: result.height,
      size: result.size || 0
    };

    console.log('✅ [SIMPLE PROCESSOR] Imagen procesada exitosamente');
    console.log('📦 [SIMPLE PROCESSOR] Tamaño procesado:', result.size, 'bytes');
    console.log('🔗 [SIMPLE PROCESSOR] URI original:', result.uri);
    console.log('🔗 [SIMPLE PROCESSOR] URI final normalizada:', finalUri);

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
    console.log('📏 [SIMPLE PROCESSOR] Obteniendo dimensiones de:', imageUri.substring(0, 50) + '...');
    
    Image.getSize(
      imageUri,
      (width, height) => {
        console.log('✅ [SIMPLE PROCESSOR] Dimensiones obtenidas:', width, 'x', height);
        resolve({ width, height });
      },
      (error: any) => {
        console.error('❌ [SIMPLE PROCESSOR] Error obteniendo dimensiones:', error);
        console.error('❌ [SIMPLE PROCESSOR] Error details:', {
          message: error?.message,
          code: error?.code,
          name: error?.name,
          uri: imageUri.substring(0, 50) + '...'
        });
        reject(new Error(`No se pudieron obtener las dimensiones de la imagen: ${error?.message || 'Error desconocido'}`));
      }
    );
  });
};

/**
 * Procesa múltiples imágenes de forma simple
 * En Android, retorna las imágenes originales sin procesar para evitar problemas con archivos temporales
 */
export const simpleProcessMultipleImages = async (
  imageUris: string[],
  maxWidth: number = 800,
  quality: number = 85
): Promise<SimpleProcessedImage[]> => {
  console.log('🖼️ [SIMPLE PROCESSOR] Procesando', imageUris.length, 'imágenes...');
  console.log('📱 [SIMPLE PROCESSOR] Plataforma:', Platform.OS);

  // En Android, NO procesar imágenes - retornar las originales directamente
  // Esto evita problemas con archivos temporales que se eliminan
  if (Platform.OS === 'android') {
    console.log('📱 [SIMPLE PROCESSOR] Android detectado - retornando imágenes originales sin procesar');
    const originalImages: SimpleProcessedImage[] = imageUris.map((uri, index) => ({
      uri: uri,
      width: maxWidth, // Valores por defecto
      height: maxWidth,
      size: 0 // Tamaño desconocido
    }));
    console.log('✅ [SIMPLE PROCESSOR] Retornando', originalImages.length, 'imágenes originales para Android');
    return originalImages;
  }

  // En iOS, procesar normalmente
  const processedImages: SimpleProcessedImage[] = [];

  const errors: any[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    try {
      console.log(`📸 [SIMPLE PROCESSOR] Procesando imagen ${i + 1}/${imageUris.length}`);
      console.log(`🔗 [SIMPLE PROCESSOR] URI de imagen ${i + 1}:`, imageUris[i]);
      const processedImage = await simpleProcessImage(imageUris[i], maxWidth, quality);
      processedImages.push(processedImage);
      console.log(`✅ [SIMPLE PROCESSOR] Imagen ${i + 1} procesada exitosamente`);
    } catch (error: any) {
      console.error(`❌ [SIMPLE PROCESSOR] Error procesando imagen ${i + 1}:`, error);
      console.error(`❌ [SIMPLE PROCESSOR] Error details:`, {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        name: error?.name
      });
      errors.push({
        index: i + 1,
        uri: imageUris[i],
        error: error?.message || 'Error desconocido'
      });
      // Continuar con las siguientes imágenes
    }
  }

  console.log('✅ [SIMPLE PROCESSOR] Procesamiento completado:', processedImages.length, 'imágenes de', imageUris.length);
  
  // Si no se procesó ninguna imagen y había imágenes para procesar, lanzar error
  if (processedImages.length === 0 && imageUris.length > 0) {
    console.error('❌ [SIMPLE PROCESSOR] ERROR CRÍTICO: No se procesó ninguna imagen');
    console.error('❌ [SIMPLE PROCESSOR] Errores encontrados:', errors);
    const errorMessage = errors.length > 0 
      ? `No se pudieron procesar las imágenes. Errores: ${errors.map(e => `Imagen ${e.index}: ${e.error}`).join('; ')}`
      : 'No se pudieron procesar las imágenes. Por favor, intenta nuevamente.';
    throw new Error(errorMessage);
  }
  
  // Si algunas imágenes fallaron pero otras no, advertir
  if (errors.length > 0 && processedImages.length > 0) {
    console.warn(`⚠️ [SIMPLE PROCESSOR] ADVERTENCIA: ${errors.length} imagen(es) fallaron, pero ${processedImages.length} se procesaron correctamente`);
  }
  
  return processedImages;
};
