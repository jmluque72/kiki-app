#!/usr/bin/env node

/**
 * Script para arreglar el bypass de Cognito en el servidor
 * Ejecutar con: node fix-server-cognito-bypass.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX SERVER COGNITO BYPASS] Arreglando bypass de Cognito en el servidor...\n');

// Buscar archivo del servidor
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
    console.log(`✅ [FIX] Archivo del servidor encontrado: ${file}`);
    break;
  }
}

if (!serverFile) {
  console.log('❌ [FIX] No se encontró el archivo del servidor');
  return;
}

// Leer el archivo del servidor
try {
  const content = fs.readFileSync(serverFile, 'utf8');
  console.log('✅ [FIX] Archivo del servidor leído correctamente');
  
  // Crear backup
  const backupPath = serverFile + '.backup.' + Date.now();
  fs.copyFileSync(serverFile, backupPath);
  console.log(`✅ [FIX] Backup creado en: ${backupPath}`);
  
  // Buscar la lógica de login que fuerza Cognito
  if (content.includes('Usuario debe autenticarse con Cognito')) {
    console.log('✅ [FIX] Lógica de Cognito forzado encontrada');
    
    // Reemplazar la lógica que fuerza Cognito
    const modifiedContent = content.replace(
      /if \(.*redirectToCognito.*\) \{[\s\S]*?\}/g,
      `// BYPASS COGNITO EN DESARROLLO
      if (req.headers['x-bypass-cognito'] === 'true' || process.env.BYPASS_COGNITO === 'true') {
        console.log('🔧 [BYPASS COGNITO] Bypaseando Cognito para desarrollo');
        
        // Buscar usuario en la base de datos
        const user = await User.findOne({ email: email });
        if (!user) {
          return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }
        
        // Generar token
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
        
        return res.json({
          success: true,
          data: {
            user: user,
            token: token,
            activeAssociation: activeAssociation,
            associations: associations
          }
        });
      }`
    );
    
    // Escribir archivo modificado
    fs.writeFileSync(serverFile, modifiedContent);
    console.log('✅ [FIX] Bypass de Cognito configurado');
    
    console.log('\n🎉 [FIX SERVER COGNITO BYPASS] Bypass configurado exitosamente');
    console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
    console.log('💡 [FIX] Usa el header X-Bypass-Cognito: true para bypassar Cognito');
    
  } else {
    console.log('❌ [FIX] No se encontró la lógica de Cognito forzado');
    console.log('💡 [FIX] Busca manualmente el archivo que contiene:');
    console.log('   - "Usuario debe autenticarse con Cognito"');
    console.log('   - "redirectToCognito"');
  }
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el servidor:', error);
}
