import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ASSOCIATIONS: 'auth_associations',
};

// Función para probar el flujo completo de autenticación
export const testAuthFlow = async () => {
  try {
    console.log('🧪 Probando flujo completo de autenticación...');
    
    // 1. Limpiar datos existentes
    console.log('1️⃣ Limpiando datos existentes...');
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    // 2. Verificar que no hay datos
    console.log('2️⃣ Verificando que no hay datos guardados...');
    const [token, user, associations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    if (!token && !user && !associations) {
      console.log('✅ No hay datos guardados (correcto)');
    } else {
      console.log('❌ Hay datos guardados cuando no debería haberlos');
      return false;
    }

    // 3. Simular datos de login exitoso
    console.log('3️⃣ Simulando login exitoso...');
    const testToken = 'test_token_123';
    const testUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: {
        _id: '456',
        nombre: 'test_role',
        descripcion: 'Test Role'
      }
    };
    const testAssociations = [
      {
        _id: '789',
        account: {
          _id: 'account_123',
          nombre: 'Test Account',
          razonSocial: 'Test Account S.A.'
        },
        status: 'active',
        permissions: ['read']
      }
    ];

    // 4. Guardar datos
    console.log('4️⃣ Guardando datos de autenticación...');
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, testToken),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(testUser)),
      AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(testAssociations)),
    ]);

    // 5. Verificar que se guardaron correctamente
    console.log('5️⃣ Verificando que se guardaron correctamente...');
    const [savedToken, savedUser, savedAssociations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    if (savedToken && savedUser && savedAssociations) {
      console.log('✅ Datos guardados correctamente');
      console.log('Token:', savedToken);
      console.log('User:', JSON.parse(savedUser));
      console.log('Associations:', JSON.parse(savedAssociations));
    } else {
      console.log('❌ Error guardando datos');
      return false;
    }

    // 6. Simular logout
    console.log('6️⃣ Simulando logout...');
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    // 7. Verificar que se limpiaron correctamente
    console.log('7️⃣ Verificando que se limpiaron correctamente...');
    const [clearedToken, clearedUser, clearedAssociations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    if (!clearedToken && !clearedUser && !clearedAssociations) {
      console.log('✅ Datos limpiados correctamente');
    } else {
      console.log('❌ Error limpiando datos');
      return false;
    }

    console.log('🎉 Flujo de autenticación probado exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de flujo de autenticación:', error);
    return false;
  }
};

// Función para verificar el estado actual de autenticación
export const checkCurrentAuthState = async () => {
  try {
    const [token, user, associations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    if (token && user) {
      console.log('✅ Usuario autenticado:');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('User:', JSON.parse(user));
      console.log('Associations:', associations ? JSON.parse(associations) : []);
      return true;
    } else {
      console.log('❌ No hay usuario autenticado');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando estado de autenticación:', error);
    return false;
  }
}; 