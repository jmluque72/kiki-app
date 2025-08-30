const axios = require('axios');

const API_BASE_URL = 'http://192.168.68.109:3000/api';

// Configurar axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testLogin() {
  try {
    console.log('🔍 Probando conectividad con el servidor...');
    
    // Test 1: Verificar que el servidor responde
    try {
      const healthResponse = await apiClient.get('/users');
      console.log('✅ Servidor responde (sin auth):', healthResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Servidor responde (auth requerido):', error.response.status);
      } else {
        console.log('❌ Error de conectividad:', error.message);
        return;
      }
    }

    // Test 2: Probar login
    console.log('\n🔐 Probando login con tutor1@aleman.com...');
    
    const loginData = {
      email: 'tutor1@aleman.com',
      password: 'tutor123'
    };

    const loginResponse = await apiClient.post('/users/login', loginData);
    
    if (loginResponse.data.success) {
      console.log('✅ Login exitoso!');
      console.log('📱 Usuario:', loginResponse.data.data.user.nombre);
      console.log('🔑 Token recibido:', loginResponse.data.data.token ? 'SÍ' : 'NO');
      console.log('👥 Asociaciones:', loginResponse.data.data.associations?.length || 0);
      
      // Test 3: Probar endpoint protegido
      console.log('\n🔒 Probando endpoint protegido...');
      
      const token = loginResponse.data.data.token;
      const protectedResponse = await apiClient.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Endpoint protegido accesible:', protectedResponse.status);
      
    } else {
      console.log('❌ Login falló:', loginResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📄 Response:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testLogin(); 