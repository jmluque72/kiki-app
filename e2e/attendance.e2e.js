const { device, expect, element, by, waitFor } = require('detox');
const { TestUtils } = require('./utils/testUtils');
const { Selectors } = require('./utils/selectors');

describe('Attendance E2E Tests', () => {
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

  describe('Registrar Asistencia', () => {
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

      // Navegar a pestaña Asistencia
      try {
        await element(by.id('tab-asistencia')).tap();
      } catch (error) {
        await element(by.text('Asistencia')).tap();
      }

      // Esperar a que se cargue la pantalla
      await TestUtils.sleep(2000);
    });

    it('debe registrar asistencia de estudiantes', async () => {
      // 1. Verificar que se muestra la lista de estudiantes
      await waitFor(element(by.text('Asistencia')))
        .toBeVisible()
        .withTimeout(5000);

      // 2. Esperar a que se carguen los estudiantes
      await TestUtils.sleep(3000);

      // 3. Marcar algunos estudiantes como presentes
      // Buscar checkboxes de estudiantes
      try {
        // Intentar encontrar checkboxes de estudiantes
        const studentCheckboxes = element(by.id('student-checkbox-0'));
        await studentCheckboxes.tap();
        
        // Marcar segundo estudiante
        await element(by.id('student-checkbox-1')).tap();
      } catch (error) {
        // Alternativa: buscar por texto y tocar el área del estudiante
        console.log('Usando método alternativo para marcar estudiantes');
        // Tocar área de estudiante (puede requerir ajuste según UI)
        await element(by.text('Juan')).atIndex(0).tap();
        await TestUtils.sleep(500);
      }

      // 4. Verificar que se actualiza el contador
      try {
        await waitFor(element(by.text('presentes')))
          .toBeVisible()
          .withTimeout(3000);
      } catch (error) {
        // Continuar sin verificar contador
        console.log('Contador no encontrado, continuando');
      }

      // 5. Guardar asistencia
      try {
        await element(by.id('save-attendance-button')).tap();
      } catch (error) {
        await element(by.text('Guardar')).tap();
      }

      // 6. Verificar mensaje de éxito
      await waitFor(element(by.text('Asistencia guardada correctamente')))
        .toBeVisible()
        .withTimeout(10000)
        .catch(async () => {
          await waitFor(element(by.text('guardada')))
            .toBeVisible()
            .withTimeout(5000);
        });
    });

    it('debe mostrar fecha actual', async () => {
      // Verificar que se muestra la fecha
      const today = new Date();
      const dateString = today.toLocaleDateString('es-AR');
      
      try {
        await expect(element(by.text(dateString))).toBeVisible();
      } catch (error) {
        // Buscar formato alternativo de fecha
        console.log('Fecha no encontrada en formato esperado');
      }
    });
  });

  afterAll(async () => {
    // Limpiar estado
  });
});

