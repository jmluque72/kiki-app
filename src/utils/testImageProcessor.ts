import { processImage, ImageProcessingPresets } from '../services/imageProcessor';

/**
 * Función de prueba para verificar el procesamiento de imágenes
 * Esta función se puede llamar desde cualquier pantalla para probar el procesamiento
 */
export const testImageProcessing = async (imageUri: string) => {
  try {
    console.log('🧪 [TEST IMAGE PROCESSOR] Iniciando prueba de procesamiento...');
    console.log('📸 [TEST IMAGE PROCESSOR] Imagen de prueba:', imageUri);

    // Probar con configuración de avatar
    console.log('\n1️⃣ Probando configuración de avatar...');
    const avatarResult = await processImage(imageUri, ImageProcessingPresets.avatar);
    console.log('✅ Avatar procesado:', {
      width: avatarResult.width,
      height: avatarResult.height,
      size: avatarResult.size
    });

    // Probar con configuración de actividad
    console.log('\n2️⃣ Probando configuración de actividad...');
    const activityResult = await processImage(imageUri, ImageProcessingPresets.activity);
    console.log('✅ Actividad procesada:', {
      width: activityResult.width,
      height: activityResult.height,
      size: activityResult.size
    });

    // Probar con configuración de estudiante
    console.log('\n3️⃣ Probando configuración de estudiante...');
    const studentResult = await processImage(imageUri, ImageProcessingPresets.student);
    console.log('✅ Estudiante procesado:', {
      width: studentResult.width,
      height: studentResult.height,
      size: studentResult.size
    });

    // Resumen de resultados
    console.log('\n📊 [TEST IMAGE PROCESSOR] Resumen de resultados:');
    console.log('=' .repeat(50));
    console.log('Avatar (400px):', avatarResult.width, 'x', avatarResult.height, '-', avatarResult.size, 'bytes');
    console.log('Actividad (800px):', activityResult.width, 'x', activityResult.height, '-', activityResult.size, 'bytes');
    console.log('Estudiante (600px):', studentResult.width, 'x', studentResult.height, '-', studentResult.size, 'bytes');

    return {
      success: true,
      avatar: avatarResult,
      activity: activityResult,
      student: studentResult
    };

  } catch (error) {
    console.error('❌ [TEST IMAGE PROCESSOR] Error en prueba:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función para probar el procesamiento con una imagen específica
 * Útil para debugging
 */
export const testSpecificImage = async (imageUri: string, preset: any) => {
  try {
    console.log('🧪 [TEST SPECIFIC] Probando imagen específica...');
    console.log('📸 [TEST SPECIFIC] Imagen:', imageUri);
    console.log('⚙️ [TEST SPECIFIC] Configuración:', preset);

    const result = await processImage(imageUri, preset);
    
    console.log('✅ [TEST SPECIFIC] Resultado:', {
      width: result.width,
      height: result.height,
      size: result.size,
      uri: result.uri
    });

    return result;
  } catch (error) {
    console.error('❌ [TEST SPECIFIC] Error:', error);
    throw error;
  }
};
