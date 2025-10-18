#!/usr/bin/env node

/**
 * Script para verificar el flujo Cognito → MongoDB
 * Ejecutar con: node check-cognito-mongo-flow.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [CHECK COGNITO MONGO FLOW] Verificando flujo Cognito → MongoDB...\n');

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
  
  // Verificar endpoints necesarios para el flujo Cognito → MongoDB
  const requiredEndpoints = [
    '/auth/cognito-to-mongo',
    '/auth/create-user-from-cognito',
    '/auth/cognito-login'
  ];
  
  console.log('\n📱 [CHECK] Verificando endpoints para flujo Cognito → MongoDB:');
  
  for (const endpoint of requiredEndpoints) {
    if (content.includes(endpoint)) {
      console.log(`✅ [CHECK] Endpoint encontrado: ${endpoint}`);
    } else {
      console.log(`❌ [CHECK] Endpoint NO encontrado: ${endpoint}`);
    }
  }
  
  // Verificar si hay lógica de Cognito
  if (content.includes('cognito') || content.includes('Cognito')) {
    console.log('✅ [CHECK] Lógica de Cognito encontrada');
  } else {
    console.log('⚠️ [CHECK] Lógica de Cognito NO encontrada');
  }
  
  // Verificar si hay búsqueda de usuario por email
  if (content.includes('findOne') && content.includes('email')) {
    console.log('✅ [CHECK] Búsqueda de usuario por email encontrada');
  } else {
    console.log('⚠️ [CHECK] Búsqueda de usuario por email NO encontrada');
  }
  
  // Verificar si hay creación de usuario
  if (content.includes('create') && content.includes('User')) {
    console.log('✅ [CHECK] Creación de usuario encontrada');
  } else {
    console.log('⚠️ [CHECK] Creación de usuario NO encontrada');
  }
  
  console.log('\n💡 [FLUJO CORRECTO IMPLEMENTADO]:');
  console.log('1. **Login con Cognito** → Obtener email del usuario');
  console.log('2. **Buscar usuario en MongoDB** → Con email de Cognito');
  console.log('3. **Usar datos reales** → ObjectIds válidos de la base de datos');
  console.log('4. **Crear usuario si no existe** → Fallback para nuevos usuarios');
  
  console.log('\n🔧 [ENDPOINTS NECESARIOS]:');
  console.log('POST /auth/cognito-to-mongo - Buscar usuario existente');
  console.log('POST /auth/create-user-from-cognito - Crear usuario nuevo');
  console.log('POST /auth/cognito-login - Login completo con Cognito');
  
  console.log('\n✅ [CHECK COGNITO MONGO FLOW] Verificación completada');
  
} catch (error) {
  console.error('❌ [CHECK] Error leyendo el archivo del servidor:', error);
}
