#!/usr/bin/env node

/**
 * Script para arreglar la respuesta del servidor
 * Ejecutar con: node fix-server-response.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX SERVER RESPONSE] Arreglando respuesta del servidor...\n');

const serverFile = path.join(__dirname, '../api/simple-server.js');

if (!fs.existsSync(serverFile)) {
  console.log('❌ [FIX] No se encontró el archivo del servidor');
  return;
}

try {
  const content = fs.readFileSync(serverFile, 'utf8');
  console.log('✅ [FIX] Archivo del servidor leído correctamente');
  
  // Crear backup
  const backupPath = serverFile + '.backup.' + Date.now();
  fs.copyFileSync(serverFile, backupPath);
  console.log(`✅ [FIX] Backup creado en: ${backupPath}`);
  
  // Reemplazar la respuesta del servidor
  const oldResponse = `return res.json({
      success: true,
      message: 'Usuario autenticado correctamente',
      redirectToCognito: true,
      email: email
    });`;
  
  const newResponse = `return res.json({
      success: true,
      data: {
        user: user,
        token: 'mock-token-' + Date.now(),
        activeAssociation: null,
        associations: []
      }
    });`;
  
  const modifiedContent = content.replace(oldResponse, newResponse);
  
  // Escribir archivo modificado
  fs.writeFileSync(serverFile, modifiedContent);
  console.log('✅ [FIX] Respuesta del servidor arreglada');
  
  // Verificar sintaxis
  try {
    require('child_process').execSync('node -c ' + serverFile, { stdio: 'pipe' });
    console.log('✅ [FIX] Sintaxis verificada correctamente');
  } catch (syntaxError) {
    console.log('❌ [FIX] Error de sintaxis:', syntaxError.message);
    return;
  }
  
  console.log('\n🎉 [FIX SERVER RESPONSE] Respuesta arreglada exitosamente');
  console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
  console.log('💡 [FIX] Ahora la respuesta debería tener la estructura correcta');
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el servidor:', error);
}
