const axios = require('axios');

async function debugUserSync() {
  console.log('🔍 [DEBUG SYNC] Debuggeando sincronización del usuario...');
  
  try {
    // Paso 1: Login
    console.log('🔐 [DEBUG SYNC] Paso 1: Login...');
    const loginResponse = await axios.post('http://localhost:3000/users/login', {
      email: 'matilanzaco@solvoglobal.com',
      password: 'Matute123$'
    });
    
    console.log('📊 [DEBUG SYNC] Respuesta del login:', {
      success: loginResponse.data.success,
      hasUser: !!loginResponse.data.data?.user,
      hasToken: !!loginResponse.data.data?.token,
      userAvatar: loginResponse.data.data?.user?.avatar,
      avatarType: loginResponse.data.data?.user?.avatar ? 
        (loginResponse.data.data.user.avatar.startsWith('http') ? 'URL completa' : 'Ruta local') : 
        'Sin avatar'
    });
    
    if (!loginResponse.data.success || !loginResponse.data.data?.token) {
      throw new Error('Login falló o no devolvió token');
    }
    
    const token = loginResponse.data.data.token;
    const loginUser = loginResponse.data.data.user;
    
    console.log('✅ [DEBUG SYNC] Login exitoso');
    console.log('👤 [DEBUG SYNC] Usuario del login:', {
      id: loginUser._id,
      email: loginUser.email,
      name: loginUser.name,
      avatar: loginUser.avatar,
      avatarType: loginUser.avatar ? 
        (loginUser.avatar.startsWith('http') ? 'URL completa' : 'Ruta local') : 
        'Sin avatar'
    });
    
    // Paso 2: Obtener información del usuario
    console.log('👤 [DEBUG SYNC] Paso 2: Obteniendo información del usuario...');
    const userResponse = await axios.get('http://localhost:3000/shared/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 [DEBUG SYNC] Respuesta del usuario:', {
      success: userResponse.data.success,
      hasUser: !!userResponse.data.data?.user,
      hasAssociations: !!userResponse.data.data?.associations
    });
    
    if (userResponse.data.success && userResponse.data.data?.user) {
      const user = userResponse.data.data.user;
      
      console.log('👤 [DEBUG SYNC] Usuario obtenido:', {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        avatarType: user.avatar ? 
          (user.avatar.startsWith('http') ? 'URL completa' : 'Ruta local') : 
          'Sin avatar'
      });
      
      // Comparar usuarios
      console.log('🔍 [DEBUG SYNC] Comparando usuarios:');
      console.log('   - IDs iguales:', loginUser._id === user._id);
      console.log('   - Emails iguales:', loginUser.email === user.email);
      console.log('   - Nombres iguales:', loginUser.name === user.name);
      console.log('   - Avatares iguales:', loginUser.avatar === user.avatar);
      
      if (loginUser.avatar !== user.avatar) {
        console.log('⚠️ [DEBUG SYNC] Los avatares son diferentes:');
        console.log('   - Login avatar:', loginUser.avatar);
        console.log('   - User avatar:', user.avatar);
      }
      
      // Verificar si el avatar es URL de S3
      if (user.avatar && user.avatar.startsWith('http')) {
        console.log('✅ [DEBUG SYNC] Avatar es URL completa de S3');
        console.log('🔗 [DEBUG SYNC] URL del avatar:', user.avatar);
        console.log('🔍 [DEBUG SYNC] Es URL de S3:', user.avatar.includes('s3.amazonaws.com'));
        console.log('🔍 [DEBUG SYNC] Tiene parámetros de firma:', user.avatar.includes('AWSAccessKeyId'));
      } else {
        console.log('❌ [DEBUG SYNC] Avatar no es URL completa');
      }
      
    } else {
      console.error('❌ [DEBUG SYNC] No se pudo obtener información del usuario');
    }
    
  } catch (error) {
    console.error('❌ [DEBUG SYNC] Error:', error.message);
    if (error.response) {
      console.error('📊 [DEBUG SYNC] Respuesta del servidor:', error.response.data);
    }
  }
}

debugUserSync();
