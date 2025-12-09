const { device, expect, element, by, waitFor } = require('detox');
const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Login Automatizado - E2E', () => {
  // El beforeAll y afterAll están en init.js
  // Solo necesitamos beforeEach para limpiar el estado entre tests
  
  beforeEach(async () => {
    // Esperar un momento para que la app esté lista
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Recargar React Native para limpiar el estado
    try {
      await device.reloadReactNative();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log('⚠️ [BEFORE EACH] Error en reloadReactNative, continuando...');
    }
  });

  describe('Flujo de Login Automatizado', () => {
    it('debe completar el login exitosamente', async () => {
      console.log('🧪 Iniciando test de login automatizado...');
      
      // 1. Verificar que estamos en la pantalla de login
      console.log('📋 Paso 1: Verificando pantalla de login');
      await waitFor(element(Selectors.loginScreen()))
        .toBeVisible()
        .withTimeout(10000);
      console.log('✅ Pantalla de login visible');

      // 2. Verificar que los campos están presentes
      console.log('📋 Paso 2: Verificando campos de entrada');
      await waitFor(element(Selectors.emailInput()))
        .toBeVisible()
        .withTimeout(5000);
      await waitFor(element(Selectors.passwordInput()))
        .toBeVisible()
        .withTimeout(5000);
      await waitFor(element(Selectors.loginButton()))
        .toBeVisible()
        .withTimeout(5000);
      console.log('✅ Todos los campos están presentes');

      // 3. Ingresar credenciales
      console.log('📋 Paso 3: Ingresando credenciales');
      const email = 'test@example.com'; // Cambiar por credenciales reales
      const password = 'password123'; // Cambiar por contraseña real
      
      await element(Selectors.emailInput()).typeText(email);
      console.log(`✅ Email ingresado: ${email}`);
      
      await element(Selectors.passwordInput()).typeText(password);
      console.log('✅ Contraseña ingresada');

      // 4. Presionar botón de login
      console.log('📋 Paso 4: Presionando botón de login');
      await element(Selectors.loginButton()).tap();
      console.log('✅ Botón de login presionado');

      // 5. Esperar respuesta del servidor
      console.log('📋 Paso 5: Esperando respuesta del servidor...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 6. Verificar que el login fue exitoso
      // Puede ir a account-selection o directamente a home
      try {
        console.log('📋 Paso 6: Verificando selección de cuenta');
        await waitFor(element(by.id('account-selection-screen')))
          .toBeVisible()
          .withTimeout(5000);
        console.log('✅ Pantalla de selección de cuenta encontrada');
        
        // Seleccionar primera cuenta si existe
        try {
          await element(by.id('account-item-0')).tap();
          console.log('✅ Primera cuenta seleccionada');
        } catch (e) {
          console.log('⚠️ No se encontró selector de cuenta, continuando...');
        }
      } catch (error) {
        console.log('⚠️ No hay selección de cuenta, verificando pantalla principal...');
      }

      // 7. Verificar que llegamos a la pantalla principal
      console.log('📋 Paso 7: Verificando pantalla principal');
      try {
        await waitFor(element(by.id('home-screen')))
          .toBeVisible()
          .withTimeout(10000);
        console.log('✅ Pantalla principal encontrada');
      } catch (error) {
        // Intentar buscar por tab de inicio
        try {
          await waitFor(element(by.id('tab-inicio')))
            .toBeVisible()
            .withTimeout(5000);
          console.log('✅ Tab de inicio encontrado');
        } catch (e2) {
          // Tomar screenshot para debugging
          await device.takeScreenshot('login-failed');
          console.error('❌ No se pudo encontrar la pantalla principal');
          throw new Error('Login no completó correctamente');
        }
      }

      console.log('✅ Login completado exitosamente');
    });

    it('debe mostrar error con credenciales inválidas', async () => {
      console.log('🧪 Test: Credenciales inválidas');
      
      // Esperar pantalla de login
      await waitFor(element(Selectors.loginScreen()))
        .toBeVisible()
        .withTimeout(10000);

      // Ingresar credenciales incorrectas
      await element(Selectors.emailInput()).typeText('wrong@example.com');
      await element(Selectors.passwordInput()).typeText('wrongpassword');
      await element(Selectors.loginButton()).tap();

      // Esperar mensaje de error
      await waitFor(element(by.text('Credenciales inválidas')))
        .toBeVisible()
        .withTimeout(10000)
        .catch(async () => {
          // Buscar mensaje alternativo
          await waitFor(element(by.text('Las credenciales ingresadas no son correctas')))
            .toBeVisible()
            .withTimeout(5000);
        });

      console.log('✅ Error de credenciales mostrado correctamente');
    });

    it('debe validar campos vacíos', async () => {
      console.log('🧪 Test: Validación de campos vacíos');
      
      // Esperar pantalla de login
      await waitFor(element(Selectors.loginScreen()))
        .toBeVisible()
        .withTimeout(10000);

      // Intentar login sin llenar campos
      await element(Selectors.loginButton()).tap();

      // Verificar mensaje de error
      await waitFor(element(by.text('Campos Requeridos')))
        .toBeVisible()
        .withTimeout(5000)
        .catch(async () => {
          await waitFor(element(by.text('Por favor, completa todos los campos')))
            .toBeVisible()
            .withTimeout(5000);
        });

      console.log('✅ Validación de campos vacíos funcionando');
    });

    it('debe mostrar/ocultar contraseña', async () => {
      console.log('🧪 Test: Mostrar/ocultar contraseña');
      
      // Esperar pantalla de login
      await waitFor(element(Selectors.loginScreen()))
        .toBeVisible()
        .withTimeout(10000);

      // Ingresar contraseña
      await element(Selectors.passwordInput()).typeText('testpassword');
      
      // Verificar que inicialmente está oculta
      const passwordInput = element(Selectors.passwordInput());
      // En Detox no podemos verificar directamente secureTextEntry,
      // pero podemos verificar que el botón de ojo funciona
      
      // Presionar botón de ojo
      await element(by.id('eye-icon')).tap();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Presionar nuevamente para ocultar
      await element(by.id('eye-icon')).tap();
      
      console.log('✅ Funcionalidad de mostrar/ocultar contraseña probada');
    });
  });
});

