const { device, expect, element, by, waitFor } = require('detox');
const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Forms E2E Tests', () => {
  const FAMILYADMIN_EMAIL = 'familyadmin@test.com';
  const FAMILYADMIN_PASSWORD = 'password123';

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

  describe('Completar Formulario (Familyadmin)', () => {
    beforeEach(async () => {
      // Login como familyadmin
      await TestUtils.login(FAMILYADMIN_EMAIL, FAMILYADMIN_PASSWORD);
      
      // Seleccionar institución si es necesario
      try {
        await waitFor(element(by.id('account-selection-screen')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('account-item-0')).tap();
      } catch (error) {
        // Continuar
      }

      // Navegar a formularios (puede estar en menú o notificaciones)
      try {
        await element(by.id('menu-button')).tap();
        await element(by.text('Formularios')).tap();
      } catch (error) {
        // Buscar desde notificaciones o menú
        console.log('Navegando a formularios');
      }

      await TestUtils.sleep(2000);
    });

    it('debe completar formulario con campos requeridos', async () => {
      // 1. Ver formulario pendiente
      try {
        await element(by.id('form-pending-0')).tap();
      } catch (error) {
        // Buscar primer formulario pendiente
        await element(by.text('Pendiente')).atIndex(0).tap();
      }

      // Esperar a que se cargue el formulario
      await TestUtils.sleep(2000);

      // 2. Navegar entre preguntas y completar
      // Primera pregunta (texto)
      try {
        await element(by.id('question-text-input')).typeText('Respuesta de texto');
      } catch (error) {
        await element(by.type('TextInput')).atIndex(0).typeText('Respuesta de texto');
      }

      // Ir a siguiente pregunta
      try {
        await element(by.id('next-button')).tap();
      } catch (error) {
        await element(by.text('Siguiente')).tap();
      }

      await TestUtils.sleep(1000);

      // Segunda pregunta (número)
      try {
        await element(by.id('question-number-input')).typeText('42');
      } catch (error) {
        await element(by.type('TextInput')).atIndex(0).typeText('42');
      }

      // Ir a siguiente
      try {
        await element(by.id('next-button')).tap();
      } catch (error) {
        await element(by.text('Siguiente')).tap();
      }

      await TestUtils.sleep(1000);

      // Tercera pregunta (opción múltiple)
      try {
        await element(by.id('question-option-0')).tap();
      } catch (error) {
        // Buscar primera opción
        await element(by.text('Opción 1')).tap();
      }

      // 3. Enviar formulario
      try {
        await element(by.id('submit-button')).tap();
      } catch (error) {
        await element(by.text('Enviar')).tap();
      }

      // Confirmar envío
      try {
        await waitFor(element(by.id('confirm-dialog')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.text('Confirmar')).tap();
      } catch (error) {
        // No hay diálogo de confirmación
      }

      // 4. Verificar mensaje de éxito
      await waitFor(element(by.text('Formulario completado exitosamente')))
        .toBeVisible()
        .withTimeout(10000)
        .catch(async () => {
          await waitFor(element(by.text('completado')))
            .toBeVisible()
            .withTimeout(5000);
        });
    });

    it('debe validar campos requeridos', async () => {
      // 1. Abrir formulario
      try {
        await element(by.id('form-pending-0')).tap();
      } catch (error) {
        await element(by.text('Pendiente')).atIndex(0).tap();
      }

      await TestUtils.sleep(2000);

      // 2. Intentar enviar sin completar campos requeridos
      try {
        await element(by.id('submit-button')).tap();
      } catch (error) {
        // Buscar botón de enviar
        await element(by.text('Enviar')).tap();
      }

      // 3. Verificar mensaje de error
      await waitFor(element(by.text('requerido')))
        .toBeVisible()
        .withTimeout(5000)
        .catch(async () => {
          await waitFor(element(by.text('completa')))
            .toBeVisible()
            .withTimeout(3000);
        });
    });
  });

  afterAll(async () => {
    // Limpiar estado
  });
});

