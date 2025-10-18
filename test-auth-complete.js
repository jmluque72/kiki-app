#!/usr/bin/env node

/**
 * Script completo para verificar la corrección del error useAuth
 * Ejecutar con: node test-auth-complete.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [TEST COMPLETO] Verificando corrección del error useAuth...\n');

let errors = 0;
let warnings = 0;

// 1. Verificar que AuthContext.tsx fue eliminado
console.log('📱 [TEST] Verificando eliminación de AuthContext.tsx...');
try {
  const authContextPath = path.join(__dirname, 'contexts/AuthContext.tsx');
  if (fs.existsSync(authContextPath)) {
    console.log('❌ [TEST] AuthContext.tsx aún existe - debe ser eliminado');
    errors++;
  } else {
    console.log('✅ [TEST] AuthContext.tsx fue eliminado correctamente');
  }
} catch (error) {
  console.log('✅ [TEST] AuthContext.tsx no existe (correcto)');
}

// 2. Verificar que todos los hooks usan AuthContextHybrid
console.log('\n📱 [TEST] Verificando imports de hooks...');
const hooksToCheck = [
  'src/hooks/useNotifications.ts',
  'src/hooks/usePushNotifications.ts', 
  'src/hooks/useApiError.ts'
];

hooksToCheck.forEach(hookPath => {
  try {
    const fullPath = path.join(__dirname, hookPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from '../../contexts/AuthContextHybrid'")) {
        console.log(`✅ [TEST] ${hookPath} usa AuthContextHybrid`);
      } else if (content.includes("from '../../contexts/AuthContext'")) {
        console.log(`❌ [TEST] ${hookPath} aún usa AuthContext (incorrecto)`);
        errors++;
      } else {
        console.log(`⚠️ [TEST] ${hookPath} no tiene import de AuthContext`);
        warnings++;
      }
    } else {
      console.log(`⚠️ [TEST] ${hookPath} no existe`);
      warnings++;
    }
  } catch (error) {
    console.log(`❌ [TEST] Error verificando ${hookPath}:`, error.message);
    errors++;
  }
});

// 3. Verificar que AuthContextHybrid tiene el manejo de errores mejorado
console.log('\n📱 [TEST] Verificando AuthContextHybrid.tsx...');
try {
  const authContextHybridPath = path.join(__dirname, 'contexts/AuthContextHybrid.tsx');
  const content = fs.readFileSync(authContextHybridPath, 'utf8');
  
  if (content.includes('console.error') && content.includes('valores por defecto')) {
    console.log('✅ [TEST] AuthContextHybrid tiene manejo de errores mejorado');
  } else {
    console.log('❌ [TEST] AuthContextHybrid NO tiene manejo de errores mejorado');
    errors++;
  }
  
  if (content.includes('throw new Error')) {
    console.log('❌ [TEST] AuthContextHybrid aún lanza errores (debería usar valores por defecto)');
    errors++;
  } else {
    console.log('✅ [TEST] AuthContextHybrid no lanza errores');
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo AuthContextHybrid.tsx:', error.message);
  errors++;
}

// 4. Verificar que CommonHeader tiene verificación de seguridad
console.log('\n📱 [TEST] Verificando CommonHeader.tsx...');
try {
  const commonHeaderPath = path.join(__dirname, 'components/CommonHeader.tsx');
  const content = fs.readFileSync(commonHeaderPath, 'utf8');
  
  if (content.includes('try {') && content.includes('catch (error)')) {
    console.log('✅ [TEST] CommonHeader tiene verificación de seguridad');
  } else {
    console.log('❌ [TEST] CommonHeader NO tiene verificación de seguridad');
    errors++;
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo CommonHeader.tsx:', error.message);
  errors++;
}

// 5. Verificar que InicioScreen tiene verificación de seguridad
console.log('\n📱 [TEST] Verificando InicioScreen.tsx...');
try {
  const inicioScreenPath = path.join(__dirname, 'screens/InicioScreen.tsx');
  const content = fs.readFileSync(inicioScreenPath, 'utf8');
  
  if (content.includes('try {') && content.includes('catch (error)')) {
    console.log('✅ [TEST] InicioScreen tiene verificación de seguridad');
  } else {
    console.log('❌ [TEST] InicioScreen NO tiene verificación de seguridad');
    errors++;
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo InicioScreen.tsx:', error.message);
  errors++;
}

// 6. Verificar que App.tsx usa AuthWrapper
console.log('\n📱 [TEST] Verificando App.tsx...');
try {
  const appPath = path.join(__dirname, 'App.tsx');
  const content = fs.readFileSync(appPath, 'utf8');
  
  if (content.includes('AuthWrapper') && content.includes('<AuthWrapper>')) {
    console.log('✅ [TEST] App.tsx usa AuthWrapper correctamente');
  } else {
    console.log('❌ [TEST] App.tsx NO usa AuthWrapper');
    errors++;
  }
} catch (error) {
  console.log('❌ [TEST] Error leyendo App.tsx:', error.message);
  errors++;
}

// Resumen
console.log('\n📊 [RESUMEN] Resultados del test:');
console.log(`✅ Errores encontrados: ${errors}`);
console.log(`⚠️ Advertencias: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 [ÉXITO] Todos los tests pasaron correctamente');
  console.log('💡 [INFO] El error de useAuth debería estar solucionado');
} else {
  console.log('\n❌ [FALLO] Se encontraron errores que deben corregirse');
  console.log('💡 [INFO] Revisa los errores arriba y corrígelos');
}

console.log('\n🚀 [PRÓXIMOS PASOS]');
console.log('1. Limpiar caché:');
console.log('   npx react-native start --reset-cache');
console.log('\n2. Limpiar build Android:');
console.log('   cd android && ./gradlew clean && cd ..');
console.log('\n3. Rebuild:');
console.log('   npx react-native run-android');
console.log('\n4. Ver logs en tiempo real:');
console.log('   adb logcat | grep -E "(useAuth|AuthProvider|CommonHeader|InicioScreen)"');

console.log('\n✅ [TEST COMPLETO] Verificación finalizada');
