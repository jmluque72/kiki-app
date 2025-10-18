#!/usr/bin/env node

/**
 * Script para arreglar el avatar con URL de S3
 * Ejecutar con: node fix-avatar-s3.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX AVATAR S3] Arreglando avatar con URL de S3...\n');

const middlewareFile = path.join(__dirname, '../api/middleware/cognitoRealAuth.js');

if (!fs.existsSync(middlewareFile)) {
  console.log('❌ [FIX] No se encontró el archivo del middleware');
  return;
}

try {
  const content = fs.readFileSync(middlewareFile, 'utf8');
  console.log('✅ [FIX] Archivo del middleware leído correctamente');
  
  // Crear backup
  const backupPath = middlewareFile + '.backup.' + Date.now();
  fs.copyFileSync(middlewareFile, backupPath);
  console.log(`✅ [FIX] Backup creado en: ${backupPath}`);
  
  // Agregar import de generateSignedUrl
  let modifiedContent = content;
  
  if (!content.includes('generateSignedUrl')) {
    modifiedContent = content.replace(
      /const jwt = require\('jsonwebtoken'\);/,
      `const jwt = require('jsonwebtoken');
const { generateSignedUrl } = require('../config/s3.config');`
    );
  }
  
  // Reemplazar la asignación del avatar
  const oldAvatarAssignment = `avatar: await generateSignedUrl('avatars/68dc61fd626391464e2bceb1/1759686736671-32100557-B222-4097-86FF-2294F63613B0.jpg'),`;
  
  const newAvatarLogic = `// Generar URL de S3 para el avatar
    const avatarUrl = await generateSignedUrl('avatars/68dc61fd626391464e2bceb1/1759686736671-32100557-B222-4097-86FF-2294F63613B0.jpg');
    console.log('🖼️ [SIMPLE AUTH] Avatar URL generada:', avatarUrl);
    
    req.user = {
      _id: '68dc61fd626391464e2bceb1',
      userId: '68dc61fd626391464e2bceb1', // ObjectId válido
      email: 'matilanzaco@solvoglobal.com',
      name: 'Matias Lanzaco',
      role: { nombre: 'coordinador' },
      status: 'approved',
      avatar: avatarUrl || 'https://via.placeholder.com/150/0E5FCE/FFFFFF?text=ML',
      isCognitoUser: false
    };`;
  
  // Buscar y reemplazar la sección del req.user
  const userSectionRegex = /req\.user = \{[^}]+\};/s;
  modifiedContent = modifiedContent.replace(userSectionRegex, newAvatarLogic);
  
  // Escribir archivo modificado
  fs.writeFileSync(middlewareFile, modifiedContent);
  console.log('✅ [FIX] Avatar con URL de S3 configurado');
  
  // Verificar sintaxis
  try {
    require('child_process').execSync('node -c ' + middlewareFile, { stdio: 'pipe' });
    console.log('✅ [FIX] Sintaxis verificada correctamente');
  } catch (syntaxError) {
    console.log('❌ [FIX] Error de sintaxis:', syntaxError.message);
    return;
  }
  
  console.log('\n🎉 [FIX AVATAR S3] Avatar arreglado exitosamente');
  console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
  console.log('💡 [FIX] Ahora el avatar debería usar URL de S3');
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el middleware:', error);
}
