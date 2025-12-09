// Detox v19 - Configuración para Jest
const detox = require('detox');
const { device } = require('detox');
const config = require('../detox.config');
const adapter = require('detox/runners/jest/adapter');

// Configurar timeout global
jest.setTimeout(120000);

// Registrar el adapter como reporter de Jasmine (requerido por Detox)
if (typeof jasmine !== 'undefined' && jasmine.getEnv) {
  jasmine.getEnv().addReporter(adapter);
}

beforeAll(async () => {
  try {
    await detox.init(config, { initGlobals: false });
  } catch (error) {
    // Ignorar errores de terminación si la app no está corriendo
    // Estos errores pueden venir de Detox internamente o del child process
    const errorMessage = error.message || '';
    const errorString = JSON.stringify(error) || '';
    
    if (
      errorMessage.includes('found nothing to terminate') ||
      errorMessage.includes('failed to terminate') ||
      errorMessage.includes('terminate') ||
      errorString.includes('found nothing to terminate') ||
      error.code === 3 ||
      (error.childProcess && error.childProcess.stderr && error.childProcess.stderr.includes('found nothing to terminate'))
    ) {
      console.log('⚠️ [INIT] App no estaba corriendo (esto es normal)');
      console.log('⚠️ [INIT] Continuando con la inicialización...');
      // Continuar con la inicialización aunque haya fallado el terminate
      // Detox puede continuar normalmente
    } else {
      console.error('❌ [INIT] Error inesperado durante init:', error);
      throw error;
    }
  }
  
  // Con launchApp: 'auto', Detox lanzará la app automáticamente después de init
  // Configuramos permisos y sincronización
  console.log('🚀 [INIT] Configurando Detox...');
  
  // La sincronización se configura automáticamente en Detox v19+
  // No es necesario llamar setSynchronization manualmente
  
  // Lanzar la app con permisos (usar newInstance: true para evitar conflictos)
  try {
    await device.launchApp({
      permissions: {
        camera: 'YES',
        photos: 'YES',
        notifications: 'YES',
      },
      newInstance: true, // Crear nueva instancia para evitar problemas de terminación
    });
    console.log('✅ [INIT] App lanzada con permisos');
  } catch (error) {
    // Si falla, intentar sin newInstance
    if (error.message && error.message.includes('terminate')) {
      console.log('⚠️ [INIT] Reintentando lanzamiento sin newInstance...');
      await device.launchApp({
        permissions: {
          camera: 'YES',
          photos: 'YES',
          notifications: 'YES',
        },
        newInstance: false,
      });
      console.log('✅ [INIT] App lanzada con permisos (segundo intento)');
    } else {
      throw error;
    }
  }
  
  console.log('✅ [INIT] Detox inicializado y sincronización configurada');
}, 300000);

beforeEach(async () => {
  process.stdout.write('\n🔄 ============================================\n');
  process.stdout.write('🔄 [BEFORE EACH] Iniciando beforeEach...\n');
  process.stdout.write('🔄 ============================================\n\n');
  
  try {
    process.stdout.write('🔄 [BEFORE EACH] Llamando adapter.beforeEach()...\n');
    await adapter.beforeEach();
    process.stdout.write('✅ [BEFORE EACH] Adapter beforeEach completado\n\n');
  } catch (e) {
    process.stdout.write(`❌ [BEFORE EACH] Error en adapter.beforeEach(): ${e.message}\n`);
    throw e;
  }
  
  // Solo recargar React Native sin relanzar la app para evitar desinstalación
  try {
    process.stdout.write('🔄 [BEFORE EACH] Recargando React Native...\n');
    await Promise.race([
      device.reloadReactNative(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    process.stdout.write('✅ [BEFORE EACH] React Native recargado\n\n');
  } catch (e) {
    process.stdout.write(`⚠️ [BEFORE EACH] reloadReactNative falló o timeout: ${e.message}\n`);
    process.stdout.write('⚠️ [BEFORE EACH] Continuando sin reload...\n\n');
    // No intentar lanzar la app de nuevo, solo continuar
  }
  
  // Esperar a que la app esté lista antes de continuar
  try {
    process.stdout.write('🔄 [BEFORE EACH] Esperando que la app esté activa...\n');
    await Promise.race([
      device.waitForActive(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    process.stdout.write('✅ [BEFORE EACH] App activa\n\n');
  } catch (e) {
    process.stdout.write(`⚠️ [BEFORE EACH] waitForActive falló o timeout: ${e.message}\n`);
    process.stdout.write('⚠️ [BEFORE EACH] Continuando...\n\n');
  }
  
  // Delay inicial para asegurar que todo esté cargado
  process.stdout.write('⏳ [BEFORE EACH] Esperando 1 segundo para que la UI esté lista...\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  process.stdout.write('✅ [BEFORE EACH] beforeEach completado\n\n');
});

afterAll(async () => {
  try {
    await adapter.afterAll();
  } catch (error) {
    // Ignorar errores de terminación durante cleanup
    if (error.message && error.message.includes('terminate')) {
      console.log('⚠️ [CLEANUP] Error de terminación ignorado durante cleanup');
    } else {
      throw error;
    }
  }
  
  try {
    await detox.cleanup();
  } catch (error) {
    // Ignorar errores de terminación durante cleanup
    if (error.message && (
      error.message.includes('found nothing to terminate') ||
      error.message.includes('failed to terminate') ||
      error.code === 3
    )) {
      console.log('⚠️ [CLEANUP] Error de terminación ignorado (app no estaba corriendo)');
    } else {
      throw error;
    }
  }
});
