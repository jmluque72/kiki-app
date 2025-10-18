// Debug script para probar el procesamiento de imágenes
import { processImage, ImageProcessingPresets } from './src/services/imageProcessor';

const debugImageProcessing = async (imageUri) => {
  console.log('🔍 [DEBUG] Iniciando debug de procesamiento de imágenes...');
  console.log('🔍 [DEBUG] URI de imagen:', imageUri);
  
  try {
    // Probar con preset de actividad
    console.log('🔍 [DEBUG] Probando con preset de actividad...');
    const result = await processImage(imageUri, ImageProcessingPresets.activity);
    
    console.log('✅ [DEBUG] Procesamiento exitoso:');
    console.log('📏 [DEBUG] Dimensiones:', result.width, 'x', result.height);
    console.log('📦 [DEBUG] Tamaño:', result.size, 'bytes');
    console.log('🔗 [DEBUG] URI procesada:', result.uri);
    
    return result;
  } catch (error) {
    console.error('❌ [DEBUG] Error en el procesamiento:', error);
    console.error('❌ [DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

export default debugImageProcessing;
