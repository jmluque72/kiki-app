# Solución: Error "Cannot read property 'getConfig' of null"

## Problema

El error indica que el módulo nativo de `react-native-config` no está vinculado correctamente. Esto ocurre porque `react-native-config` necesita un script de build en Xcode para generar el archivo de configuración.

## Solución

### 1. Agregar Script de Build en Xcode

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Selecciona el proyecto `KikiApp` en el navegador izquierdo
3. Selecciona el target `KikiApp`
4. Ve a la pestaña **"Build Phases"**
5. Haz clic en **"+"** arriba y selecciona **"New Run Script Phase"**
6. Arrastra el nuevo script para que esté **ANTES** de "Bundle React Native code and images"
7. En el script, agrega:

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

8. Marca la casilla **"For install builds only"** (opcional, pero recomendado)

### 2. Agregar el archivo generado al proyecto

1. En Xcode, ve a **"Build Settings"**
2. Busca **"Config Files"** o **"Configuration Files"**
3. En **"Debug"**, agrega: `$(SRCROOT)/tmp.xcconfig`
4. En **"Release"**, agrega: `$(SRCROOT)/tmp.xcconfig`

**O alternativamente**, agrega esto al `Podfile` después de `use_react_native!`:

```ruby
target 'KikiApp' do
  # ... código existente ...
  
  # Script para react-native-config
  script_phase :name => 'Setup React Native Config',
    :script => <<-SCRIPT
      if [ -z "$ENVFILE" ]; then
        ENVFILE=.env
      fi
      if [ ! -f "$ENVFILE" ]; then
        echo "⚠️  Warning: $ENVFILE file not found. Using default .env"
        ENVFILE=.env
      fi
      export ENVFILE
      "${PODS_ROOT}/../node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb" "${PODS_ROOT}/.." "${PODS_ROOT}/../ios/tmp.xcconfig"
    SCRIPT,
    :execution_position => :before_compile
end
```

Luego ejecuta `pod install` de nuevo.

### 3. Rebuild completo

Después de agregar el script:

```bash
cd KikiApp/ios
rm -rf build DerivedData
cd ..
ENVFILE=.env.local npx react-native run-ios
```

### 4. Verificar que funciona

Agrega un log temporal en `apiConfig.ts`:

```typescript
import Config from 'react-native-config';

console.log('🔍 Config loaded:', Config.API_ENV);
console.log('🔍 API URL:', Config.API_BASE_URL_LOCAL);
```

Si ves los valores correctos, está funcionando.

## Alternativa: Usar variables de entorno directamente

Si `react-native-config` sigue dando problemas, puedes usar variables de entorno directamente en el build script de Xcode sin `react-native-config`, pero perderás la facilidad de los archivos `.env`.

