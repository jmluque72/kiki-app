/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { setupGlobalErrorHandlers } from './src/utils/globalErrorHandler';
import App from './App';
import { name as appName } from './app.json';

// Configurar error handlers ANTES de registrar el componente
// Esto asegura que los errores se capturen desde el inicio
try {
  setupGlobalErrorHandlers();
  console.log('✅ [INDEX] Error handlers configurados antes de registrar componente');
} catch (error) {
  console.error('❌ [INDEX] Error configurando error handlers:', error);
}

AppRegistry.registerComponent(appName, () => App);
