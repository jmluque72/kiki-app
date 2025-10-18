#!/usr/bin/env node

/**
 * Script para probar diferentes métodos de login
 * Ejecutar con: node test-login-methods.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 [TEST LOGIN METHODS] Probando diferentes métodos de login...\n');

const serverUrl = 'http://192.168.68.101:3000';
const apiUrl = `${serverUrl}/api`;

// Función para hacer petición HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testLoginMethods() {
  const testEmail = 'matilanzaco@solvoglobal.com';
  const testPassword = 'Matute123!';
  
  console.log(`📧 [TEST] Email: ${testEmail}`);
  console.log(`🔑 [TEST] Password: ${testPassword.substring(0, 3)}***\n`);

  // 1. Probar login directo con bypass
  console.log('🔧 [TEST] Método 1: Login directo con bypass...');
  try {
    const response = await makeRequest(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Development-Mode': 'true',
        'X-Bypass-Cognito': 'true'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        bypassCognito: true,
        developmentMode: true
      })
    });
    
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    
    if (response.status === 200) {
      console.log('✅ [TEST] Método 1: ÉXITO');
    } else {
      console.log('❌ [TEST] Método 1: FALLO');
    }
  } catch (error) {
    console.log('❌ [TEST] Método 1: ERROR -', error.message);
  }

  // 2. Probar login con Cognito simulado
  console.log('\n🔧 [TEST] Método 2: Login con Cognito simulado...');
  try {
    const mockToken = `mock-cognito-token-${Date.now()}`;
    const response = await makeRequest(`${apiUrl}/auth/cognito-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        cognitoToken: mockToken
      })
    });
    
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    
    if (response.status === 200) {
      console.log('✅ [TEST] Método 2: ÉXITO');
    } else {
      console.log('❌ [TEST] Método 2: FALLO');
    }
  } catch (error) {
    console.log('❌ [TEST] Método 2: ERROR -', error.message);
  }

  // 3. Probar login legacy normal
  console.log('\n🔧 [TEST] Método 3: Login legacy normal...');
  try {
    const response = await makeRequest(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    
    if (response.status === 200) {
      console.log('✅ [TEST] Método 3: ÉXITO');
    } else {
      console.log('❌ [TEST] Método 3: FALLO');
    }
  } catch (error) {
    console.log('❌ [TEST] Método 3: ERROR -', error.message);
  }

  console.log('\n📊 [RESUMEN] Resultados:');
  console.log('1. Login directo con bypass: Verificar si el servidor acepta headers de bypass');
  console.log('2. Login con Cognito simulado: Verificar si el endpoint /auth/cognito-login existe');
  console.log('3. Login legacy normal: Verificar si el servidor permite login sin Cognito');
  
  console.log('\n💡 [RECOMENDACIONES]:');
  console.log('- Si el método 1 funciona: El servidor acepta bypass, usar ese método');
  console.log('- Si el método 2 funciona: El endpoint de Cognito existe, usar ese método');
  console.log('- Si el método 3 funciona: El servidor permite login legacy, usar ese método');
  console.log('- Si ninguno funciona: Revisar la configuración del servidor');
}

// Ejecutar tests
testLoginMethods().then(() => {
  console.log('\n✅ [TEST LOGIN METHODS] Pruebas completadas');
}).catch(error => {
  console.log('❌ [TEST LOGIN METHODS] Error ejecutando tests:', error.message);
});
