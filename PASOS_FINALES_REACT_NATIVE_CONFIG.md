# Pasos Finales para Configurar react-native-config

## ✅ Lo que ya está hecho

1. ✅ `react-native-config` instalado
2. ✅ Script de build agregado al `Podfile`
3. ✅ `pod install` ejecutado correctamente
4. ✅ Archivos `.env` creados (`.env.local`, `.env.uat`, `.env.prod`)

## 🔧 Pasos que debes completar

### 1. Agregar el archivo de configuración al proyecto Xcode

El script genera `ios/tmp.xcconfig` pero necesitas agregarlo al proyecto:

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. En el navegador izquierdo, haz clic derecho en el proyecto `KikiApp`
3. Selecciona **"Add Files to KikiApp..."**
4. Navega a `ios/` y selecciona `tmp.xcconfig`
5. Asegúrate de que **"Copy items if needed"** esté desmarcado
6. Haz clic en **"Add"**

### 2. Configurar el proyecto para usar el archivo

1. En Xcode, selecciona el proyecto `KikiApp` en el navegador
2. Selecciona el target `KikiApp`
3. Ve a la pestaña **"Build Settings"**
4. Busca **"Configuration Files"** o **"Config Files"**
5. Para **Debug** y **Release**, agrega: `$(SRCROOT)/tmp.xcconfig`

**O alternativamente**, en la pestaña **"Info"**:
- En **"Configurations"**, para cada configuración (Debug/Release), selecciona `tmp.xcconfig` en el dropdown

### 3. Rebuild completo

```bash
cd KikiApp

# Limpiar builds anteriores
cd ios
rm -rf build DerivedData
cd ..

# Build con .env.local
ENVFILE=.env.local npx react-native run-ios
```

### 4. Verificar que funciona

Agrega temporalmente en `apiConfig.ts`:

```typescript
import Config from 'react-native-config';

console.log('🔍 ENVFILE:', process.env.ENVFILE);
console.log('🔍 API_ENV:', Config.API_ENV);
console.log('🔍 API_BASE_URL_LOCAL:', Config.API_BASE_URL_LOCAL);
```

Si ves los valores correctos en la consola, está funcionando.

## 🚨 Si sigue sin funcionar

### Opción A: Verificar que el script se ejecuta

1. En Xcode, ve a **"Build Phases"**
2. Busca el script **"Setup React Native Config"**
3. Debería estar antes de **"Bundle React Native code and images"**
4. Si no está, el `pod install` no lo agregó correctamente

### Opción B: Agregar el script manualmente en Xcode

1. En Xcode, selecciona el target `KikiApp`
2. Ve a **"Build Phases"**
3. Haz clic en **"+"** y selecciona **"New Run Script Phase"**
4. Arrastra el script para que esté **ANTES** de "Bundle React Native code and images"
5. Agrega este script:

```bash
if [ -z "$ENVFILE" ]; then
  ENVFILE=.env
fi

if [ ! -f "$ENVFILE" ]; then
  echo "⚠️  Warning: $ENVFILE file not found. Using default .env"
  ENVFILE=.env
fi

export ENVFILE
"${SRCROOT}/../node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb" "${SRCROOT}/.." "${SRCROOT}/tmp.xcconfig"
```

6. Marca **"For install builds only"** (opcional)

### Opción C: Verificar que el archivo se genera

Después de hacer build, verifica:

```bash
cd KikiApp/ios
cat tmp.xcconfig
```

Deberías ver las variables del `.env` que usaste.

## 📝 Notas

- El archivo `tmp.xcconfig` se genera automáticamente en cada build
- Si cambias el `.env`, necesitas hacer un rebuild completo
- El script busca el archivo `.env` especificado en `ENVFILE`, o usa `.env` por defecto

