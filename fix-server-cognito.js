#!/usr/bin/env node

/**
 * Script para solucionar el problema de Cognito en el servidor
 * Ejecutar con: node fix-server-cognito.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX SERVER COGNITO] Solucionando problema de Cognito en el servidor...\n');

// 1. Verificar si existe un archivo de configuración del servidor
console.log('📱 [FIX] Verificando configuración del servidor...');

const possibleServerPaths = [
  '../api',
  '../server',
  '../backend',
  './api',
  './server',
  './backend'
];

let serverPath = null;
for (const possiblePath of possibleServerPaths) {
  const fullPath = path.join(__dirname, possiblePath);
  if (fs.existsSync(fullPath)) {
    serverPath = fullPath;
    console.log(`✅ [FIX] Servidor encontrado en: ${possiblePath}`);
    break;
  }
}

if (!serverPath) {
  console.log('❌ [FIX] No se encontró el directorio del servidor');
  console.log('💡 [FIX] Busca manualmente el archivo que contiene la lógica de login');
  console.log('💡 [FIX] Debe estar en una carpeta como: api/, server/, backend/');
  return;
}

// 2. Buscar archivos que contengan la lógica de Cognito
console.log('\n📱 [FIX] Buscando archivos con lógica de Cognito...');

const filesToCheck = [
  'routes/auth.js',
  'routes/users.js',
  'controllers/authController.js',
  'controllers/userController.js',
  'middleware/auth.js',
  'services/authService.js',
  'app.js',
  'server.js',
  'index.js'
];

let cognitoFile = null;
for (const file of filesToCheck) {
  const filePath = path.join(serverPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Cognito') || content.includes('cognito')) {
      console.log(`✅ [FIX] Archivo con lógica de Cognito encontrado: ${file}`);
      cognitoFile = filePath;
      break;
    }
  }
}

if (!cognitoFile) {
  console.log('❌ [FIX] No se encontró archivo con lógica de Cognito');
  console.log('💡 [FIX] Busca manualmente el archivo que contiene:');
  console.log('   - "TODOS los usuarios deben autenticarse con Cognito"');
  console.log('   - "redirectToCognito"');
  console.log('   - Lógica de login');
  return;
}

// 3. Crear backup del archivo
console.log('\n📱 [FIX] Creando backup del archivo...');
const backupPath = cognitoFile + '.backup.' + Date.now();
fs.copyFileSync(cognitoFile, backupPath);
console.log(`✅ [FIX] Backup creado en: ${backupPath}`);

// 4. Leer el archivo y mostrar la lógica problemática
console.log('\n📱 [FIX] Analizando lógica problemática...');
const content = fs.readFileSync(cognitoFile, 'utf8');

if (content.includes('TODOS los usuarios deben autenticarse con Cognito')) {
  console.log('✅ [FIX] Lógica problemática encontrada');
  console.log('💡 [FIX] El servidor está forzando Cognito sin excepciones');
} else {
  console.log('❌ [FIX] No se encontró la lógica problemática');
  console.log('💡 [FIX] Busca manualmente el archivo que contiene esta lógica');
}

console.log('\n🔧 [SOLUCIONES RECOMENDADAS]:');
console.log('1. **Modificar el servidor para permitir bypass en desarrollo:**');
console.log('   - Agregar variable de entorno: NODE_ENV=development');
console.log('   - Agregar flag: BYPASS_COGNITO=true');
console.log('   - Modificar la lógica para permitir login legacy en desarrollo');

console.log('\n2. **Crear endpoint especial para desarrollo:**');
console.log('   - Crear ruta: /dev/login');
console.log('   - Crear ruta: /admin/login');
console.log('   - Crear ruta: /test/login');

console.log('\n3. **Configurar Cognito correctamente:**');
console.log('   - Verificar configuración en AWS Console');
console.log('   - Verificar que el endpoint /auth/cognito-login funcione');
console.log('   - Verificar que los tokens de Cognito sean válidos');

console.log('\n4. **Usar configuración de desarrollo:**');
console.log('   - Crear archivo .env.development');
console.log('   - Agregar: COGNITO_BYPASS=true');
console.log('   - Modificar la lógica para leer esta variable');

console.log('\n✅ [FIX SERVER COGNITO] Análisis completado');
console.log('💡 [FIX] Para solucionar definitivamente, modifica el servidor según las recomendaciones arriba');
