const axios = require('axios');

async function testAvatarFix() {
  console.log('🧪 [TEST AVATAR] Probando fix del avatar...');
  
  try {
    // Simular login
    console.log('🔐 [TEST AVATAR] Simulando login...');
    const loginResponse = await axios.post('http://localhost:3000/users/login', {
      email: 'matilanzaco@solvoglobal.com',
      password: 'Matute123$'
    });
    
    console.log('✅ [TEST AVATAR] Login exitoso');
    console.log('📊 [TEST AVATAR] Respuesta del login:', {
      success: loginResponse.data.success,
      hasUser: !!loginResponse.data.data?.user,
      hasToken: !!loginResponse.data.data?.token,
      hasAssociations: !!loginResponse.data.data?.associations
    });
    
    if (loginResponse.data.success && loginResponse.data.data?.token) {
      const token = loginResponse.data.data.token;
      
      // Probar endpoint de usuario
      console.log('👤 [TEST AVATAR] Obteniendo información del usuario...');
      const userResponse = await axios.get('http://localhost:3000/shared/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 [TEST AVATAR] Respuesta del usuario:', {
        success: userResponse.data.success,
        hasUser: !!userResponse.data.data?.user,
        hasAssociations: !!userResponse.data.data?.associations,
        userAvatar: userResponse.data.data?.user?.avatar,
        avatarType: userResponse.data.data?.user?.avatar ? 
          (userResponse.data.data.user.avatar.startsWith('http') ? 'URL completa' : 'Ruta local') : 
          'Sin avatar'
      });
      
      if (userResponse.data.data?.user?.avatar) {
        console.log('🖼️ [TEST AVATAR] Avatar URL:', userResponse.data.data.user.avatar);
        console.log('🔍 [TEST AVATAR] Es URL de S3:', userResponse.data.data.user.avatar.includes('s3.amazonaws.com'));
        console.log('🔍 [TEST AVATAR] Tiene parámetros de firma:', userResponse.data.data.user.avatar.includes('AWSAccessKeyId'));
      }
      
    } else {
      console.error('❌ [TEST AVATAR] Login falló o no devolvió token');
    }
    
  } catch (error) {
    console.error('❌ [TEST AVATAR] Error en la prueba:', error.message);
    if (error.response) {
      console.error('📊 [TEST AVATAR] Respuesta del servidor:', error.response.data);
    }
  }
}

testAvatarFix();
