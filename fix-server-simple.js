#!/usr/bin/env node

/**
 * Script para arreglar el servidor de forma simple
 * Ejecutar con: node fix-server-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX SERVER SIMPLE] Arreglando servidor de forma simple...\n');

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
  
  // Buscar y reemplazar la lógica de Cognito
  let modifiedContent = content;
  
  // Comentar el mensaje de Cognito
  modifiedContent = modifiedContent.replace(
    /console\.log\('🔄 TODOS los usuarios deben autenticarse con Cognito\.\.\.'\);/,
    '// console.log(\'🔄 TODOS los usuarios deben autenticarse con Cognito...\');'
  );
  
  // Reemplazar la redirección a Cognito con login normal
  const cognitoRedirect = `// return res.status(200).json({
      success: true,
      message: 'Usuario debe autenticarse con Cognito - usar endpoint /auth/cognito-login',
      redirectToCognito: true,
      email: email
    });`;
  
  const normalLogin = `// LOGIN NORMAL (sin Cognito)
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
    
    console.log('✅ [LOGIN] Token generado');
    console.log('✅ [LOGIN] Asociaciones encontradas:', associations.length);
    
    return res.json({
      success: true,
      data: {
        user: user,
        token: token,
        activeAssociation: activeAssociation,
        associations: associations
      }
    });`;
  
  modifiedContent = modifiedContent.replace(cognitoRedirect, normalLogin);
  
  // Escribir archivo modificado
  fs.writeFileSync(serverFile, modifiedContent);
  console.log('✅ [FIX] Login normal configurado');
  
  // Verificar sintaxis
  try {
    require('child_process').execSync('node -c ' + serverFile, { stdio: 'pipe' });
    console.log('✅ [FIX] Sintaxis verificada correctamente');
  } catch (syntaxError) {
    console.log('❌ [FIX] Error de sintaxis:', syntaxError.message);
    return;
  }
  
  console.log('\n🎉 [FIX SERVER SIMPLE] Servidor arreglado exitosamente');
  console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
  console.log('💡 [FIX] Ahora el login debería funcionar sin Cognito');
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el servidor:', error);
}
