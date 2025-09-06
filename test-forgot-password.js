const axios = require('axios');

// Simular la configuración de la app
const API_BASE_URL = 'http://localhost:3000';

async function testForgotPassword() {
  try {
    console.log('🧪 Probando endpoint de forgot-password...');
    
    const response = await axios.post(`${API_BASE_URL}/users/forgot-password`, {
      email: 'admin@kiki.com.ar'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta exitosa:', response.data);
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('🔗 URL:', error.config?.url);
  }
}

testForgotPassword();
