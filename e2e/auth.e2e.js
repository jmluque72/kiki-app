const { device, expect, element, by, waitFor } = require('detox');
const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Authentication E2E Tests', () => {
  // beforeAll y beforeEach están en init.js (global)

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', async () => {
      // Forzar que los logs se muestren inmediatamente
      process.stdout.write('\n🧪 ============================================\n');
      process.stdout.write('🧪 [TEST] INICIANDO TEST: should login successfully\n');
      process.stdout.write('🧪 ============================================\n\n');
      
      // Delay inicial para asegurar que la UI esté completamente cargada
      process.stdout.write('⏳ [TEST] Esperando 3 segundos iniciales...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
      process.stdout.write('✅ [TEST] Delay completado\n\n');
      
      // Intentar tomar screenshot para debugging
      try {
        await device.takeScreenshot('test-start');
        process.stdout.write('📸 [TEST] Screenshot tomado: test-start\n');
      } catch (e) {
        process.stdout.write('⚠️ [TEST] No se pudo tomar screenshot\n');
      }
      
      // Esperar a que la pantalla de login esté visible
      process.stdout.write('🔍 [TEST] Buscando pantalla de login (testID: login-screen)...\n');
      try {
        await waitFor(element(Selectors.loginScreen()))
          .toBeVisible()
          .withTimeout(15000);
        process.stdout.write('✅ [TEST] Pantalla de login encontrada y visible\n');
      } catch (error) {
        process.stdout.write(`❌ [TEST] Error al encontrar pantalla de login: ${error.message}\n`);
        // Intentar buscar por texto alternativo
        process.stdout.write('🔍 [TEST] Intentando buscar por texto "KIKI"...\n');
        try {
          await waitFor(element(by.text('KIKI')))
            .toBeVisible()
            .withTimeout(10000);
          process.stdout.write('✅ [TEST] Logo encontrado, continuando...\n');
        } catch (e2) {
          process.stdout.write(`❌ [TEST] Tampoco se encontró el logo: ${e2.message}\n`);
          // Intentar buscar cualquier texto visible
          process.stdout.write('🔍 [TEST] Intentando buscar cualquier elemento visible...\n');
          throw error;
        }
      }
      
      // Esperar a que los inputs estén listos
      console.log('🔍 [TEST] Buscando campo de email...');
      await waitFor(element(Selectors.emailInput()))
        .toBeVisible()
        .withTimeout(5000);
      console.log('✅ [TEST] Campo de email encontrado');
      
      // Verificar que el input es interactuable
      console.log('🔍 [TEST] Verificando que el input de email es interactuable...');
      await expect(element(Selectors.emailInput())).toBeVisible();
      console.log('✅ [TEST] Input de email es interactuable');
      
      // Ingresar credenciales válidas
      console.log('⌨️ [TEST] Escribiendo email...');
      await element(Selectors.emailInput()).typeText('test@example.com');
      console.log('✅ [TEST] Email escrito');
      
      console.log('🔍 [TEST] Buscando campo de contraseña...');
      await waitFor(element(Selectors.passwordInput()))
        .toBeVisible()
        .withTimeout(5000);
      console.log('✅ [TEST] Campo de contraseña encontrado');
      
      console.log('⌨️ [TEST] Escribiendo contraseña...');
      await element(Selectors.passwordInput()).typeText('password123');
      console.log('✅ [TEST] Contraseña escrita');
      
      // Esperar a que el botón esté visible y presionarlo
      console.log('🔍 [TEST] Buscando botón de login...');
      await waitFor(element(Selectors.loginButton()))
        .toBeVisible()
        .withTimeout(5000);
      console.log('✅ [TEST] Botón de login encontrado');
      
      // Verificar que el botón es interactuable
      console.log('🔍 [TEST] Verificando que el botón es interactuable...');
      await expect(element(Selectors.loginButton())).toBeVisible();
      console.log('✅ [TEST] Botón es interactuable');
      
      // Pequeño delay antes de hacer tap
      console.log('⏳ [TEST] Esperando 500ms antes de hacer tap...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('👆 [TEST] Haciendo tap en el botón de login...');
      await element(Selectors.loginButton()).tap();
      console.log('✅ [TEST] Tap realizado');
      
      // Verificar que navegamos a la pantalla de selección de cuenta
      await TestUtils.waitForElement('account-selection-screen', 5000);
      
      // Verificar que se muestra el nombre del usuario
      await expect(element(by.text('Bienvenido, Test User'))).toBeVisible();
    });

    it('should show error with invalid email format', async () => {
      // Ingresar email inválido
      await element(Selectors.emailInput()).typeText('invalid-email');
      await element(Selectors.passwordInput()).typeText('password123');
      await element(Selectors.loginButton()).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Por favor, ingresa un email válido'))).toBeVisible();
    });

    it('should show error with incorrect password', async () => {
      // Ingresar credenciales incorrectas
      await element(Selectors.emailInput()).typeText('test@example.com');
      await element(Selectors.passwordInput()).typeText('wrongpassword');
      await element(Selectors.loginButton()).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Credenciales inválidas'))).toBeVisible();
    });

    it('should show error with non-existent user', async () => {
      // Ingresar credenciales de usuario inexistente
      await element(Selectors.emailInput()).typeText('nonexistent@example.com');
      await element(Selectors.passwordInput()).typeText('password123');
      await element(Selectors.loginButton()).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Usuario no encontrado'))).toBeVisible();
    });

    it('should disable login button while loading', async () => {
      // Ingresar credenciales
      await element(Selectors.emailInput()).typeText('test@example.com');
      await element(Selectors.passwordInput()).typeText('password123');
      
      // Presionar botón de login
      await element(Selectors.loginButton()).tap();
      
      // Verificar que el botón está deshabilitado durante la carga
      await expect(element(Selectors.loginButton())).toHaveId('loading');
    });

    it('should handle network errors gracefully', async () => {
      // Simular modo offline (puede requerir configuración adicional)
      await device.disableSynchronization();
      
      // Intentar login
      await element(Selectors.emailInput()).typeText('test@example.com');
      await element(Selectors.passwordInput()).typeText('password123');
      await element(Selectors.loginButton()).tap();
      
      // Verificar mensaje de error de red
      await expect(element(by.text('Error de red. Verifica tu conexión.'))).toBeVisible();
      
      await device.enableSynchronization();
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login primero
      await TestUtils.login();
      // Seleccionar cuenta (si es necesario)
      await element(by.id('account-1')).tap();
    });

    it('should logout successfully', async () => {
      // Navegar al perfil
      await element(by.id('profile-tab')).tap();
      
      // Presionar botón de logout
      await element(by.id('logout-button')).tap();
      
      // Confirmar logout en el diálogo
      await element(by.text('Sí')).tap();
      
      // Verificar que volvimos a la pantalla de login
      await expect(element(Selectors.loginScreen())).toBeVisible();
      
      // Verificar que no hay sesión activa
      await expect(element(by.id('email-input'))).toHaveText('');
    });

    it('should cancel logout', async () => {
      // Navegar al perfil
      await element(by.id('profile-tab')).tap();
      
      // Presionar botón de logout
      await element(by.id('logout-button')).tap();
      
      // Cancelar logout
      await element(by.text('No')).tap();
      
      // Verificar que seguimos en el perfil
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });
  });

  describe('Remember Me Feature', () => {
    it('should remember credentials when checkbox is selected', async () => {
      // Ingresar credenciales y seleccionar "Recordarme"
      await element(Selectors.emailInput()).typeText('test@example.com');
      await element(Selectors.passwordInput()).typeText('password123');
      await element(by.id('remember-me-checkbox')).tap();
      
      // Login
      await element(Selectors.loginButton()).tap();
      
      // Esperar a que se complete el login
      await TestUtils.waitForElement('home-screen', 5000);
      
      // Logout
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      await element(by.text('Sí')).tap();
      
      // Verificar que las credenciales están recordadas
      await expect(element(Selectors.emailInput())).toHaveText('test@example.com');
    });

    it('should not remember credentials when checkbox is not selected', async () => {
      // Ingresar credenciales sin seleccionar "Recordarme"
      await element(Selectors.emailInput()).typeText('test@example.com');
      await element(Selectors.passwordInput()).typeText('password123');
      // No seleccionar checkbox
      
      // Login
      await element(Selectors.loginButton()).tap();
      
      // Esperar a que se complete el login
      await TestUtils.waitForElement('home-screen', 5000);
      
      // Logout
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      await element(by.text('Sí')).tap();
      
      // Verificar que las credenciales no están recordadas
      await expect(element(Selectors.emailInput())).toHaveText('');
    });
  });

  describe('Biometric Authentication', () => {
    it('should prompt for biometric authentication when available', async () => {
      // Verificar que se muestra opción de autenticación biométrica
      await expect(element(by.id('biometric-login-button'))).toBeVisible();
      
      // Presionar botón biométrico
      await element(by.id('biometric-login-button')).tap();
      
      // Simular autenticación exitosa (esto puede requerir mock específico)
      await device.sendBiometricMatch(true);
      
      // Verificar que se completó el login
      await TestUtils.waitForElement('account-selection-screen', 5000);
    });

    it('should handle biometric authentication failure', async () => {
      // Presionar botón biométrico
      await element(by.id('biometric-login-button')).tap();
      
      // Simular fallo de autenticación biométrica
      await device.sendBiometricMatch(false);
      
      // Verificar que se muestra mensaje de error
      await expect(element(by.text('Autenticación biométrica fallida'))).toBeVisible();
    });
  });

  describe('Session Management', () => {
    it('should maintain session after app restart', async () => {
      // Login
      await TestUtils.login();
      
      // Reiniciar app
      await device.launchApp({ newInstance: true });
      
      // Verificar que el usuario sigue autenticado
      await TestUtils.waitForElement('home-screen', 5000);
      await expect(element(by.id('welcome-message'))).toBeVisible();
    });

    it('should expire session after timeout', async () => {
      // Login
      await TestUtils.login();
      
      // Simular expiración de sesión (esto puede requerir configuración backend)
      // En un escenario real, esto podría requerir manipulación del token JWT
      
      // Intentar acceder a una función protegida
      await element(by.id('protected-action')).tap();
      
      // Verificar que se redirige al login
      await expect(element(Selectors.loginScreen())).toBeVisible();
      await expect(element(by.text('Tu sesión ha expirado'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen reader', async () => {
      // Verificar que los elementos tienen labels de accesibilidad
      await expect(element(by.label('Campo de email'))).toBeVisible();
      await expect(element(by.label('Campo de contraseña'))).toBeVisible();
      await expect(element(by.label('Botón de inicio de sesión'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      // Navegar con tab (esto puede requerir configuración específica del dispositivo)
      await element(Selectors.emailInput()).tap();
      await element(Selectors.emailInput()).typeText('test@example.com');
      
      // Moverse al siguiente campo
      await element(by.id('next-button')).tap();
      
      // Verificar que el foco está en el campo de contraseña
      await expect(element(Selectors.passwordInput())).toBeFocused();
    });
  });

  afterAll(async () => {
    // Limpiar cualquier estado residual
    await device.uninstallApp();
  });
});