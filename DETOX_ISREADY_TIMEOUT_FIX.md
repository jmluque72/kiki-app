# Fix: Detox isReady Timeout en iOS

## Problema

La app se lanza exitosamente pero Detox no puede comunicarse con ella:
```
[PENDING_REQUESTS] The app has not responded to the network requests below:
  (id = -1000) isReady: {}
```

## Diagnóstico

1. ✅ La app se construye correctamente
2. ✅ La app se instala en el simulador
3. ✅ La app se lanza (veo "org.kikiapp.application launched")
4. ❌ Detox no puede comunicarse con la app (`isReady` timeout)

## Posibles Causas

### 1. Framework de Detox no inyectado correctamente

Detox inyecta el framework usando `DYLD_INSERT_LIBRARIES` cuando lanza la app. Si el framework no está disponible o no se inyecta correctamente, la app no responderá.

**Verificación:**
```bash
# Verificar que el framework existe
ls -la ~/Library/Detox/ios/

# Verificar que se inyecta (en los logs de Detox debería aparecer)
# Buscar: DYLD_INSERT_LIBRARIES="/Users/.../Detox.framework/Detox"
```

### 2. React Native Nueva Arquitectura

Con la nueva arquitectura de React Native, Detox puede necesitar configuración adicional. El proyecto tiene `newArchEnabled=false` en `gradle.properties`, pero en iOS puede estar habilitado.

**Verificación:**
- Revisar `ios/Podfile` - tiene `new_arch_enabled => true` pero luego se fuerza a `false` en post_install
- Verificar que la app realmente no usa la nueva arquitectura

### 3. Puerto del Metro Bundler

Detox necesita que Metro Bundler esté corriendo en el puerto correcto (por defecto 8081).

**Verificación:**
```bash
# Verificar que Metro está corriendo
lsof -i :8081

# Si no está corriendo, iniciarlo
npm start
```

### 4. Timeout demasiado corto

El timeout de `isReady` puede ser demasiado corto si la app tarda en cargar.

**Solución:**
- Aumentar timeout en `detox.config.js` o `init.js`

## Soluciones a Intentar

### 1. Verificar Metro Bundler

```bash
# En una terminal separada
cd KikiApp
npm start
```

### 2. Reinstalar Framework de Detox

```bash
npx detox clean-framework-cache
npx detox build-framework-cache
```

### 3. Rebuild Completo

```bash
cd ios
rm -rf build
cd ..
npm run e2e:build:ios
```

### 4. Verificar Logs de la App

```bash
xcrun simctl spawn DC881DF8-F081-40DC-A5CD-5B2DCEEDA85A log stream --level debug --style compact --predicate 'process == "KikiApp"'
```

Buscar:
- Errores de Detox
- Errores de conexión
- Errores de inicialización

### 5. Aumentar Timeout

En `e2e/init.js`, aumentar el timeout:

```javascript
jest.setTimeout(600000); // 10 minutos
```

Y en `detox.config.js`, agregar:

```javascript
behavior: {
  init: {
    exposeGlobals: true,
    reinstallApp: true,
    launchApp: 'auto',
    waitForActive: 30000, // Esperar hasta 30 segundos
  },
}
```

## Estado Actual

- ✅ App se construye correctamente
- ✅ App se instala en simulador
- ✅ App se lanza manualmente
- ✅ App se lanza con Detox
- ❌ Detox no puede comunicarse con la app

## Próximos Pasos

1. Verificar que Metro Bundler está corriendo
2. Verificar logs de la app para errores
3. Intentar aumentar timeouts
4. Verificar que el framework de Detox se inyecta correctamente

