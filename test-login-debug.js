#!/usr/bin/env node

/**
 * Script para debuggear el proceso de login
 * Ejecutar con: node test-login-debug.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [DEBUG LOGIN] Analizando el proceso de login...\n');

// 1. Verificar la estructura del HybridAuthService
console.log('📱 [DEBUG] Verificando HybridAuthService...');
try {
  const hybridAuthPath = path.join(__dirname, 'src/services/hybridAuthService.ts');
  const hybridAuth = fs.readFileSync(hybridAuthPath, 'utf8');
  
  if (hybridAuth.includes('return {') && hybridAuth.includes('success: true')) {
    console.log('✅ [DEBUG] HybridAuthService retorna estructura correcta en caso de éxito');
  } else {
    console.log('❌ [DEBUG] HybridAuthService NO retorna estructura correcta');
  }
  
  if (hybridAuth.includes('success: false') && hybridAuth.includes('user: null')) {
    console.log('✅ [DEBUG] HybridAuthService maneja errores correctamente');
  } else {
    console.log('❌ [DEBUG] HybridAuthService NO maneja errores correctamente');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo HybridAuthService:', error.message);
}

// 2. Verificar la estructura del AuthContext
console.log('\n📱 [DEBUG] Verificando AuthContextHybrid...');
try {
  const authContextPath = path.join(__dirname, 'contexts/AuthContextHybrid.tsx');
  const authContext = fs.readFileSync(authContextPath, 'utf8');
  
  if (authContext.includes('loginResult.user') && authContext.includes('loginResult.token')) {
    console.log('✅ [DEBUG] AuthContext accede a loginResult.user y loginResult.token');
  } else {
    console.log('❌ [DEBUG] AuthContext NO accede correctamente a loginResult');
  }
  
  if (authContext.includes('if (!loginResult || !loginResult.success)')) {
    console.log('✅ [DEBUG] AuthContext verifica loginResult antes de usarlo');
  } else {
    console.log('❌ [DEBUG] AuthContext NO verifica loginResult correctamente');
  }
  
  if (authContext.includes('console.log(\'🔍 [AuthContext] Resultado del login:\', loginResult)')) {
    console.log('✅ [DEBUG] AuthContext tiene logging del resultado del login');
  } else {
    console.log('❌ [DEBUG] AuthContext NO tiene logging del resultado');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo AuthContextHybrid:', error.message);
}

// 3. Verificar la configuración de la API
console.log('\n📱 [DEBUG] Verificando configuración de API...');
try {
  const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.ts');
  const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  if (apiConfig.includes('192.168.68.101')) {
    console.log('⚠️ [DEBUG] Usando IP local 192.168.68.101');
    console.log('   - Verifica que el servidor esté corriendo en esa IP');
    console.log('   - Verifica que el dispositivo Android esté en la misma red');
  }
  
  if (apiConfig.includes('http://')) {
    console.log('⚠️ [DEBUG] Usando HTTP (no HTTPS)');
    console.log('   - Android puede tener restricciones con HTTP');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo apiConfig.ts:', error.message);
}

// 4. Verificar el servicio de API
console.log('\n📱 [DEBUG] Verificando servicio de API...');
try {
  const apiServicePath = path.join(__dirname, 'src/services/api.ts');
  if (fs.existsSync(apiServicePath)) {
    const apiService = fs.readFileSync(apiServicePath, 'utf8');
    
    if (apiService.includes('axios') || apiService.includes('fetch')) {
      console.log('✅ [DEBUG] Servicio de API configurado');
    } else {
      console.log('❌ [DEBUG] Servicio de API no encontrado o mal configurado');
    }
  } else {
    console.log('❌ [DEBUG] Archivo de servicio de API no existe');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error verificando servicio de API:', error.message);
}

console.log('\n🔍 [DIAGNÓSTICO] Posibles causas del error:');
console.log('1. ❌ El servidor no responde correctamente');
console.log('2. ❌ La respuesta del servidor no tiene la estructura esperada');
console.log('3. ❌ Problemas de red entre el dispositivo y el servidor');
console.log('4. ❌ El endpoint /users/login no existe o está mal configurado');
console.log('5. ❌ Credenciales incorrectas');

console.log('\n🚀 [SOLUCIONES RECOMENDADAS]:');
console.log('1. Verificar que el servidor esté corriendo:');
console.log('   curl http://192.168.68.101:3000/api/health');
console.log('\n2. Probar el endpoint de login directamente:');
console.log('   curl -X POST http://192.168.68.101:3000/api/users/login \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"test@test.com","password":"test123"}\'');
console.log('\n3. Revisar logs del servidor para errores');
console.log('\n4. Verificar que las credenciales sean correctas');

console.log('\n✅ [DEBUG LOGIN] Análisis completado');
