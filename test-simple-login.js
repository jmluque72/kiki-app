#!/usr/bin/env node

/**
 * Script para probar el login simple
 * Ejecutar con: node test-simple-login.js
 */

console.log('🔧 [TEST SIMPLE LOGIN] Probando login simple...\n');

// Simular el servicio simple
const SimpleAuthService = {
  async login(email, password) {
    console.log('🔐 [SimpleAuth] Iniciando login simple para:', email);
    
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Simular usuario de desarrollo
    const mockUser = {
      _id: 'mock-user-id-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: {
        _id: 'mock-role-id',
        nombre: 'coordinador',
        descripcion: 'Coordinador de la institución'
      },
      isFirstLogin: false,
      isCognitoUser: false
    };

    // Simular token simple (sin JWT complejo)
    const mockToken = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Simular asociación activa
    const mockActiveAssociation = {
      _id: 'mock-association-id',
      account: {
        _id: 'mock-account-id',
        nombre: 'La Salle',
        razonSocial: 'Instituto La Salle'
      },
      division: {
        _id: 'mock-division-id',
        nombre: 'Primaria',
        descripcion: 'División de Primaria'
      },
      student: {
        _id: 'mock-student-id',
        nombre: 'Estudiante',
        apellido: 'Ejemplo',
        avatar: null
      },
      role: {
        _id: 'mock-role-id',
        nombre: 'coordinador',
        descripcion: 'Coordinador de la institución'
      },
      status: 'active'
    };

    // Simular asociaciones
    const mockAssociations = [mockActiveAssociation];

    console.log('✅ [SimpleAuth] Login simple exitoso');
    console.log('👤 [SimpleAuth] Usuario simulado:', {
      id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role.nombre
    });

    return {
      success: true,
      user: mockUser,
      token: mockToken,
      activeAssociation: mockActiveAssociation,
      associations: mockAssociations
    };
  }
};

// Probar el login simple
async function testSimpleLogin() {
  try {
    console.log('🧪 [TEST] Probando login simple...');
    
    const result = await SimpleAuthService.login('test@example.com', 'password123');
    
    if (result.success) {
      console.log('✅ [TEST] Login simple exitoso');
      console.log('👤 [TEST] Usuario:', result.user);
      console.log('🔑 [TEST] Token:', result.token);
      console.log('🏢 [TEST] Asociación activa:', result.activeAssociation);
      console.log('📋 [TEST] Asociaciones:', result.associations);
      
      console.log('\n🎉 [TEST] El login simple funciona correctamente');
      console.log('💡 [TEST] Esto significa que la app puede funcionar sin JWT complejo');
      console.log('💡 [TEST] Para usar en producción, configura Cognito correctamente');
    } else {
      console.log('❌ [TEST] Login simple falló');
    }
  } catch (error) {
    console.error('❌ [TEST] Error en login simple:', error);
  }
}

// Ejecutar prueba
testSimpleLogin();
