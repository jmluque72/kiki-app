// Test simple para verificar el procesamiento de imágenes
import { processImage, ImageProcessingPresets } from './src/services/imageProcessor';

const testImageProcessing = async () => {
  try {
    console.log('🧪 [TEST] Iniciando test de procesamiento de imágenes...');
    
    // Simular una URI de imagen
    const testImageUri = 'file:///path/to/test/image.jpg';
    
    console.log('🧪 [TEST] Procesando imagen con preset de actividad...');
    const result = await processImage(testImageUri, ImageProcessingPresets.activity);
    
    console.log('✅ [TEST] Resultado del procesamiento:');
    console.log('📏 [TEST] Dimensiones:', result.width, 'x', result.height);
    console.log('📦 [TEST] Tamaño:', result.size, 'bytes');
    console.log('🔗 [TEST] URI procesada:', result.uri);
    
    return result;
  } catch (error) {
    console.error('❌ [TEST] Error en el test:', error);
    throw error;
  }
};

export default testImageProcessing;
