const fs = require('fs');
const path = require('path');

function clearAppCache() {
  console.log('🧹 [CLEAR CACHE] Limpiando caché de la app...');
  
  try {
    // Limpiar caché de React Native
    console.log('📱 [CLEAR CACHE] Limpiando caché de React Native...');
    
    // Limpiar node_modules/.cache si existe
    const nodeModulesCache = path.join(__dirname, 'node_modules', '.cache');
    if (fs.existsSync(nodeModulesCache)) {
      fs.rmSync(nodeModulesCache, { recursive: true, force: true });
      console.log('✅ [CLEAR CACHE] Caché de node_modules limpiada');
    }
    
    // Limpiar caché de Metro
    const metroCache = path.join(__dirname, 'node_modules', 'metro-cache');
    if (fs.existsSync(metroCache)) {
      fs.rmSync(metroCache, { recursive: true, force: true });
      console.log('✅ [CLEAR CACHE] Caché de Metro limpiada');
    }
    
    // Limpiar caché de React Native
    const rnCache = path.join(__dirname, 'node_modules', 'react-native', '.cache');
    if (fs.existsSync(rnCache)) {
      fs.rmSync(rnCache, { recursive: true, force: true });
      console.log('✅ [CLEAR CACHE] Caché de React Native limpiada');
    }
    
    console.log('✅ [CLEAR CACHE] Caché limpiada exitosamente');
    console.log('📱 [CLEAR CACHE] Ahora ejecuta:');
    console.log('   npx react-native start --reset-cache');
    console.log('   o');
    console.log('   cd android && ./gradlew clean && cd ..');
    console.log('   cd ios && xcodebuild clean && cd ..');
    
  } catch (error) {
    console.error('❌ [CLEAR CACHE] Error limpiando caché:', error.message);
  }
}

clearAppCache();
