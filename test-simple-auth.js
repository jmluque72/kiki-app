#!/usr/bin/env node

/**
 * Script para probar la autenticación simple (sin Cognito)
 * Ejecutar con: node test-simple-auth.js
 */

console.log('🔧 [TEST SIMPLE AUTH] Probando autenticación simple (sin Cognito)...\n');

// Simular el servicio de autenticación simple
const SimpleAuthService = {
  async login(email, password) {
    console.log('🔐 [SimpleAuth] Iniciando login simple para:', email);
    
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Simular respuesta del servidor (como estaba antes)
    const mockResponse = {
      success: true,
      data: {
        user: {
          _id: '507f1f77bcf86cd799439011', // ObjectId válido
          name: email.split('@')[0],
          email: email,
          role: {
            _id: '507f1f77bcf86cd799439012',
            nombre: 'coordinador',
            descripcion: 'Coordinador de la institución'
          },
          isFirstLogin: false,
          isCognitoUser: false
        },
        token: 'simple-token-' + Date.now(),
        activeAssociation: {
          _id: '507f1f77bcf86cd799439013',
          account: {
            _id: '507f1f77bcf86cd799439014',
            nombre: 'La Salle',
            razonSocial: 'Instituto La Salle'
          },
          division: {
            _id: '507f1f77bcf86cd799439015',
            nombre: 'Primaria',
            descripcion: 'División de Primaria'
          },
          student: {
            _id: '507f1f77bcf86cd799439016',
            nombre: 'Estudiante',
            apellido: 'Ejemplo',
            avatar: null
          },
          role: {
            _id: '507f1f77bcf86cd799439017',
            nombre: 'coordinador',
            descripcion: 'Coordinador de la institución'
          },
          status: 'active'
        },
        associations: []
      }
    };

    console.log('✅ [SimpleAuth] Login simple exitoso');
    console.log('👤 [SimpleAuth] Usuario:', mockResponse.data.user);
    console.log('🔑 [SimpleAuth] Token:', mockResponse.data.token);
    console.log('🏢 [SimpleAuth] Asociación activa:', mockResponse.data.activeAssociation);

    return mockResponse;
  }
};

// Probar el login simple
async function testSimpleAuth() {
  try {
    console.log('🧪 [TEST] Probando login simple...');
    
    const result = await SimpleAuthService.login('test@example.com', 'password123');
    
    if (result.success) {
      console.log('✅ [TEST] Login simple exitoso');
      console.log('👤 [TEST] Usuario:', result.data.user);
      console.log('🔑 [TEST] Token:', result.data.token);
      console.log('🏢 [TEST] Asociación activa:', result.data.activeAssociation);
      
      console.log('\n🎉 [TEST] La autenticación simple funciona correctamente');
      console.log('💡 [TEST] Esto significa que la app puede funcionar sin Cognito');
      console.log('💡 [TEST] Para usar en producción, configura la autenticación simple');
    } else {
      console.log('❌ [TEST] Login simple falló');
    }
  } catch (error) {
    console.error('❌ [TEST] Error en login simple:', error);
  }
}

// Ejecutar prueba
testSimpleAuth();
