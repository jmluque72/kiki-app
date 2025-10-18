#!/usr/bin/env node

/**
 * Script para verificar que el error de useAuth se ha solucionado
 * Ejecutar con: node test-auth-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [TEST] Verificando corrección del error useAuth...\n');

// 1. Verificar que CommonHeader tiene la verificación de seguridad
console.log('📱 [TEST] Verificando CommonHeader.tsx...');
try {
  const commonHeaderPath = path.join(__dirname, 'components/CommonHeader.tsx');
  const commonHeaderContent = fs.readFileSync(commonHeaderPath, 'utf8');
  
  if (commonHeaderContent.includes('try {') && commonHeaderContent.includes('const authContext = useAuth();')) {
    console.log('✅ [TEST] CommonHeader tiene verificación de seguridad para useAuth');
  } else {
    console.log('❌ [TEST] CommonHeader NO tiene verificación de seguridad');
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo CommonHeader.tsx:', error.message);
}

// 2. Verificar que InicioScreen tiene la verificación de seguridad
console.log('\n📱 [TEST] Verificando InicioScreen.tsx...');
try {
  const inicioScreenPath = path.join(__dirname, 'screens/InicioScreen.tsx');
  const inicioScreenContent = fs.readFileSync(inicioScreenPath, 'utf8');
  
  if (inicioScreenContent.includes('try {') && inicioScreenContent.includes('const authContext = useAuth();')) {
    console.log('✅ [TEST] InicioScreen tiene verificación de seguridad para useAuth');
  } else {
    console.log('❌ [TEST] InicioScreen NO tiene verificación de seguridad');
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo InicioScreen.tsx:', error.message);
}

// 3. Verificar que AuthWrapper existe
console.log('\n📱 [TEST] Verificando AuthWrapper.tsx...');
try {
  const authWrapperPath = path.join(__dirname, 'components/AuthWrapper.tsx');
  const authWrapperContent = fs.readFileSync(authWrapperPath, 'utf8');
  
  if (authWrapperContent.includes('AuthWrapper') && authWrapperContent.includes('useAuth')) {
    console.log('✅ [TEST] AuthWrapper.tsx existe y está configurado correctamente');
  } else {
    console.log('❌ [TEST] AuthWrapper.tsx no está configurado correctamente');
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo AuthWrapper.tsx:', error.message);
}

// 4. Verificar que App.tsx usa AuthWrapper
console.log('\n📱 [TEST] Verificando App.tsx...');
try {
  const appPath = path.join(__dirname, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('AuthWrapper') && appContent.includes('<AuthWrapper>')) {
    console.log('✅ [TEST] App.tsx usa AuthWrapper correctamente');
  } else {
    console.log('❌ [TEST] App.tsx NO usa AuthWrapper');
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo App.tsx:', error.message);
}

console.log('\n🚀 [TEST] Comandos para probar la corrección:');
console.log('1. Limpiar caché:');
console.log('   npx react-native start --reset-cache');
console.log('\n2. Rebuild Android:');
console.log('   cd android && ./gradlew clean && cd ..');
console.log('   npx react-native run-android');
console.log('\n3. Ver logs en tiempo real:');
console.log('   adb logcat | grep -E "(useAuth|AuthProvider|CommonHeader)"');

console.log('\n✅ [TEST] Verificación completada');
console.log('💡 [TEST] Si el error persiste, revisa los logs específicos arriba');
