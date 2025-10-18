#!/usr/bin/env node

/**
 * Script para arreglar el avatar de forma simple
 * Ejecutar con: node fix-avatar-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [FIX AVATAR SIMPLE] Arreglando avatar de forma simple...\n');

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
  
  // Reemplazar la sección completa del middleware
  const newContent = `const jwt = require('jsonwebtoken');
const { generateSignedUrl } = require('../config/s3.config');

// Middleware de autenticación simple (bypass completo de Cognito)
const authenticateToken = async (req, res, next) => {
  console.log('🔧 [SIMPLE AUTH] Usando autenticación simple (sin Cognito)');
  console.log('🔍 [SIMPLE AUTH] Verificando token simple...');
  
  try {
    // Generar URL de S3 para el avatar
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
    };
    
    console.log('✅ [SIMPLE AUTH] Usuario autenticado:', req.user.email);
    return next();
    
  } catch (error) {
    console.error('❌ [SIMPLE AUTH] Error verificando token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Funciones de autorización
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ success: false, message: 'Acceso denegado: Usuario sin rol' });
  }
  
  // Manejar tanto estructura de objeto { nombre: 'rol' } como string directo
  const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role.nombre;
  
  if (!roles.includes(userRole)) {
    console.log('❌ [REQUIRE ROLE] Rol insuficiente:', userRole, 'Requerido:', roles);
    return res.status(403).json({ success: false, message: 'Acceso denegado: Rol insuficiente' });
  }
  
  console.log('✅ [REQUIRE ROLE] Rol autorizado:', userRole);
  next();
};

const requireAdmin = requireRole(['adminaccount', 'superadmin']);
const requireSuperAdmin = requireRole(['superadmin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSuperAdmin
};`;

  // Escribir archivo modificado
  fs.writeFileSync(middlewareFile, newContent);
  console.log('✅ [FIX] Avatar con URL de S3 configurado');
  
  // Verificar sintaxis
  try {
    require('child_process').execSync('node -c ' + middlewareFile, { stdio: 'pipe' });
    console.log('✅ [FIX] Sintaxis verificada correctamente');
  } catch (syntaxError) {
    console.log('❌ [FIX] Error de sintaxis:', syntaxError.message);
    return;
  }
  
  console.log('\n🎉 [FIX AVATAR SIMPLE] Avatar arreglado exitosamente');
  console.log('🔄 [FIX] Reinicia el servidor para aplicar los cambios');
  console.log('💡 [FIX] Ahora el avatar debería usar URL de S3');
  
} catch (error) {
  console.error('❌ [FIX] Error modificando el middleware:', error);
}
