#!/usr/bin/env node

/**
 * Script para agregar endpoint de notificaciones al servidor
 * Ejecutar con: node add-notifications-endpoint.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 [ADD NOTIFICATIONS ENDPOINT] Agregando endpoint de notificaciones...\n');

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
    console.log(`✅ [ADD] Archivo del servidor encontrado: ${file}`);
    break;
  }
}

if (!serverFile) {
  console.log('❌ [ADD] No se encontró el archivo del servidor');
  return;
}

// Leer el archivo del servidor
try {
  const content = fs.readFileSync(serverFile, 'utf8');
  console.log('✅ [ADD] Archivo del servidor leído correctamente');
  
  // Verificar si ya existe el endpoint
  if (content.includes('/notifications') || content.includes('/api/notifications')) {
    console.log('✅ [ADD] Endpoint de notificaciones ya existe');
    return;
  }
  
  // Crear backup
  const backupPath = serverFile + '.backup.' + Date.now();
  fs.copyFileSync(serverFile, backupPath);
  console.log(`✅ [ADD] Backup creado en: ${backupPath}`);
  
  // Agregar endpoint de notificaciones
  const notificationEndpoint = `
// Endpoint de notificaciones
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    console.log('🔔 [GET NOTIFICATIONS] Usuario:', req.user._id);
    console.log('🔔 [GET NOTIFICATIONS] Parámetros:', req.query);
    
    const { accountId, divisionId } = req.query;
    
    if (!accountId || !divisionId) {
      return res.status(400).json({
        success: false,
        message: 'accountId y divisionId son requeridos'
      });
    }
    
    // Simular notificaciones para desarrollo
    const notifications = [
      {
        _id: '507f1f77bcf86cd799439020',
        title: 'Nueva actividad',
        message: 'Se ha creado una nueva actividad',
        type: 'activity',
        read: false,
        createdAt: new Date(),
        accountId: accountId,
        divisionId: divisionId
      },
      {
        _id: '507f1f77bcf86cd799439021',
        title: 'Recordatorio',
        message: 'No olvides revisar las actividades pendientes',
        type: 'reminder',
        read: false,
        createdAt: new Date(),
        accountId: accountId,
        divisionId: divisionId
      }
    ];
    
    console.log('✅ [GET NOTIFICATIONS] Notificaciones obtenidas:', notifications.length);
    
    res.json({
      success: true,
      data: notifications
    });
    
  } catch (error) {
    console.error('❌ [GET NOTIFICATIONS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo notificaciones'
    });
  }
});
`;

  // Buscar donde agregar el endpoint (después de otros endpoints)
  const insertPoint = content.lastIndexOf('app.get(') || content.lastIndexOf('app.post(');
  
  if (insertPoint === -1) {
    console.log('❌ [ADD] No se encontró punto de inserción');
    return;
  }
  
  // Insertar el endpoint
  const newContent = content.slice(0, insertPoint) + notificationEndpoint + content.slice(insertPoint);
  
  // Escribir el archivo modificado
  fs.writeFileSync(serverFile, newContent);
  console.log('✅ [ADD] Endpoint de notificaciones agregado');
  
  console.log('\n🎉 [ADD NOTIFICATIONS ENDPOINT] Endpoint agregado exitosamente');
  console.log('🔄 [ADD] Reinicia el servidor para aplicar los cambios');
  
} catch (error) {
  console.error('❌ [ADD] Error modificando el servidor:', error);
}
