#!/usr/bin/env node

/**
 * Script para probar el login mock
 * Ejecutar con: node test-mock-login.js
 */

console.log('🔧 [TEST MOCK LOGIN] Probando login mock...\n');

// Simular el servicio mock
const MockAuthService = {
  async login(email, password) {
    console.log('🔐 [MockAuth] Iniciando login simulado para:', email);
    
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

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

    const mockToken = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

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

    const mockAssociations = [mockActiveAssociation];

    console.log('✅ [MockAuth] Login simulado exitoso');
    console.log('👤 [MockAuth] Usuario simulado:', {
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

// Probar el login mock
async function testMockLogin() {
  try {
    console.log('🧪 [TEST] Probando login mock...');
    
    const result = await MockAuthService.login('test@example.com', 'password123');
    
    if (result.success) {
      console.log('✅ [TEST] Login mock exitoso');
      console.log('👤 [TEST] Usuario:', result.user);
      console.log('🔑 [TEST] Token:', result.token);
      console.log('🏢 [TEST] Asociación activa:', result.activeAssociation);
      console.log('📋 [TEST] Asociaciones:', result.associations);
      
      console.log('\n🎉 [TEST] El login mock funciona correctamente');
      console.log('💡 [TEST] Esto significa que la app puede funcionar sin el servidor');
      console.log('💡 [TEST] Para usar en producción, configura Cognito correctamente');
    } else {
      console.log('❌ [TEST] Login mock falló');
    }
  } catch (error) {
    console.error('❌ [TEST] Error en login mock:', error);
  }
}

// Ejecutar prueba
testMockLogin();
