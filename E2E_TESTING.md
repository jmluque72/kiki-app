# Testing E2E con Detox

Esta guía explica cómo configurar y ejecutar tests de extremo a extremo (E2E) con Detox para la aplicación KikiApp.

## 📋 Prerequisitos

- Node.js >= 14.0.0
- Java Development Kit (JDK) para Android
- Xcode para iOS (solo macOS)
- Android Studio / Android SDK
- Dispositivo emulador o físico

## 🔧 Instalación

### 1. Instalar Detox CLI globalmente
```bash
npm install -g detox-cli
```

### 2. Instalar dependencias de Detox
```bash
npm install --save-dev detox
```

### 3. Configurar Detox
El archivo `detox.config.js` ya debe estar configurado en la raíz del proyecto.

## 📱 Configuración por Plataforma

### Android
1. **Configurar emulador Android**
   ```bash
   # Crear emulador Android API 31 (recomendado)
   sdkmanager "system-images;android-31;google_apis;x86_64"
   avdmanager create avd -n Pixel_5_API_31 -k "system-images;android-31;google_apis;x86_64" -d "pixel_5"
   ```

2. **Build de debug para Android**
   ```bash
   cd android
   ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug
   cd ..
   ```

3. **Ejecutar tests en Android**
   ```bash
   detox test --configuration android
   ```

### iOS (solo macOS)
1. **Instalar dependencias de CocoaPods**
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Build para iOS**
   ```bash
   detox build --configuration ios
   ```

3. **Ejecutar tests en iOS**
   ```bash
   detox test --configuration ios
   ```

## 🧪 Estructura de Tests E2E

Los tests E2E se encuentran en la carpeta `e2e/`:

```
e2e/
├── firstTest.e2e.js          # Test básico de ejemplo
├── auth.e2e.js               # Tests de autenticación
├── activities.e2e.js         # Tests de actividades
├── navigation.e2e.js         # Tests de navegación
├── utils/                    # Utilidades para tests
│   ├── testUtils.js         # Funciones auxiliares
│   ├── selectors.js         # Selectores de elementos
│   └── mockData.js          # Datos de prueba
└── config/                   # Configuración de tests
    └── testConfig.js        # Configuración global
```

## 📝 Ejemplos de Tests E2E

