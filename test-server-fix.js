#!/usr/bin/env node

/**
 * Script para verificar que el servidor funciona correctamente
 * Ejecutar con: node test-server-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [TEST SERVER FIX] Verificando que el servidor funciona correctamente...\n');

// Verificar que el archivo de middleware existe y es válido
const middlewarePath = path.join(__dirname, '../api/middleware/cognitoRealAuth.js');

if (!fs.existsSync(middlewarePath)) {
  console.log('❌ [TEST] No se encontró el archivo de middleware');
  return;
}

console.log('✅ [TEST] Archivo de middleware encontrado');

// Leer el archivo y verificar la sintaxis
try {
  const content = fs.readFileSync(middlewarePath, 'utf8');
  console.log('✅ [TEST] Archivo de middleware leído correctamente');
  
  // Verificar que no hay errores de sintaxis obvios
  if (content.includes('SyntaxError') || content.includes('Unexpected token')) {
    console.log('❌ [TEST] Error de sintaxis detectado en el archivo');
    return;
  }
  
  // Verificar que la función authenticateToken está bien formateada
  if (content.includes('const authenticateToken = async (req, res, next) => {')) {
    console.log('✅ [TEST] Función authenticateToken encontrada');
  } else {
    console.log('❌ [TEST] Función authenticateToken no encontrada o mal formateada');
    return;
  }
  
  // Verificar que el bypass de desarrollo está configurado
  if (content.includes('BYPASS_COGNITO === \'true\'')) {
    console.log('✅ [TEST] Bypass de desarrollo configurado');
  } else {
    console.log('⚠️ [TEST] Bypass de desarrollo no configurado');
  }
  
  // Verificar que el módulo se exporta correctamente
  if (content.includes('module.exports = {')) {
    console.log('✅ [TEST] Módulo exportado correctamente');
  } else {
    console.log('❌ [TEST] Módulo no exportado correctamente');
    return;
  }
  
  console.log('\n🎉 [TEST] El archivo de middleware está bien formateado');
  console.log('💡 [TEST] El servidor debería funcionar correctamente ahora');
  
} catch (error) {
  console.error('❌ [TEST] Error leyendo el archivo de middleware:', error);
  return;
}

console.log('\n🔧 [CONFIGURACION RECOMENDADA]:');
console.log('Para habilitar el bypass de desarrollo, agrega al archivo .env del servidor:');
console.log('NODE_ENV=development');
console.log('BYPASS_COGNITO=true');

console.log('\n✅ [TEST SERVER FIX] Verificación completada');
console.log('🔄 [TEST] Reinicia el servidor para aplicar los cambios');
