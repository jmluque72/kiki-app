# Guía de Automatización E2E

Esta guía explica cómo ejecutar tests E2E automatizados que corren la app en el emulador o dispositivo.

## 🚀 Inicio Rápido

### Para iOS (Simulador)

```bash
# Opción 1: Script automatizado (recomendado)
npm run e2e:auto:ios

# Opción 2: Manual
npm run e2e:build:ios
npm run e2e:test:login:ios
```

### Para Android (Emulador)

```bash
# Opción 1: Script automatizado (recomendado)
npm run e2e:auto:android

# Opción 2: Manual
npm run e2e:build:android
npm run e2e:test:login:android
```

## 📋 Prerequisitos

### iOS
- Xcode instalado
- Simulador iOS configurado
- CocoaPods instalado (`cd ios && pod install`)

### Android
- Android Studio instalado
- Emulador Android configurado (AVD)
- Variables de entorno ANDROID_HOME configuradas

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Para iOS - Instalar CocoaPods

```bash
cd ios
pod install
cd ..
```

### 3. Verificar configuración de Detox

El archivo `detox.config.js` ya está configurado. Verifica que el ID del simulador iOS sea correcto:

```bash
# Listar simuladores disponibles
xcrun simctl list devices

# Si necesitas cambiar el ID, edita detox.config.js
```

## 🧪 Tests Disponibles

### Test de Login Automatizado

El test `e2e/login-automated.e2e.js` prueba:
- ✅ Login exitoso con credenciales válidas
- ✅ Validación de campos vacíos
- ✅ Error con credenciales inválidas
- ✅ Mostrar/ocultar contraseña

### Otros Tests

- `e2e/auth.e2e.js` - Tests de autenticación completos
- `e2e/activities.e2e.js` - Tests de actividades
- `e2e/attendance.e2e.js` - Tests de asistencia
- `e2e/student-actions.e2e.js` - Tests de acciones diarias
- `e2e/forms.e2e.js` - Tests de formularios

## 📝 Scripts Disponibles

### Scripts Automatizados

```bash
# Ejecutar todo el proceso (build + test) en iOS
npm run e2e:auto:ios

# Ejecutar todo el proceso (build + test) en Android
npm run e2e:auto:android

# Ejecutar todos los tests E2E
npm run e2e:auto:all
```

### Scripts Manuales

```bash
# Build
npm run e2e:build:ios          # Construir para iOS
npm run e2e:build:android       # Construir para Android

# Tests específicos
npm run e2e:test:login          # Test de login (usa configuración por defecto)
npm run e2e:test:login:ios      # Test de login en iOS
npm run e2e:test:login:android # Test de login en Android
npm run e2e:test:auth           # Tests de autenticación
npm run e2e:test:activities     # Tests de actividades
```

## 🔍 Configurar Credenciales de Test

Edita el archivo `e2e/login-automated.e2e.js` y cambia las credenciales:

```javascript
const email = 'tu-email@ejemplo.com';    // Línea 33
const password = 'tu-contraseña';        // Línea 34
```

## 📱 Ver Tests en Acción

Los tests se ejecutan automáticamente en el emulador/dispositivo. Verás:
- La app se abre automáticamente
- Los campos se llenan automáticamente
- Los botones se presionan automáticamente
- La navegación ocurre automáticamente

## 🐛 Debugging

### Ver logs detallados

```bash
npm run e2e:test:login:ios -- --loglevel verbose
```

### Screenshots

Los screenshots se guardan automáticamente en la carpeta `artifacts/` cuando un test falla.

### Ver la app mientras corre el test

Los tests corren en el emulador/dispositivo, así que puedes ver todo en tiempo real.

## ⚙️ Configuración Avanzada

### Cambiar dispositivo iOS

Edita `detox.config.js` y cambia el `device.id`:

```javascript
'ios.simulator': {
  type: 'ios.simulator',
  device: {
    id: 'TU-DEVICE-ID-AQUI',  // Cambiar este ID
  },
},
```

Para obtener el ID:
```bash
xcrun simctl list devices
```

### Cambiar emulador Android

Edita `detox.config.js` y cambia el `avdName`:

```javascript
'android.emulator': {
  type: 'android.emulator',
  device: {
    avdName: 'TU-AVD-NAME',  // Cambiar este nombre
  },
},
```

## 🎯 Flujo Completo de Automatización

1. **El script automáticamente:**
   - Limpia builds anteriores
   - Construye la app para testing
   - Verifica que el emulador/dispositivo esté disponible
   - Ejecuta los tests
   - Muestra los resultados

2. **Los tests automáticamente:**
   - Abren la app
   - Interactúan con la UI
   - Verifican resultados
   - Toman screenshots en caso de error

## 📊 Resultados

Los resultados se muestran en la terminal. También puedes encontrar:
- Screenshots en `artifacts/`
- Videos (si está configurado)
- Logs detallados

## 🔄 Ejecución Continua

Para ejecutar tests automáticamente en CI/CD, puedes usar:

```bash
# En tu pipeline CI/CD
npm run e2e:auto:ios
# o
npm run e2e:auto:android
```

## 💡 Tips

1. **Asegúrate de que el emulador esté ejecutándose** antes de correr los tests
2. **Cierra otras instancias de la app** antes de ejecutar tests
3. **Usa credenciales de test** que no cambien frecuentemente
4. **Revisa los screenshots** si un test falla para entender qué pasó

