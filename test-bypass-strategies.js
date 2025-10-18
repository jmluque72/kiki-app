#!/usr/bin/env node

/**
 * Script para probar diferentes estrategias de bypass
 * Ejecutar con: node test-bypass-strategies.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 [TEST BYPASS STRATEGIES] Probando estrategias de bypass...\n');

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

async function testBypassStrategies() {
  const testEmail = 'matilanzaco@solvoglobal.com';
  const testPassword = 'Matute123!';
  
  console.log(`📧 [TEST] Email: ${testEmail}`);
  console.log(`🔑 [TEST] Password: ${testPassword.substring(0, 3)}***\n`);

  // Estrategia 1: Headers especiales
  console.log('🔧 [TEST] Estrategia 1: Headers especiales...');
  try {
    const response = await makeRequest(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Force-Legacy': 'true',
        'X-Bypass-Cognito': 'true',
        'X-Development-Mode': 'true',
        'X-Client-Version': '1.0.0-dev'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        forceLegacy: true,
        bypassCognito: true,
        developmentMode: true
      })
    });
    
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    
    if (response.status === 200 && !response.data.includes('Cognito')) {
      console.log('✅ [TEST] Estrategia 1: ÉXITO - Bypass funcionó');
      return;
    } else {
      console.log('❌ [TEST] Estrategia 1: FALLO - Sigue forzando Cognito');
    }
  } catch (error) {
    console.log('❌ [TEST] Estrategia 1: ERROR -', error.message);
  }

  // Estrategia 2: Parámetros de query
  console.log('\n🔧 [TEST] Estrategia 2: Parámetros de query...');
  try {
    const response = await makeRequest(`${apiUrl}/users/login?forceLegacy=true&bypassCognito=true`, {
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
    
    if (response.status === 200 && !response.data.includes('Cognito')) {
      console.log('✅ [TEST] Estrategia 2: ÉXITO - Bypass funcionó');
      return;
    } else {
      console.log('❌ [TEST] Estrategia 2: FALLO - Sigue forzando Cognito');
    }
  } catch (error) {
    console.log('❌ [TEST] Estrategia 2: ERROR -', error.message);
  }

  // Estrategia 3: User-agent especial
  console.log('\n🔧 [TEST] Estrategia 3: User-agent especial...');
  try {
    const response = await makeRequest(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KikiApp-Development/1.0.0 (Bypass-Cognito)',
        'X-Client-Type': 'mobile-development'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Response: ${response.data.substring(0, 200)}...`);
    
    if (response.status === 200 && !response.data.includes('Cognito')) {
      console.log('✅ [TEST] Estrategia 3: ÉXITO - Bypass funcionó');
      return;
    } else {
      console.log('❌ [TEST] Estrategia 3: FALLO - Sigue forzando Cognito');
    }
  } catch (error) {
    console.log('❌ [TEST] Estrategia 3: ERROR -', error.message);
  }

  // Estrategia 4: Endpoint alternativo
  console.log('\n🔧 [TEST] Estrategia 4: Endpoint alternativo...');
  try {
    const response = await makeRequest(`${apiUrl}/auth/legacy-login`, {
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
      console.log('✅ [TEST] Estrategia 4: ÉXITO - Endpoint alternativo existe');
      return;
    } else {
      console.log('❌ [TEST] Estrategia 4: FALLO - Endpoint no existe');
    }
  } catch (error) {
    console.log('❌ [TEST] Estrategia 4: ERROR -', error.message);
  }

  console.log('\n📊 [RESUMEN] Resultados:');
  console.log('❌ Todas las estrategias de bypass fallaron');
  console.log('💡 El servidor está configurado para forzar Cognito sin excepciones');
  
  console.log('\n🔧 [SOLUCIONES ALTERNATIVAS]:');
  console.log('1. Modificar el servidor para permitir bypass en desarrollo');
  console.log('2. Configurar Cognito correctamente');
  console.log('3. Crear un endpoint especial para desarrollo');
  console.log('4. Usar variables de entorno para controlar el comportamiento');
}

// Ejecutar tests
testBypassStrategies().then(() => {
  console.log('\n✅ [TEST BYPASS STRATEGIES] Pruebas completadas');
}).catch(error => {
  console.log('❌ [TEST BYPASS STRATEGIES] Error ejecutando tests:', error.message);
});
