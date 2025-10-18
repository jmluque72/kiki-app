#!/usr/bin/env node

/**
 * Script para verificar endpoints del servidor
 * Ejecutar con: node check-server-endpoints.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [CHECK SERVER ENDPOINTS] Verificando endpoints del servidor...\n');

// Buscar archivos del servidor
const serverPath = path.join(__dirname, '../api');
const possibleFiles = [
  'simple-server.js',
  'server.js',
  'app.js',
  'index.js'
];

let serverFile = null;
for (const file of possibleFiles) {
  const filePath = path.join(serverPath, file);
  if (fs.existsSync(filePath)) {
    serverFile = filePath;
    console.log(`✅ [CHECK] Archivo del servidor encontrado: ${file}`);
    break;
  }
}

if (!serverFile) {
  console.log('❌ [CHECK] No se encontró el archivo del servidor');
  return;
}

// Leer el archivo del servidor
try {
  const content = fs.readFileSync(serverFile, 'utf8');
  console.log('✅ [CHECK] Archivo del servidor leído correctamente');
  
  // Buscar endpoints de notificaciones
  console.log('\n📱 [CHECK] Buscando endpoints de notificaciones:');
  
  const notificationEndpoints = [
    '/notifications',
    '/api/notifications',
    '/notifications/mobile',
    '/api/notifications/mobile'
  ];
  
  for (const endpoint of notificationEndpoints) {
    if (content.includes(endpoint)) {
      console.log(`✅ [CHECK] Endpoint encontrado: ${endpoint}`);
    } else {
      console.log(`❌ [CHECK] Endpoint NO encontrado: ${endpoint}`);
    }
  }
  
  // Buscar otros endpoints importantes
  console.log('\n📱 [CHECK] Buscando otros endpoints importantes:');
  
  const importantEndpoints = [
    '/users/login',
    '/activities/mobile',
    '/users',
    '/activities'
  ];
  
  for (const endpoint of importantEndpoints) {
    if (content.includes(endpoint)) {
      console.log(`✅ [CHECK] Endpoint encontrado: ${endpoint}`);
    } else {
      console.log(`❌ [CHECK] Endpoint NO encontrado: ${endpoint}`);
    }
  }
  
  // Buscar rutas de notificaciones
  if (content.includes('notification') || content.includes('Notification')) {
    console.log('✅ [CHECK] Lógica de notificaciones encontrada');
  } else {
    console.log('⚠️ [CHECK] Lógica de notificaciones NO encontrada');
  }
  
  console.log('\n💡 [SOLUCIONES RECOMENDADAS]:');
  console.log('1. **Agregar endpoint de notificaciones** al servidor');
  console.log('2. **Verificar que el endpoint existe** en el servidor');
  console.log('3. **Configurar rutas de notificaciones** correctamente');
  console.log('4. **Probar endpoints** con Postman o curl');
  
  console.log('\n✅ [CHECK SERVER ENDPOINTS] Verificación completada');
  
} catch (error) {
  console.error('❌ [CHECK] Error leyendo el archivo del servidor:', error);
}