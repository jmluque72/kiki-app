#!/usr/bin/env node

/**
 * Script para arreglar el login del servidor
 * Ejecutar con: node fix-server-login.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX SERVER LOGIN] Arreglando login del servidor...\n');

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
  
  // Reemplazar la lógica de Cognito con login normal
  const loginNormal = `
    // LOGIN NORMAL (sin Cognito)
    console.log('✅ [LOGIN] Usuario autenticado correctamente');
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Obtener asociaciones del usuario
    const associations = await UserAssociation.find({ user: user._id })
      .populate('account')
      .populate('division')
      .populate('student')
      .populate('role');
    
    const activeAssociation = associations.find(assoc => assoc.status === 'active') || associations[0];
    
    console.log('✅ [LOGIN] Token generado:', token.substring(0, 20) + '...');
    console.log('✅ [LOGIN] Asociaciones encontradas:', associations.length);
    
    return res.json({
      success: true,
      data: {
        user: user,
        token: token,
        activeAssociation: activeAssociation,
        associations: associations
      }
    });
  `;
  
  // Buscar y reemplazar la lógica de Cognito
  const modifiedContent = content.replace(
    /\/\/ console\.log\('🔄 TODOS los usuarios deben autenticarse con Cognito\.\.\.'\);\s*\/\/ Redirigir a Cognito para autenticación \(COMENTADO\)\s*\/\/ return res\.status\(200\)\.json\(\{\s*success: true,\s*message: 'Usuario debe autenticarse con Cognito - usar endpoint \/auth\/cognito-login',\s*redirectToCognito: true,\s*email: email\s*\}\);/,
    loginNormal
  );
  
  // Escribir archivo modificado
  fs.writeFileSync(serverFile, modifiedContent);
  console.log('✅ [FIX] Login normal configurado');
  
  console.log('\n🎉 [FIX SERVER LOGIN] Login arreglado exitosamente');
  console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
  console.log('💡 [FIX] Ahora el login debería funcionar sin Cognito');
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el servidor:', error);
}
