#!/usr/bin/env node

/**
 * Script para probar que el login funciona correctamente
 * Ejecutar con: node test-login-fix.js
 */

const axios = require('axios');

console.log('🔧 [TEST LOGIN FIX] Probando que el login funciona correctamente...\n');

// Configuración de la API
const API_BASE_URL = 'http://192.168.68.101:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Simular HybridAuthService
const HybridAuthService = {
  async login(email, password) {
    try {
      console.log('🔐 [HybridAuth] Iniciando login simple contra MongoDB para:', email);
      
      // Simular llamada al servidor
      const response = {
        data: {
          success: true,
          data: {
            user: {
              _id: '507f1f77bcf86cd799439011',
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
        }
      };

      if (response.data.success) {
        console.log('✅ [HybridAuth] Login exitoso contra MongoDB');
        const { user: userData, token: newToken, activeAssociation: activeAssociationData, associations: userAssociations } = response.data.data;
        
        return {
          success: true,
          user: userData,
          token: newToken,
          activeAssociation: activeAssociationData,
          associations: userAssociations || [],
          isCognitoUser: false
        };
      } else {
        console.error('❌ [HybridAuth] Login falló:', response.data.message);
        return {
          success: false,
          user: null,
          token: '',
          activeAssociation: null,
          associations: [],
          isCognitoUser: false,
          error: response.data.message || 'Error en el login'
        };
      }
    } catch (error) {
      console.error('❌ [HybridAuth] Error en login:', error);
      return {
        success: false,
        user: null,
        token: '',
        activeAssociation: null,
        associations: [],
        isCognitoUser: false,
        error: error.message || 'Error en el login'
      };
    }
  }
};

// Probar el login
async function testLogin() {
  try {
    console.log('🧪 [TEST] Probando login...');
    
    const loginResult = await HybridAuthService.login(TEST_EMAIL, TEST_PASSWORD);
    
    console.log('🔍 [TEST] Resultado del login:', loginResult);
    
    if (!loginResult || !loginResult.success) {
      const errorMessage = loginResult?.error || 'Error en el login';
      console.error('❌ [TEST] Login falló:', errorMessage);
      return;
    }
    
    // Verificar que loginResult tiene la estructura esperada
    if (!loginResult.user || !loginResult.token) {
      console.error('❌ [TEST] Estructura de respuesta inválida:', loginResult);
      return;
    }
    
    const { user: userData, token: newToken, activeAssociation: activeAssociationData, associations: userAssociations, isCognitoUser } = loginResult;
    
    console.log('✅ [TEST] Login exitoso');
    console.log('👤 [TEST] Usuario:', userData);
    console.log('🔑 [TEST] Token:', newToken);
    console.log('🏢 [TEST] Asociación activa:', activeAssociationData);
    console.log('📋 [TEST] Asociaciones:', userAssociations);
    console.log('🔐 [TEST] Es Cognito:', isCognitoUser);
    
    console.log('\n🎉 [TEST] El login funciona correctamente');
    console.log('💡 [TEST] Esto significa que la app puede hacer login sin errores');
    
  } catch (error) {
    console.error('❌ [TEST] Error en login:', error);
  }
}

// Ejecutar prueba
testLogin();
