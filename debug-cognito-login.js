#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de login con Cognito
 * Ejecutar con: node debug-cognito-login.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [DEBUG COGNITO] Diagnosticando problemas de login...\n');

// 1. Verificar configuración de Cognito
console.log('📱 [DEBUG] Verificando configuración de Cognito...');
try {
  const cognitoConfigPath = path.join(__dirname, 'src/config/cognitoConfig.ts');
  const cognitoConfig = fs.readFileSync(cognitoConfigPath, 'utf8');
  
  if (cognitoConfig.includes('userPoolId') && cognitoConfig.includes('userPoolClientId')) {
    console.log('✅ [DEBUG] Configuración de Cognito encontrada');
    
    // Extraer valores
    const userPoolIdMatch = cognitoConfig.match(/userPoolId:\s*'([^']+)'/);
    const clientIdMatch = cognitoConfig.match(/userPoolClientId:\s*'([^']+)'/);
    const regionMatch = cognitoConfig.match(/region:\s*'([^']+)'/);
    
    if (userPoolIdMatch) console.log(`   - User Pool ID: ${userPoolIdMatch[1]}`);
    if (clientIdMatch) console.log(`   - Client ID: ${clientIdMatch[1]}`);
    if (regionMatch) console.log(`   - Region: ${regionMatch[1]}`);
  } else {
    console.log('❌ [DEBUG] Configuración de Cognito incompleta');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo configuración de Cognito:', error.message);
}

// 2. Verificar el flujo de autenticación híbrida
console.log('\n📱 [DEBUG] Verificando flujo de autenticación híbrida...');
try {
  const hybridAuthPath = path.join(__dirname, 'src/services/hybridAuthService.ts');
  const hybridAuth = fs.readFileSync(hybridAuthPath, 'utf8');
  
  if (hybridAuth.includes('Todos los usuarios deben autenticarse con Cognito')) {
    console.log('✅ [DEBUG] Mensaje de error encontrado en hybridAuthService.ts');
    console.log('   - Línea 64: throw new Error("Todos los usuarios deben autenticarse con Cognito")');
  }
  
  if (hybridAuth.includes('CognitoAuthService.login')) {
    console.log('✅ [DEBUG] Flujo de Cognito implementado');
  }
  
  if (hybridAuth.includes('catch (cognitoError)')) {
    console.log('✅ [DEBUG] Manejo de errores de Cognito implementado');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo hybridAuthService.ts:', error.message);
}

// 3. Verificar el servicio de Cognito
console.log('\n📱 [DEBUG] Verificando servicio de Cognito...');
try {
  const cognitoAuthPath = path.join(__dirname, 'src/services/cognitoAuthService.ts');
  const cognitoAuth = fs.readFileSync(cognitoAuthPath, 'utf8');
  
  if (cognitoAuth.includes('fetch(`https://cognito-idp.')) {
    console.log('✅ [DEBUG] Servicio de Cognito usa fetch directo');
  }
  
  if (cognitoAuth.includes('USER_PASSWORD_AUTH')) {
    console.log('✅ [DEBUG] Flujo de autenticación USER_PASSWORD_AUTH configurado');
  }
  
  if (cognitoAuth.includes('extractGroupsFromToken')) {
    console.log('✅ [DEBUG] Extracción de grupos del token implementada');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo cognitoAuthService.ts:', error.message);
}

// 4. Verificar configuración de red
console.log('\n📱 [DEBUG] Verificando configuración de red...');
try {
  const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.ts');
  const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  if (apiConfig.includes('192.168.68.101')) {
    console.log('⚠️ [DEBUG] Usando IP local 192.168.68.101');
    console.log('   - Asegúrate de que el servidor esté corriendo en esa IP');
    console.log('   - Verifica que el dispositivo Android esté en la misma red');
  }
  
  if (apiConfig.includes('http://')) {
    console.log('⚠️ [DEBUG] Usando HTTP (no HTTPS)');
    console.log('   - Android puede tener restricciones con HTTP');
  }
} catch (error) {
  console.log('❌ [DEBUG] Error leyendo apiConfig.ts:', error.message);
}

console.log('\n🔍 [DIAGNÓSTICO] Posibles causas del error:');
console.log('1. ❌ Cognito no está configurado correctamente');
console.log('2. ❌ El servidor no está disponible en la IP configurada');
console.log('3. ❌ Problemas de red entre el dispositivo y el servidor');
console.log('4. ❌ Configuración incorrecta de Cognito en AWS');
console.log('5. ❌ El endpoint /auth/cognito-login no existe en el servidor');

console.log('\n🚀 [SOLUCIONES RECOMENDADAS]:');
console.log('1. Verificar que el servidor esté corriendo:');
console.log('   curl http://192.168.68.101:3000/api/health');
console.log('\n2. Verificar conectividad de red:');
console.log('   ping 192.168.68.101');
console.log('\n3. Revisar logs del servidor para errores de Cognito');
console.log('\n4. Verificar configuración de Cognito en AWS Console');

console.log('\n✅ [DEBUG COGNITO] Diagnóstico completado');
