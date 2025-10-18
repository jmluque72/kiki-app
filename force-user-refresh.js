const axios = require('axios');

async function forceUserRefresh() {
  console.log('🔄 [FORCE REFRESH] Forzando actualización del usuario...');
  
  try {
    // Login para obtener token
    console.log('🔐 [FORCE REFRESH] Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3000/users/login', {
      email: 'matilanzaco@solvoglobal.com',
      password: 'Matute123$'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login falló');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ [FORCE REFRESH] Login exitoso, token obtenido');
    
    // Obtener información actualizada del usuario
    console.log('👤 [FORCE REFRESH] Obteniendo información actualizada del usuario...');
    const userResponse = await axios.get('http://localhost:3000/shared/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (userResponse.data.success && userResponse.data.data?.user) {
      const user = userResponse.data.data.user;
      console.log('✅ [FORCE REFRESH] Usuario obtenido exitosamente');
      console.log('👤 [FORCE REFRESH] Información del usuario:');
      console.log('   - ID:', user._id);
      console.log('   - Email:', user.email);
      console.log('   - Nombre:', user.name);
      console.log('   - Rol:', user.role?.nombre);
      console.log('   - Avatar:', user.avatar);
      console.log('   - Tipo de avatar:', user.avatar ? 
        (user.avatar.startsWith('http') ? 'URL completa' : 'Ruta local') : 
        'Sin avatar');
      
      if (user.avatar && user.avatar.startsWith('http')) {
        console.log('🖼️ [FORCE REFRESH] Avatar es URL completa de S3');
        console.log('🔗 [FORCE REFRESH] URL del avatar:', user.avatar);
      } else {
        console.log('❌ [FORCE REFRESH] Avatar no es URL completa');
      }
      
      // Simular actualización en la app
      console.log('🔄 [FORCE REFRESH] Simulando actualización en la app...');
      console.log('📱 [FORCE REFRESH] La app debería actualizar el usuario con estos datos');
      
    } else {
      console.error('❌ [FORCE REFRESH] No se pudo obtener información del usuario');
    }
    
  } catch (error) {
    console.error('❌ [FORCE REFRESH] Error:', error.message);
    if (error.response) {
      console.error('📊 [FORCE REFRESH] Respuesta del servidor:', error.response.data);
    }
  }
}

forceUserRefresh();
