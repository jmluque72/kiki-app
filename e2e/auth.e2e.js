const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Authentication E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        camera: 'YES',
        photos: 'YES',
        notifications: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', async () => {
      // Verificar que estamos en la pantalla de login
      await expect(element(Selectors.loginScreen)).toBeVisible();
      
      // Ingresar credenciales válidas
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      
      // Presionar botón de login
      await element(Selectors.loginButton).tap();
      
      // Verificar que navegamos a la pantalla de selección de cuenta
      await TestUtils.waitForElement('account-selection-screen', 5000);
      
      // Verificar que se muestra el nombre del usuario
      await expect(element(by.text('Bienvenido, Test User'))).toBeVisible();
    });

    it('should show error with invalid email format', async () => {
      // Ingresar email inválido
      await element(Selectors.emailInput).typeText('invalid-email');
      await element(Selectors.passwordInput).typeText('password123');
      await element(Selectors.loginButton).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Por favor, ingresa un email válido'))).toBeVisible();
    });

    it('should show error with incorrect password', async () => {
      // Ingresar credenciales incorrectas
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('wrongpassword');
      await element(Selectors.loginButton).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Credenciales inválidas'))).toBeVisible();
    });

    it('should show error with non-existent user', async () => {
      // Ingresar credenciales de usuario inexistente
      await element(Selectors.emailInput).typeText('nonexistent@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      await element(Selectors.loginButton).tap();
      
      // Verificar mensaje de error
      await expect(element(by.text('Usuario no encontrado'))).toBeVisible();
    });

    it('should disable login button while loading', async () => {
      // Ingresar credenciales
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      
      // Presionar botón de login
      await element(Selectors.loginButton).tap();
      
      // Verificar que el botón está deshabilitado durante la carga
      await expect(element(Selectors.loginButton)).toHaveId('loading');
    });

    it('should handle network errors gracefully', async () => {
      // Simular modo offline (puede requerir configuración adicional)
      await device.disableSynchronization();
      
      // Intentar login
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      await element(Selectors.loginButton).tap();
      
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
      await expect(element(Selectors.loginScreen)).toBeVisible();
      
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
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      await element(by.id('remember-me-checkbox')).tap();
      
      // Login
      await element(Selectors.loginButton).tap();
      
      // Esperar a que se complete el login
      await TestUtils.waitForElement('home-screen', 5000);
      
      // Logout
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      await element(by.text('Sí')).tap();
      
      // Verificar que las credenciales están recordadas
      await expect(element(Selectors.emailInput)).toHaveText('test@example.com');
    });

    it('should not remember credentials when checkbox is not selected', async () => {
      // Ingresar credenciales sin seleccionar "Recordarme"
      await element(Selectors.emailInput).typeText('test@example.com');
      await element(Selectors.passwordInput).typeText('password123');
      // No seleccionar checkbox
      
      // Login
      await element(Selectors.loginButton).tap();
      
      // Esperar a que se complete el login
      await TestUtils.waitForElement('home-screen', 5000);
      
      // Logout
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();
      await element(by.text('Sí')).tap();
      
      // Verificar que las credenciales no están recordadas
      await expect(element(Selectors.emailInput)).toHaveText('');
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
      await expect(element(Selectors.loginScreen)).toBeVisible();
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
      await element(Selectors.emailInput).tap();
      await element(Selectors.emailInput).typeText('test@example.com');
      
      // Moverse al siguiente campo
      await element(by.id('next-button')).tap();
      
      // Verificar que el foco está en el campo de contraseña
      await expect(element(Selectors.passwordInput)).toBeFocused();
    });
  });

  afterAll(async () => {
    // Limpiar cualquier estado residual
    await device.uninstallApp();
  });
});