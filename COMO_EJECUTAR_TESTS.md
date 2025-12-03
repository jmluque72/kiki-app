# Cómo Ejecutar los Tests E2E

## Estado Actual

Los tests están configurados pero hay un problema con Detox 20 y Jest. Detox 20 cambió su API y requiere una configuración diferente.

## Opciones para Ejecutar los Tests

### Opción 1: Usar Detox v19 (Recomendado - Más Estable)

```bash
cd KikiApp
npm install --save-dev detox@^19.17.0 --legacy-peer-deps
```

Luego actualiza `e2e/init.js` a:

```javascript
const detox = require('detox');
const config = require('../detox.config');

beforeAll(async () => {
  await detox.init(config, { initGlobals: false });
}, 300000);

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await detox.cleanup();
});
```

### Opción 2: Continuar con Detox 20 (Requiere más configuración)

Detox 20 requiere una configuración más compleja. Puedes revisar la documentación oficial:
https://wix.github.io/Detox/docs/guide/migration

## Comandos para Ejecutar

Una vez configurado correctamente:

### 1. Build de la App (ya está hecho)
```bash
cd KikiApp
npm run e2e:build:ios
# o
npx detox build --configuration ios.sim.debug
```

### 2. Ejecutar Tests

**Todos los tests:**
```bash
npm run e2e:test:ios
# o
npx detox test --configuration ios.sim.debug
```

**Test específico:**
```bash
npm run e2e:test:activities
# o
npx detox test --configuration ios.sim.debug e2e/activities.e2e.js
```

**Otros tests disponibles:**
- `npm run e2e:test:auth` - Tests de autenticación
- `npm run e2e:test:attendance` - Tests de asistencia
- `npm run e2e:test:actions` - Tests de acciones diarias
- `npm run e2e:test:forms` - Tests de formularios

### 3. Ejecutar en iPhone 15 Pro específico

Si tienes el simulador del iPhone 15 Pro iniciado:

```bash
npx detox test --configuration ios.sim.debug --device-name "iPhone 15 Pro"
```

## Verificar que el Simulador está Iniciado

```bash
xcrun simctl list devices | grep "iPhone 15 Pro"
```

Si no está iniciado:
```bash
open -a Simulator
# Luego selecciona iPhone 15 Pro desde el menú Device
```

## Troubleshooting

### Error: "Detox worker instance has not been installed"
- Esto indica que Detox 20 necesita configuración adicional
- Considera usar Detox v19 que es más estable con Jest

### Error: "No tests found"
- Verifica que los archivos `.e2e.js` estén en la carpeta `e2e/`
- Verifica la configuración de `testMatch` en `e2e/config.json`

### Error: "Build failed"
- Asegúrate de que Xcode esté instalado
- Ejecuta `cd ios && pod install` si es necesario
- Verifica que el workspace esté correctamente configurado

## Próximos Pasos

1. **Recomendación**: Cambiar a Detox v19 para mayor estabilidad
2. O seguir con Detox 20 y completar la migración según la documentación oficial
3. Una vez funcionando, los tests se ejecutarán automáticamente en el iPhone 15 Pro que ya está iniciado
