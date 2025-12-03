# 🔧 Troubleshooting: iOS Archive Failed

## ⚠️ Warnings sobre "Disabling previews"

Los warnings que ves son **normales** y **no causan el fallo**:

```
note: Disabling previews because SWIFT_VERSION is set and SWIFT_OPTIMIZATION_LEVEL=-O
```

Estos warnings aparecen porque Xcode está optimizando el código Swift para Release builds, lo cual es correcto. Puedes ignorarlos.

## 🔍 Cómo ver el error real

El mensaje "** ARCHIVE FAILED **" aparece al final, pero el **error real** está más arriba en el log. Busca líneas que digan:

- `error:`
- `❌`
- `failed`
- `cannot`

### Opción 1: Usar el script mejorado

He creado un script que filtra los warnings y muestra solo los errores:

```bash
npm run ios:archive:prod
```

O directamente:

```bash
./scripts/ios-archive.sh prod
```

### Opción 2: Ver el log completo

Si quieres ver todo el log sin filtrar:

```bash
ENVFILE=.env.prod xcodebuild \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release \
  -archivePath ios/build/KikiApp-Prod.xcarchive \
  archive 2>&1 | tee build.log

# Luego busca errores
grep -i "error" build.log
grep -i "failed" build.log
```

## 🐛 Errores comunes y soluciones

### 1. "Code signing is required"

**Error:**
```
Code signing is required for product type 'Application' in SDK 'iOS 16.0'
```

**Solución:**
- Abre Xcode → Target KikiApp → Signing & Capabilities
- Marca "Automatically manage signing"
- Selecciona tu Team

### 2. "No such file or directory: ExportOptions.plist"

**Error:**
```
error: exportArchive: exportOptionsPlist: No such file or directory
```

**Solución:**
- Verifica que `ios/ExportOptions.plist` existe
- Actualiza el Team ID en el archivo

### 3. "Team ID not found"

**Error:**
```
error: exportArchive: The data couldn't be read because it isn't in the correct format
```

**Solución:**
- Edita `ios/ExportOptions.plist`
- Cambia `YOUR_TEAM_ID` por tu Team ID real
- Lo encuentras en Xcode → Preferences → Accounts

### 4. "Module not found" o errores de compilación

**Error:**
```
error: No such module 'ReactNativeConfig'
```

**Solución:**
```bash
cd ios
pod install
cd ..
```

### 5. "Archive path already exists"

**Error:**
```
error: archivePath already exists
```

**Solución:**
```bash
rm -rf ios/build/KikiApp-Prod.xcarchive
```

### 6. Errores de react-native-config

**Error:**
```
error: Cannot read property 'getConfig' of null
```

**Solución:**
- Verifica que el script en el Podfile esté correcto
- Rebuild completo:
  ```bash
  cd ios
  rm -rf build DerivedData Pods
  pod install
  cd ..
  ```

## 📋 Checklist antes de hacer Archive

- [ ] Team ID configurado en `ExportOptions.plist`
- [ ] Code signing configurado en Xcode
- [ ] `pod install` ejecutado recientemente
- [ ] Archivos `.env.uat` y `.env.prod` existen
- [ ] Versión y Build number actualizados
- [ ] No hay errores de compilación en Xcode

## 🔍 Debug paso a paso

Si el error persiste, ejecuta paso a paso:

```bash
# 1. Limpiar
ENVFILE=.env.prod xcodebuild clean \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp

# 2. Build normal (sin archive)
ENVFILE=.env.prod xcodebuild \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath ios/build

# 3. Si el build normal funciona, intenta el archive
ENVFILE=.env.prod xcodebuild \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release \
  -archivePath ios/build/KikiApp-Prod.xcarchive \
  archive
```

## 💡 Consejos

1. **Siempre revisa el log completo** - El error real está antes de "ARCHIVE FAILED"
2. **Usa el script mejorado** - Filtra warnings y muestra errores claramente
3. **Verifica en Xcode primero** - Si puedes hacer Archive desde Xcode, el problema es del script
4. **Limpia todo** - A veces un clean completo resuelve problemas:
   ```bash
   cd ios
   rm -rf build DerivedData Pods Podfile.lock
   pod install
   cd ..
   ```

