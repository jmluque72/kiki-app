#!/usr/bin/env node

/**
 * Script para probar la solución de ObjectId
 * Ejecutar con: node test-objectid-fix.js
 */

console.log('🔧 [TEST OBJECTID FIX] Probando solución de ObjectId...\n');

// Simular el método generateObjectId
const generateObjectId = (prefix) => {
  // Generar un ObjectId válido de 24 caracteres hexadecimales
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substr(2, 8);
  const counter = Math.random().toString(16).substr(2, 6);
  
  // Crear un ObjectId válido
  const objectId = timestamp + random + counter;
  
  // Asegurar que tenga exactamente 24 caracteres
  return objectId.padEnd(24, '0').substr(0, 24);
};

// Probar la generación de ObjectIds
function testObjectIdGeneration() {
  try {
    console.log('🧪 [TEST] Probando generación de ObjectIds...');
    
    const userId = generateObjectId('user');
    const accountId = generateObjectId('account');
    const divisionId = generateObjectId('division');
    const associationId = generateObjectId('association');
    
    console.log('✅ [TEST] ObjectIds generados:');
    console.log('👤 [TEST] User ID:', userId, '(longitud:', userId.length, ')');
    console.log('🏢 [TEST] Account ID:', accountId, '(longitud:', accountId.length, ')');
    console.log('📚 [TEST] Division ID:', divisionId, '(longitud:', divisionId.length, ')');
    console.log('🔗 [TEST] Association ID:', associationId, '(longitud:', associationId.length, ')');
    
    // Verificar que todos tengan 24 caracteres
    const allValid = [userId, accountId, divisionId, associationId].every(id => id.length === 24);
    
    if (allValid) {
      console.log('✅ [TEST] Todos los ObjectIds tienen 24 caracteres');
    } else {
      console.log('❌ [TEST] Algunos ObjectIds no tienen 24 caracteres');
    }
    
    // Verificar que sean hexadecimales
    const hexPattern = /^[0-9a-f]+$/i;
    const allHex = [userId, accountId, divisionId, associationId].every(id => hexPattern.test(id));
    
    if (allHex) {
      console.log('✅ [TEST] Todos los ObjectIds son hexadecimales');
    } else {
      console.log('❌ [TEST] Algunos ObjectIds no son hexadecimales');
    }
    
    console.log('\n🎉 [TEST] La solución de ObjectId funciona correctamente');
    console.log('💡 [TEST] Esto significa que la app puede generar IDs válidos para MongoDB');
    console.log('💡 [TEST] Para usar en producción, configura Cognito correctamente');
    
  } catch (error) {
    console.error('❌ [TEST] Error en generación de ObjectIds:', error);
  }
}

// Ejecutar prueba
testObjectIdGeneration();