### Test de Autenticación
```javascript
describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully with valid credentials', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    
    // Ingresar email
    await element(by.id('email-input')).typeText('test@example.com');
    
    // Ingresar contraseña
    await element(by.id('password-input')).typeText('password123');
    
    // Presionar botón de login
    await element(by.id('login-button')).tap();
    
    // Verificar que se navegó a la pantalla principal
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

### Test de Navegación
```javascript
describe('Navigation Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Login primero
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible();
  });

  it('should navigate to activities screen', async () => {
    await element(by.id('activities-tab')).tap();
    await expect(element(by.id('activities-screen'))).toBeVisible();
  });

  it('should navigate to profile screen', async () => {
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should navigate back to home screen', async () => {
    await element(by.id('activities-tab')).tap();
    await element(by.id('home-tab')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

### Test de Creación de Actividad
```javascript
describe('Activity Creation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Login y navegación a actividades
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible();
    await element(by.id('activities-tab')).tap();
  });

  it('should create a new activity', async () => {
    // Presionar botón de crear actividad
    await element(by.id('create-activity-button')).tap();
    
    // Llenar formulario
    await element(by.id('activity-title-input')).typeText('Team Meeting');
    await element(by.id('activity-description-input')).typeText('Weekly team sync');
    await element(by.id('activity-date-input')).tap();
    
    // Seleccionar fecha en el picker
    await element(by.type('android.widget.DatePicker')).setDatePickerDate('2024-02-15', 'MM-DD-YYYY');
    await element(by.text('OK')).tap();
    
    // Establecer hora
    await element(by.id('activity-time-input')).tap();
    await element(by.type('android.widget.TimePicker')).setTimePickerTime('14', '30');
    await element(by.text('OK')).tap();
    
    // Establecer ubicación
    await element(by.id('activity-location-input')).typeText('Conference Room A');
    
    // Guardar actividad
    await element(by.id('save-activity-button')).tap();
    
    // Verificar que la actividad aparece en la lista
    await expect(element(by.text('Team Meeting'))).toBeVisible();
  });
});
```

## 🛠️ Utilidades de Test

### testUtils.js
```javascript
export const TestUtils = {
  // Login rápido para tests
  async login(email = 'test@example.com', password = 'password123') {
    await element(by.id('email-input')).replaceText(email);
    await element(by.id('password-input')).replaceText(password);
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible();
  },

  // Limpiar y recargar app
  async reloadApp() {
    await device.reloadReactNative();
  },

  // Esperar por elemento con timeout
  async waitForElement(elementId, timeout = 5000) {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Tomar screenshot para debugging
  async takeScreenshot(name) {
    await device.takeScreenshot(name);
  },
};
```

### selectors.js
```javascript
export const Selectors = {
  // Auth screens
  loginScreen: by.id('login-screen'),
  emailInput: by.id('email-input'),
  passwordInput: by.id('password-input'),
  loginButton: by.id('login-button'),
  
  // Home screen
  homeScreen: by.id('home-screen'),
  activitiesTab: by.id('activities-tab'),
  profileTab: by.id('profile-tab'),
  
  // Activity screens
  activitiesScreen: by.id('activities-screen'),
  createActivityButton: by.id('create-activity-button'),
  activityTitleInput: by.id('activity-title-input'),
  activityDescriptionInput: by.id('activity-description-input'),
  saveActivityButton: by.id('save-activity-button'),
  
  // Common elements
  loadingIndicator: by.id('loading-indicator'),
  errorMessage: by.id('error-message'),
  successMessage: by.id('success-message'),
};
```

## 🚀 Ejecutar Tests E2E

### Comandos Principales
```bash
# Ejecutar todos los tests E2E
detox test

# Ejecutar tests específicos
detox test --testNamePattern="Authentication"

# Ejecutar en plataforma específica
detox test --configuration android
detox test --configuration ios

# Ejecutar con logs detallados
detox test --loglevel trace

# Ejecutar en modo headless (sin interfaz)
detox test --headless

# Ejecutar con workers paralelos
detox test --workers 2
```

### Debugging
```bash
# Ejecutar con debugging activado
detox test --debug-synchronization 200

# Tomar screenshots en cada paso
detox test --take-screenshots failing

# Grabar video del test
detox test --record-videos failing

# Ver logs de device
detox test --loglevel verbose
```

## 📊 Reportes y Métricas

### Generar Reporte HTML
```bash
# Instalar allure si no está instalado
npm install -g allure-commandline

# Ejecutar tests con reporte de allure
detox test --configuration android --cleanup

# Generar reporte HTML
allure generate allure-results --clean -o allure-report
allure open allure-report
```

### Métricas de Performance
Detox puede medir métricas de performance:

```javascript
it('should measure activity loading time', async () => {
  const startTime = Date.now();
  
  await element(by.id('activities-tab')).tap();
  await waitFor(element(by.id('activities-screen'))).toBeVisible();
  
  const endTime = Date.now();
  const loadingTime = endTime - startTime;
  
  console.log(`Activity loading time: ${loadingTime}ms`);
  expect(loadingTime).toBeLessThan(2000); // Debe cargar en menos de 2 segundos
});
```

## 🎯 Mejores Prácticas

### 1. Independencia de Tests
- Cada test debe ser independiente
- Usar `beforeEach` para limpiar estado
- Evitar dependencias entre tests

### 2. Selectores Estables
- Usar `testID` en lugar de texto cuando sea posible
- Evitar selectores basados en posición
- Mantener selectores simples y legibles

### 3. Timeouts Apropiados
```javascript
// Configurar timeouts globales
detox.init({
  testRunner: {
    retries: 2, // Reintentar tests fallidos
  },
  behavior: {
    init: {
      exposeGlobals: false,
    },
    cleanup: {
      shutdownDevice: true,
    },
  },
  artifacts: {
    rootDir: 'artifacts',
    plugins: {
      log: 'failing',
      screenshot: 'failing',
      video: 'failing',
    },
  },
});
```

### 4. Manejo de Errores
```javascript
it('should handle network errors gracefully', async () => {
  // Simular error de red
  await mockNetworkError();
  
  await element(by.id('sync-button')).tap();
  
  // Verificar que se muestra mensaje de error
  await expect(element(by.text('Network error'))).toBeVisible();
  
  // Verificar que la app no se crashea
  await expect(element(by.id('home-screen'))).toBeVisible();
});
```

### 5. Tests de Performance
```javascript
it('should maintain responsive UI during sync', async () => {
  // Iniciar sincronización pesada
  await element(by.id('sync-button')).tap();
  
  // La UI debe seguir siendo responsive
  await element(by.id('activities-tab')).tap();
  await expect(element(by.id('activities-screen'))).toBeVisible();
  
  // Volver a home
  await element(by.id('home-tab')).tap();
  await expect(element(by.id('home-screen'))).toBeVisible();
});
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **"Device not found"**
   ```bash
   # Verificar emuladores disponibles
   emulator -list-avds
   
   # Iniciar emulador manualmente
   emulator -avd Pixel_5_API_31
   ```

2. **"Test timeout"**
   - Aumentar timeout global en `detox.config.js`
   - Usar `waitFor` con timeout específico
   - Verificar que la app no esté crasheada

3. **"Element not found"**
   - Verificar que el elemento tenga el `testID` correcto
   - Usar `device.takeScreenshot()` para debugging visual
   - Verificar que el elemento sea visible

4. **"Build failed"**
   - Limpiar build anterior: `detox clean-framework-cache`
   - Reinstalar dependencias: `npm install`
   - Verificar versiones compatibles

### Comandos de Debug
```bash
# Verificar configuración
detox doctor

# Limpiar caché
detox clean-framework-cache

# Ver logs detallados
detox test --loglevel trace --record-logs all

# Ejecutar en modo debug
detox test --debug-synchronization 200
```

## 📚 Recursos Adicionales

- [Documentación oficial de Detox](https://github.com/wix/Detox)
- [Mejores prácticas de Detox](https://github.com/wix/Detox/blob/master/docs/Guide.WritingTests.md)
- [API Reference](https://github.com/wix/Detox/blob/master/docs/APIRef.md)
- [Ejemplos de tests](https://github.com/wix/Detox/tree/master/examples)

## 🤝 Contribuyendo

Al agregar nuevos tests E2E:

1. Seguir la estructura de archivos existente
2. Documentar casos de prueba complejos
3. Incluir screenshots para debugging
4. Mantener tests independientes
5. Actualizar esta documentación cuando sea necesario