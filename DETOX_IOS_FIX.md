# Fix de Vinculación de Detox en iOS

## Problema Identificado

La app se lanza pero no responde a Detox (`isReady` timeout). Esto indica que el framework de Detox no está correctamente vinculado o inyectado en la app.

## Solución Aplicada

### 1. Actualización del AppDelegate.swift

Se agregó la importación condicional de Detox y su configuración:

```swift
#if DEBUG
  #if canImport(Detox)
    import Detox
  #endif
#endif
```

Y en `didFinishLaunchingWithOptions`:

```swift
#if DEBUG
  #if canImport(Detox)
    Detox.setURLOverride(URL(string: "http://localhost:8081"))
    Detox.setReactNativeSupport(true)
    print("✅ [AppDelegate] Detox configurado")
  #endif
#endif
```

### 2. Actualización del Script de Build

El script `build-ios-detox.sh` ahora verifica e instala el framework de Detox antes del build:

```bash
# Asegurar que el framework de Detox esté instalado
if [ ! -d "$HOME/Library/Detox/ios" ]; then
  echo "📦 [DETOX BUILD] Instalando framework de Detox..."
  npx detox build-framework-cache
fi
```

## Próximos Pasos

### 1. Instalar Framework de Detox

```bash
cd KikiApp
npx detox build-framework-cache
```

### 2. Reinstalar Pods (si es necesario)

```bash
cd ios
pod install
cd ..
```

### 3. Rebuild de la App

```bash
npm run e2e:build:ios
```

### 4. Verificar que Detox está Inyectado

El framework de Detox se inyecta automáticamente durante el build cuando se ejecuta con Detox. Verifica que:

1. El framework esté en `~/Library/Detox/ios/`
2. El build incluya la inyección de Detox (se hace automáticamente)

### 5. Ejecutar Tests

```bash
npm run e2e:test:login:ios
```

## Notas Importantes

- **Detox NO se vincula como un pod normal** - Se usa como framework externo que se inyecta durante el build
- El framework se instala en `~/Library/Detox/ios/` cuando ejecutas `detox build-framework-cache`
- La inyección del framework se hace automáticamente por Detox durante el build
- El código en AppDelegate.swift permite que Detox se inicialice cuando está disponible

## Verificación

Para verificar que Detox está funcionando:

1. Ejecutar `npx detox doctor` - Debe mostrar que todo está OK
2. Verificar logs durante el build - Debe mostrar inyección de Detox
3. Verificar logs de la app - Debe mostrar "✅ [AppDelegate] Detox configurado" si Detox está disponible

## Troubleshooting

Si la app aún no responde a Detox:

1. **Verificar que el framework está instalado:**
   ```bash
   ls -la ~/Library/Detox/ios/
   ```

2. **Reinstalar el framework:**
   ```bash
   npx detox clean-framework-cache
   npx detox build-framework-cache
   ```

3. **Verificar que el build incluye Detox:**
   - Revisar los logs del build
   - Buscar referencias a Detox en los logs

4. **Verificar configuración de Detox:**
   - Revisar `detox.config.js`
   - Verificar que el `binaryPath` es correcto

