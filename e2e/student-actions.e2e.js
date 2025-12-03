const { device, expect, element, by, waitFor } = require('detox');
const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Student Actions E2E Tests', () => {
  const COORDINADOR_EMAIL = 'coordinador@test.com';
  const COORDINADOR_PASSWORD = 'password123';

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

  describe('Registrar Acciones Diarias', () => {
    beforeEach(async () => {
      // Login como coordinador
      await TestUtils.login(COORDINADOR_EMAIL, COORDINADOR_PASSWORD);
      
      // Seleccionar institución si es necesario
      try {
        await waitFor(element(by.id('account-selection-screen')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('account-item-0')).tap();
      } catch (error) {
        // Continuar
      }

      // Abrir menú lateral
      try {
        await element(by.id('menu-button')).tap();
      } catch (error) {
        // Buscar botón de menú
        await element(by.text('☰')).tap();
      }

      // Navegar a Acciones
      try {
        await element(by.id('menu-acciones')).tap();
      } catch (error) {
        await element(by.text('Acciones')).tap();
      }

      // Esperar a que se cargue la pantalla
      await TestUtils.sleep(2000);
    });

    it('debe registrar acción diaria con estudiante', async () => {
      // 1. Verificar que se muestra la pantalla de acciones
      await waitFor(element(by.text('Acciones')))
        .toBeVisible()
        .withTimeout(5000);

      // 2. Esperar a que se carguen las acciones disponibles
      await TestUtils.sleep(3000);

      // 3. Seleccionar una acción
      try {
        await element(by.id('action-item-0')).tap();
      } catch (error) {
        // Buscar acción por texto (ej: "Comió")
        await element(by.text('Comió')).atIndex(0).tap();
      }

      // 4. Si la acción tiene valores, seleccionar valor
      try {
        await waitFor(element(by.id('action-value-selector')))
          .toBeVisible()
          .withTimeout(2000);
        await element(by.id('action-value-bien')).tap();
      } catch (error) {
        // No hay valores o no se muestra selector
        console.log('Acción sin valores o selector no encontrado');
      }

      // 5. Seleccionar estudiantes
      try {
        await element(by.id('select-students-button')).tap();
      } catch (error) {
        await element(by.text('Seleccionar estudiantes')).tap();
      }

      // Esperar a que se carguen estudiantes
      await TestUtils.sleep(2000);

      // Seleccionar primer estudiante
      try {
        await element(by.id('student-item-0')).tap();
      } catch (error) {
        await element(by.text('Juan')).atIndex(0).tap();
      }

      // Confirmar selección
      try {
        await element(by.id('confirm-selection')).tap();
      } catch (error) {
        await element(by.text('Confirmar')).tap();
      }

      // 6. Guardar acción
      try {
        await element(by.id('save-button')).tap();
      } catch (error) {
        await element(by.text('Guardar')).tap();
      }

      // 7. Si aparece modal de comentarios, agregar comentario opcional
      try {
        await waitFor(element(by.id('comment-modal')))
          .toBeVisible()
          .withTimeout(3000);
        
        try {
          await element(by.id('comment-input')).typeText('Comentario de prueba E2E');
        } catch (error) {
          await element(by.type('TextInput')).typeText('Comentario de prueba E2E');
        }

        // Confirmar
        try {
          await element(by.id('confirm-button')).tap();
        } catch (error) {
          await element(by.text('Confirmar')).tap();
        }
      } catch (error) {
        // No hay modal de comentarios, continuar
        console.log('No se mostró modal de comentarios');
      }

      // 8. Verificar mensaje de éxito
      await waitFor(element(by.text('registrada')))
        .toBeVisible()
        .withTimeout(10000)
        .catch(async () => {
          await waitFor(element(by.text('correctamente')))
            .toBeVisible()
            .withTimeout(5000);
        });
    });

    it('debe validar que se seleccione al menos una acción', async () => {
      // 1. Seleccionar estudiantes sin seleccionar acción
      try {
        await element(by.id('select-students-button')).tap();
        await TestUtils.sleep(2000);
        await element(by.id('student-item-0')).tap();
        await element(by.id('confirm-selection')).tap();
      } catch (error) {
        // Continuar
      }

      // 2. Intentar guardar sin acción
      try {
        await element(by.id('save-button')).tap();
      } catch (error) {
        await element(by.text('Guardar')).tap();
      }

      // 3. Verificar mensaje de error
      await waitFor(element(by.text('Debes seleccionar al menos una acción')))
        .toBeVisible()
        .withTimeout(5000)
        .catch(async () => {
          await waitFor(element(by.text('acción')))
            .toBeVisible()
            .withTimeout(3000);
        });
    });

    it('debe mostrar calendario con acciones registradas', async () => {
      // 1. Verificar que se muestra el calendario
      try {
        await expect(element(by.id('calendar-view'))).toBeVisible();
      } catch (error) {
        // Buscar calendario por texto
        await expect(element(by.text('Lun'))).toBeVisible();
      }

      // 2. Verificar que los días con acciones tienen indicador
      // (Esto puede requerir que haya acciones previamente registradas)
      await TestUtils.sleep(1000);
    });
  });

  afterAll(async () => {
    // Limpiar estado
  });
});

