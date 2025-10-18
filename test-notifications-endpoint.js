#!/usr/bin/env node

/**
 * Script para probar el endpoint de notificaciones
 * Ejecutar con: node test-notifications-endpoint.js
 */

const axios = require('axios');

console.log('🔧 [TEST NOTIFICATIONS ENDPOINT] Probando endpoint de notificaciones...\n');

// Configuración de la API
const API_BASE_URL = 'http://192.168.68.101:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 [TEST] Haciendo login...');
    
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.success) {
      console.log('✅ [TEST] Login exitoso');
      return response.data.data.token;
    } else {
      throw new Error(response.data.message || 'Error en el login');
    }
  } catch (error) {
    console.error('❌ [TEST] Error en login:', error.message);
    return null;
  }
}

// Función para probar el endpoint de notificaciones
async function testNotifications(token) {
  try {
    console.log('🔔 [TEST] Probando endpoint de notificaciones...');
    
    const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        accountId: '507f1f77bcf86cd799439014',
        divisionId: '507f1f77bcf86cd799439015'
      }
    });
    
    if (response.data.success) {
      console.log('✅ [TEST] Endpoint de notificaciones funciona');
      console.log('📱 [TEST] Notificaciones obtenidas:', response.data.data.length);
      console.log('📱 [TEST] Datos:', response.data.data);
    } else {
      console.log('❌ [TEST] Endpoint de notificaciones falló:', response.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ [TEST] Error en endpoint de notificaciones:', error.response.status, error.response.data);
    } else {
      console.error('❌ [TEST] Error de conexión:', error.message);
    }
  }
}

// Función principal
async function runTest() {
  try {
    console.log('🧪 [TEST] Iniciando prueba de notificaciones...');
    
    // Paso 1: Login
    const token = await login();
    if (!token) {
      console.log('❌ [TEST] No se pudo obtener token, abortando prueba');
      return;
    }
    
    // Paso 2: Probar notificaciones
    await testNotifications(token);
    
    console.log('\n🎉 [TEST] Prueba completada');
    
  } catch (error) {
    console.error('❌ [TEST] Error en la prueba:', error);
  }
}

// Ejecutar prueba
runTest();
