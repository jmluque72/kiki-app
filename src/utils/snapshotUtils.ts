import { InteractionManager, Platform } from 'react-native';

/**
 * Utilidad para evitar errores de snapshot en iOS
 * Espera a que la vista se renderice completamente antes de ejecutar una acción
 */
export const waitForRender = (): Promise<void> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      // En iOS, usar InteractionManager y delay más largo
      InteractionManager.runAfterInteractions(() => {
        // Delay más largo para iOS para evitar errores de snapshot
        setTimeout(resolve, 300);
      });
    } else {
      // En Android, delay más corto
      setTimeout(resolve, 100);
    }
  });
};

/**
 * Función para ejecutar una acción después de que la vista se haya renderizado
 * @param action - Función a ejecutar
 */
export const executeAfterRender = async (action: () => void | Promise<void>): Promise<void> => {
  await waitForRender();
  await action();
};

/**
 * Función específica para image picker que evita errores de snapshot
 * @param pickerFunction - Función del image picker a ejecutar
 */
export const safeImagePicker = async (pickerFunction: () => void): Promise<void> => {
  console.log('📱 [SAFE IMAGE PICKER] Preparando image picker...');
  
  // Esperar a que termine cualquier animación o transición
  await waitForRender();
  
  // En iOS, agregar delay adicional antes de ejecutar
  if (Platform.OS === 'ios') {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Ejecutar la función del picker
  pickerFunction();
};

/**
 * Función para esperar a que se complete el renderizado de la pantalla actual
 */
export const waitForScreenRender = (): Promise<void> => {
  return new Promise((resolve) => {
    // Usar requestAnimationFrame para asegurar que el render esté completo
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Delay adicional para iOS
        setTimeout(resolve, Platform.OS === 'ios' ? 500 : 200);
      });
    });
  });
};
