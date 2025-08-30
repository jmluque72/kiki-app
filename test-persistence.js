import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ASSOCIATIONS: 'auth_associations',
};

// Función para probar AsyncStorage
export const testAsyncStorage = async () => {
  try {
    console.log('🧪 Probando AsyncStorage...');
    
    // Datos de prueba
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

    // Guardar datos
    console.log('📝 Guardando datos de prueba...');
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, testToken),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(testUser)),
      AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(testAssociations)),
    ]);

    // Leer datos
    console.log('📖 Leyendo datos guardados...');
    const [savedToken, savedUser, savedAssociations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    // Verificar datos
    console.log('✅ Verificando datos...');
    console.log('Token:', savedToken);
    console.log('User:', savedUser ? JSON.parse(savedUser) : null);
    console.log('Associations:', savedAssociations ? JSON.parse(savedAssociations) : null);

    // Limpiar datos
    console.log('🧹 Limpiando datos de prueba...');
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    console.log('🎉 Prueba de AsyncStorage completada exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error en prueba de AsyncStorage:', error);
    return false;
  }
};

// Función para limpiar todos los datos de autenticación
export const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);
    console.log('✅ Datos de autenticación limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
};

// Función para verificar si hay datos guardados
export const checkStoredAuth = async () => {
  try {
    const [token, user, associations] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
    ]);

    if (token && user) {
      console.log('✅ Datos de autenticación encontrados:');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('User:', JSON.parse(user));
      console.log('Associations:', associations ? JSON.parse(associations) : []);
      return true;
    } else {
      console.log('❌ No hay datos de autenticación guardados');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando datos guardados:', error);
    return false;
  }
}; 