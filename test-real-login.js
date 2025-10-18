#!/usr/bin/env node

/**
 * Script para probar login con credenciales reales
 * Ejecutar con: node test-real-login.js
 */

const axios = require('axios');

console.log('🔧 [TEST REAL LOGIN] Probando login con credenciales reales...\n');

// Configuración de la API
const API_BASE_URL = 'http://192.168.68.101:3000';

// Credenciales comunes para probar
const TEST_CREDENTIALS = [
  { email: 'admin@kiki.com.ar', password: 'admin123' },
  { email: 'admin@kiki.com', password: 'admin123' },
  { email: 'test@kiki.com.ar', password: 'test123' },
  { email: 'coordinador@kiki.com.ar', password: 'coordinador123' },
  { email: 'matilanzaco@solvoglobal.com', password: 'password123' }
];

// Función para probar login con credenciales
async function testLoginWithCredentials(email, password) {
  try {
    console.log(`🔐 [TEST] Probando login con: ${email}`);
    
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      console.log('✅ [TEST] Login exitoso!');
      console.log('👤 [TEST] Usuario:', response.data.data.user);
      console.log('🔑 [TEST] Token:', response.data.data.token ? 'Token válido' : 'Sin token');
      console.log('🏢 [TEST] Asociación activa:', response.data.data.activeAssociation ? 'Sí' : 'No');
      return true;
    } else {
      console.log('❌ [TEST] Login falló:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ [TEST] Error del servidor:', error.response.status, error.response.data.message);
    } else {
      console.log('❌ [TEST] Error de conexión:', error.message);
    }
    return false;
  }
}

// Función principal
async function runTest() {
  try {
    console.log('🧪 [TEST] Probando credenciales comunes...');
    
    for (const credentials of TEST_CREDENTIALS) {
      const success = await testLoginWithCredentials(credentials.email, credentials.password);
      if (success) {
        console.log('\n🎉 [TEST] ¡Login exitoso con credenciales válidas!');
        console.log(`💡 [TEST] Usa estas credenciales en la app: ${credentials.email}`);
        return;
      }
    }
    
    console.log('\n❌ [TEST] Ninguna credencial funcionó');
    console.log('💡 [TEST] Necesitas crear un usuario en el servidor o usar credenciales válidas');
    
  } catch (error) {
    console.error('❌ [TEST] Error en la prueba:', error);
  }
}

// Ejecutar prueba
runTest();
