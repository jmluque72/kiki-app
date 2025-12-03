const { Selectors } = require('./selectors');

class TestUtils {
  // Login rápido para tests
  static async login(email = 'test@example.com', password = 'password123') {
    try {
      await expect(element(Selectors.loginScreen())).toBeVisible();
      
      await element(Selectors.emailInput()).typeText(email);
      await element(Selectors.passwordInput()).typeText(password);
      await element(Selectors.loginButton()).tap();
      
      // Esperar a que se complete el login
      await this.waitForElement('home-screen', 10000);
      
      console.log(`Login exitoso para: ${email}`);
    } catch (error) {
      console.error('Error durante login:', error);
      throw error;
    }
  }

  // Logout completo
  static async logout() {
    try {
      // Navegar al perfil
      await element(by.id('profile-tab')).tap();
      
      // Presionar botón de logout
      await element(by.id('logout-button')).tap();
      
      // Confirmar logout
      await element(by.text('Sí')).tap();
      
      // Esperar a volver a la pantalla de login
      await expect(element(Selectors.loginScreen())).toBeVisible();
      
      console.log('Logout exitoso');
    } catch (error) {
      console.error('Error durante logout:', error);
      throw error;
    }
  }

  // Esperar por elemento con timeout personalizado
  static async waitForElement(elementId, timeout = 5000) {
    try {
      await waitFor(element(by.id(elementId)))
        .toBeVisible()
        .withTimeout(timeout);
      
      console.log(`Elemento encontrado: ${elementId}`);
    } catch (error) {
      console.error(`Elemento no encontrado: ${elementId}`);
      
      // Tomar screenshot para debugging
      await this.takeScreenshot(`error-${elementId}`);
      
      throw error;
    }
  }

  // Esperar que elemento desaparezca
  static async waitForElementToDisappear(elementId, timeout = 5000) {
    try {
      await waitFor(element(by.id(elementId)))
        .toBeNotVisible()
        .withTimeout(timeout);
      
      console.log(`Elemento desapareció: ${elementId}`);
    } catch (error) {
      console.error(`Elemento aún visible: ${elementId}`);
      throw error;
    }
  }

  // Tomar screenshot para debugging
  static async takeScreenshot(name) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}`;
      
      await device.takeScreenshot(filename);
      
      console.log(`Screenshot guardado: ${filename}`);
    } catch (error) {
      console.error('Error al tomar screenshot:', error);
    }
  }

  // Limpiar campo de texto
  static async clearText(elementId) {
    try {
      // Para Android
      if (device.getPlatform() === 'android') {
        await element(by.id(elementId)).replaceText('');
      } else {
        // Para iOS
        await element(by.id(elementId)).clearText();
      }
      
      console.log(`Texto limpiado en: ${elementId}`);
    } catch (error) {
      console.error(`Error al limpiar texto en: ${elementId}`, error);
      throw error;
    }
  }

  // Scroll hasta encontrar elemento
  static async scrollToElement(elementId, direction = 'down') {
    try {
      await waitFor(element(by.id(elementId)))
        .toBeVisible()
        .whileElement(by.id('scroll-view'))
        .scroll(300, direction);
      
      console.log(`Scroll completado hacia ${direction} para encontrar: ${elementId}`);
    } catch (error) {
      console.error(`Error al hacer scroll hacia ${direction} para: ${elementId}`);
      throw error;
    }
  }

  // Verificar que elemento existe (sin lanzar error si no existe)
  static async elementExists(elementId) {
    try {
      await expect(element(by.id(elementId))).toBeVisible();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obtener texto de elemento
  static async getElementText(elementId) {
    try {
      const attributes = await element(by.id(elementId)).getAttributes();
      return attributes.text || '';
    } catch (error) {
      console.error(`Error al obtener texto de: ${elementId}`, error);
      return '';
    }
  }

  // Simular modo offline
  static async setOfflineMode(enabled = true) {
    try {
      if (enabled) {
        await device.disableSynchronization();
        console.log('Modo offline activado');
      } else {
        await device.enableSynchronization();
        console.log('Modo offline desactivado');
      }
    } catch (error) {
      console.error('Error al cambiar modo offline:', error);
      throw error;
    }
  }

  // Esperar tiempo específico (usar con precaución)
  static async sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  // Reiniciar app completamente
  static async restartApp() {
    try {
      await device.launchApp({ newInstance: true });
      console.log('App reiniciada');
    } catch (error) {
      console.error('Error al reiniciar app:', error);
      throw error;
    }
  }

  // Configurar permisos
  static async setPermissions(permissions) {
    try {
      await device.launchApp({
        permissions: permissions,
        newInstance: true,
      });
      
      console.log('Permisos configurados:', permissions);
    } catch (error) {
      console.error('Error al configurar permisos:', error);
      throw error;
    }
  }

  // Manejar diálogos del sistema
  static async handleSystemDialog(buttonText) {
    try {
      await element(by.text(buttonText)).tap();
      console.log(`Diálogo del sistema manejado: ${buttonText}`);
    } catch (error) {
      console.error(`Error al manejar diálogo: ${buttonText}`, error);
      // No lanzar error, ya que el diálogo podría no aparecer
    }
  }

  // Verificar toast message
  static async expectToastMessage(message, timeout = 5000) {
    try {
      await waitFor(element(by.text(message)))
        .toBeVisible()
        .withTimeout(timeout);
      
      console.log(`Toast message encontrado: ${message}`);
      
      // Esperar a que el toast desaparezca
      await waitFor(element(by.text(message)))
        .toBeNotVisible()
        .withTimeout(5000);
    } catch (error) {
      console.error(`Toast message no encontrado: ${message}`);
      throw error;
    }
  }

  // Obtener información del dispositivo
  static async getDeviceInfo() {
    try {
      const info = {
        platform: device.getPlatform(),
        name: await device.name,
        id: await device.id,
      };
      
      console.log('Información del dispositivo:', info);
      return info;
    } catch (error) {
      console.error('Error al obtener información del dispositivo:', error);
      return {};
    }
  }

  // Limpiar datos de la app
  static async clearAppData() {
    try {
      await device.launchApp({
        delete: true,
        newInstance: true,
      });
      
      console.log('Datos de la app limpiados');
    } catch (error) {
      console.error('Error al limpiar datos de la app:', error);
      throw error;
    }
  }

  // Verificar que la app no se ha crasheado
  static async verifyAppNotCrashed() {
    try {
      // Intentar encontrar cualquier elemento de la UI
      await expect(element(by.id('root-view'))).toBeVisible();
      
      console.log('App funcionando correctamente');
      return true;
    } catch (error) {
      console.error('La app parece haberse crasheado');
      
      // Tomar screenshot para debugging
      await this.takeScreenshot('app-crashed');
      
      return false;
    }
  }
}

module.exports = { TestUtils };