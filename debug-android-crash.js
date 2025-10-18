#!/usr/bin/env node

/**
 * Script para debuggear crashes de JavaScript en Android
 * Ejecutar con: node debug-android-crash.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 [DEBUG] Iniciando diagnóstico de crash en Android...\n');

// 1. Verificar configuración de red
console.log('📡 [DEBUG] Verificando configuración de red...');
try {
  const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.ts');
  const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  if (apiConfig.includes('192.168.68.101')) {
    console.log('⚠️  [DEBUG] ADVERTENCIA: Usando IP local 192.168.68.101');
    console.log('   - Asegúrate de que el servidor esté corriendo en esa IP');
    console.log('   - Verifica que el dispositivo Android esté en la misma red');
    console.log('   - Considera usar 10.0.2.2 para emulador Android\n');
  }
  
  if (apiConfig.includes('http://') && !apiConfig.includes('localhost')) {
    console.log('⚠️  [DEBUG] ADVERTENCIA: Usando HTTP en lugar de HTTPS');
    console.log('   - Android puede bloquear conexiones HTTP no seguras');
    console.log('   - Verifica que usesCleartextTraffic="true" esté en AndroidManifest.xml\n');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo apiConfig.ts:', error.message);
}

// 2. Verificar AndroidManifest.xml
console.log('📱 [DEBUG] Verificando AndroidManifest.xml...');
try {
  const manifestPath = path.join(__dirname, 'android/app/src/main/AndroidManifest.xml');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  
  if (!manifest.includes('usesCleartextTraffic="true"')) {
    console.log('❌ [DEBUG] ERROR: usesCleartextTraffic no está habilitado');
    console.log('   - Agrega android:usesCleartextTraffic="true" al tag <application>');
  } else {
    console.log('✅ [DEBUG] usesCleartextTraffic está habilitado');
  }
  
  if (!manifest.includes('android.permission.INTERNET')) {
    console.log('❌ [DEBUG] ERROR: Permiso INTERNET no encontrado');
  } else {
    console.log('✅ [DEBUG] Permiso INTERNET encontrado');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo AndroidManifest.xml:', error.message);
}

// 3. Verificar dependencias problemáticas
console.log('\n📦 [DEBUG] Verificando dependencias problemáticas...');
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const problematicDeps = [
    'react-native-camera-kit',
    'react-native-push-notification',
    'react-native-reanimated',
    'aws-amplify'
  ];
  
  problematicDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`⚠️  [DEBUG] Dependencia problemática encontrada: ${dep}@${packageJson.dependencies[dep]}`);
    }
  });
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo package.json:', error.message);
}

// 4. Comandos de limpieza recomendados
console.log('\n🧹 [DEBUG] Comandos de limpieza recomendados:');
console.log('1. Limpiar caché de Metro:');
console.log('   npx react-native start --reset-cache');
console.log('\n2. Limpiar build de Android:');
console.log('   cd android && ./gradlew clean && cd ..');
console.log('\n3. Reinstalar dependencias:');
console.log('   rm -rf node_modules && npm install');
console.log('\n4. Rebuild completo:');
console.log('   npx react-native run-android');

// 5. Verificar logs en tiempo real
console.log('\n📊 [DEBUG] Para ver logs en tiempo real:');
console.log('1. Android Studio: View > Tool Windows > Logcat');
console.log('2. Terminal: adb logcat | grep -E "(ReactNative|JavascriptException)"');
console.log('3. Metro bundler: npx react-native start');

console.log('\n✅ [DEBUG] Diagnóstico completado');
console.log('💡 [DEBUG] Si el problema persiste, revisa los logs específicos arriba');
