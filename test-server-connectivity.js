#!/usr/bin/env node

/**
 * Script para probar conectividad con el servidor
 * Ejecutar con: node test-server-connectivity.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 [TEST CONECTIVIDAD] Probando conexión con el servidor...\n');

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
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testConnectivity() {
  try {
    // 1. Probar conectividad básica
    console.log('📡 [TEST] Probando conectividad básica...');
    try {
      const response = await makeRequest(`${serverUrl}/health`);
      console.log('✅ [TEST] Servidor responde en /health');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${response.data.substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ [TEST] Error en /health:', error.message);
    }

    // 2. Probar endpoint de API
    console.log('\n📡 [TEST] Probando endpoint de API...');
    try {
      const response = await makeRequest(`${apiUrl}/health`);
      console.log('✅ [TEST] API responde en /api/health');
      console.log(`   - Status: ${response.status}`);
    } catch (error) {
      console.log('❌ [TEST] Error en /api/health:', error.message);
    }

    // 3. Probar endpoint de login (sin credenciales)
    console.log('\n📡 [TEST] Probando endpoint de login...');
    try {
      const response = await makeRequest(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123'
        })
      });
      console.log('✅ [TEST] Endpoint de login responde');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    } catch (error) {
      console.log('❌ [TEST] Error en /users/login:', error.message);
    }

    // 4. Probar endpoint de Cognito
    console.log('\n📡 [TEST] Probando endpoint de Cognito...');
    try {
      const response = await makeRequest(`${apiUrl}/auth/cognito-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@test.com',
          cognitoToken: 'test-token'
        })
      });
      console.log('✅ [TEST] Endpoint de Cognito responde');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    } catch (error) {
      console.log('❌ [TEST] Error en /auth/cognito-login:', error.message);
    }

  } catch (error) {
    console.log('❌ [TEST] Error general:', error.message);
  }
}

// Ejecutar tests
testConnectivity().then(() => {
  console.log('\n✅ [TEST CONECTIVIDAD] Pruebas completadas');
  console.log('\n💡 [RECOMENDACIONES]:');
  console.log('1. Si el servidor no responde, verifica que esté corriendo');
  console.log('2. Si hay errores de timeout, verifica la red');
  console.log('3. Si hay errores 404, verifica que los endpoints existan');
  console.log('4. Si hay errores 500, revisa los logs del servidor');
}).catch(error => {
  console.log('❌ [TEST CONECTIVIDAD] Error ejecutando tests:', error.message);
});
