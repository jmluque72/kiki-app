# Problema de Compilación Android - React Native 0.80

## Contexto del Proyecto

- **React Native**: 0.80.0
- **Nueva Arquitectura**: Habilitada (`newArchEnabled=true`) - **REQUERIDA** por `react-native-reanimated 4.0.2`
- **Hermes**: Deshabilitado (`hermesEnabled=false`)
- **NDK**: 27.1.12297006
- **Gradle**: 8.14.1
- **Kotlin**: 2.1.20

## Dependencias Relevantes

```json
{
  "react-native": "^0.80.0",
  "react-native-reanimated": "^4.0.2",
  "react-native-safe-area-context": "^5.0.0",
  "react-native-screens": "^4.11.1",
  "react-native-gesture-handler": "^2.28.0"
}
```

## Problema Principal

Al intentar generar el APK de release con `./gradlew assembleRelease`, se producen errores de compilación C++ relacionados con `react-native-safe-area-context` y `react-native-screens`.

## Errores Específicos

### Error 1: `react-native-safe-area-context`

```
/Users/.../RNCSafeAreaViewState.h:31:18: error: variable has incomplete type 'class JSI_EXPORT'
   31 | class JSI_EXPORT RNCSafeAreaViewState final {
       |                  ^
error: expected ';' after top level declarator
```

```
/Users/.../RNCSafeAreaViewShadowNode.h:20:11: error: unknown type name 'RNCSafeAreaViewProps'; did you mean 'RNCSafeAreaViewState'?
   20 |           RNCSafeAreaViewProps,
       |           ^~~~~~~~~~~~~~~~~~~~
```

```
error: constraints not satisfied for class template 'ConcreteViewShadowNode' 
[with concreteComponentName = facebook::react::RNCSafeAreaViewComponentName, 
ViewPropsT = facebook::react::RNCSafeAreaViewState, 
ViewEventEmitterT = facebook::react::BaseViewEventEmitter, 
StateDataT = facebook::react::RNCSafeAreaViewState]
```

### Error 2: `react-native-screens`

```
/Users/.../RNSScreenShadowNode.h:20:50: error: use of undeclared identifier 'RNSScreenProps'
error: use of class template 'ConcreteViewShadowNode' requires template arguments
error: only virtual member functions can be marked 'override'
```

## Lo que se ha Intentado

1. **Actualizar `react-native-safe-area-context`**:
   - Probado versión 5.6.2 → Mismos errores
   - Probado versión 4.10.5 → Error diferente: `'react/renderer/graphics/RectangleEdges.h' file not found`
   - Probado versión 5.0.0 → Errores similares a 5.6.2

2. **Limpiar y regenerar archivos de codegen**:
   ```bash
   ./gradlew clean
   rm -rf node_modules/react-native-safe-area-context/android/build
   ./gradlew :react-native-safe-area-context:generateCodegenArtifactsFromSchema --rerun-tasks
   ```
   - Los archivos se regeneran correctamente, pero los errores persisten

3. **Comentar includes problemáticos en autolinking**:
   - Se agregó un script `fixAutolinkingIncludes` que comenta includes de módulos problemáticos
   - Funciona para `rngesturehandler_codegen` y `rnpdf`, pero no resuelve el problema de `safe-area-context`

4. **Compilar solo para arm64-v8a**:
   - Configurado `reactNativeArchitectures=arm64-v8a` en `gradle.properties`
   - El error persiste

5. **Deshabilitar nueva arquitectura**:
   - **NO ES POSIBLE** porque `react-native-reanimated 4.0.2` lo requiere obligatoriamente
   - Error al intentar: `[Reanimated] Reanimated requires new architecture to be enabled`

## Archivos de Configuración Relevantes

### `android/gradle.properties`
```properties
newArchEnabled=true
reactNativeArchitectures=arm64-v8a
hermesEnabled=false
```

### `android/app/build.gradle`
- Tiene un script `fixAutolinkingIncludes` que corrige includes problemáticos
- Tiene un script `createCmakePlaceholders` que crea placeholders para módulos sin codegen

## Análisis del Problema

El problema parece ser una **incompatibilidad entre React Native 0.80 y las librerías nativas** cuando la nueva arquitectura está habilitada. Específicamente:

1. Los archivos generados por codegen (`Props.h`, `EventEmitters.h`, `ShadowNodes.h`) no están siendo reconocidos correctamente por el compilador C++
2. El tipo `JSI_EXPORT` no está siendo resuelto correctamente
3. Los tipos `RNCSafeAreaViewProps` y `RNCSafeAreaProviderProps` no están siendo encontrados, aunque existen en los archivos generados

## Solución Implementada

Se ha creado un script automatizado que aplica todas las soluciones necesarias:

### Uso del Script

```bash
cd KikiApp
bash fix-android-compilation.sh
```

El script ejecuta automáticamente los siguientes pasos:

1. **Limpia builds anteriores** (`./gradlew clean`)
2. **Crea placeholders de CMake** (ejecuta `create-cmake-placeholders.sh`)
3. **Crea headers placeholder** (ejecuta `create-headers-placeholder.sh`)
4. **Regenera archivos de codegen** para módulos críticos:
   - `react-native-safe-area-context`
   - `react-native-screens`
   - `react-native-svg`
5. **Aplica fix de autolinking** (ejecuta `fixAutolinkingIncludes`)
6. **Verifica y corrige el include de `jsi/jsi.h`** en `RNCSafeAreaViewState.h`
7. **Compila el APK de release** (`./gradlew assembleRelease`)

### Soluciones Aplicadas

1. **Agregado `#include <jsi/jsi.h>`** en `RNCSafeAreaViewState.h` de `react-native-safe-area-context` para resolver el error de `JSI_EXPORT`.

2. **Actualizado `create-headers-placeholder.sh`**: ahora verifica si un archivo fue generado por codegen antes de sobrescribirlo.

3. **Actualizado `fixAutolinkingIncludes`**: comenta includes problemáticos y registros de componentes que no existen.

4. **AsyncStorage configurado para JavaTurboModule**: el módulo se registra solo a través de Java/Kotlin, evitando errores de compilación C++.

### Documentación Relacionada

- `SOLUCION_ASYNCSTORAGE.md` - Solución específica para AsyncStorage
- `ANDROID_BUILD_FIX.md` - Detalles técnicos de las soluciones
- `fix-android-compilation.sh` - Script automatizado

## Pregunta para ChatGPT

¿Cómo puedo resolver estos errores de compilación C++ en React Native 0.80 con la nueva arquitectura habilitada? ¿Hay alguna configuración específica que deba ajustar, o necesito actualizar/downgrade alguna dependencia? ¿Existe algún parche o workaround conocido para este problema?

