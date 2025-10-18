// Test simple para verificar el procesamiento de imágenes
// Este archivo se puede importar y usar para probar el procesamiento

import { processImage, ImageProcessingPresets } from './src/services/imageProcessor';

// Función de test que se puede llamar desde la consola
export const testImageProcessing = async (imageUri) => {
  console.log('🧪 [TEST] Iniciando test de procesamiento...');
  console.log('🧪 [TEST] URI de imagen:', imageUri);
  
  try {
    // Test con preset de actividad
    console.log('🧪 [TEST] Procesando con preset de actividad...');
    const result = await processImage(imageUri, ImageProcessingPresets.activity);
    
    console.log('✅ [TEST] Test exitoso:');
    console.log('📏 [TEST] Dimensiones:', result.width, 'x', result.height);
    console.log('📦 [TEST] Tamaño:', result.size, 'bytes');
    console.log('🔗 [TEST] URI procesada:', result.uri);
    
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('❌ [TEST] Test falló:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para probar con una imagen de ejemplo
export const testWithSampleImage = async () => {
  // Esta función se puede llamar para probar con una imagen de ejemplo
  console.log('🧪 [TEST] Probando con imagen de ejemplo...');
  
  // Nota: Necesitarías una URI de imagen real para probar
  const sampleUri = 'file:///path/to/sample/image.jpg';
  
  return await testImageProcessing(sampleUri);
};

export default testImageProcessing;
