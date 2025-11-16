# Solución para Problemas de Compilación Android con Nueva Arquitectura

Este documento describe los pasos y scripts necesarios para resolver problemas de compilación de Android cuando se usa la nueva arquitectura de React Native (`newArchEnabled=true`).

## Problema

Con la nueva arquitectura habilitada, React Native genera código C++ automáticamente para los módulos nativos. Sin embargo, durante el proceso de compilación pueden ocurrir errores porque:

1. Los directorios de código generado no existen aún cuando CMake intenta configurarlos
2. Los headers C++ generados no están disponibles cuando se compilan los módulos
3. El archivo `autolinking.cpp` generado intenta incluir headers que aún no existen

## Configuración Requerida

### 1. `android/gradle.properties`

Asegúrate de que `newArchEnabled=true` esté configurado:

```properties
# Habilitado porque react-native-reanimated 4.0.2 lo requiere
newArchEnabled=true
```

### 2. `babel.config.js`

El plugin de `react-native-reanimated` debe ser el último plugin:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-class-static-block',
    'react-native-reanimated/plugin' // Debe ser el último plugin
  ],
};
```

### 3. `react-native.config.js`

Excluir módulos problemáticos del autolinking:

```javascript
module.exports = { 
  assets: [
    "./assets/fonts/"
  ],
  dependencies: {
    '@aws-amplify/react-native': {
      platforms: {
        android: null, // Excluir del autolinking en Android
      },
    },
    '@react-native-picker/picker': {
      platforms: {
        android: null, // Excluir temporalmente del autolinking debido a problemas con código generado
      },
    },
  },
};
```

## Scripts de Solución

### 1. `create-cmake-placeholders.sh`

Este script crea archivos `CMakeLists.txt` y `placeholder.cpp` en los directorios de código generado para evitar errores de CMake cuando los directorios no existen.

**Ubicación:** `KikiApp/create-cmake-placeholders.sh`

**Qué hace:**
- Crea directorios de código generado para módulos nativos
- Genera `CMakeLists.txt` placeholder con bibliotecas STATIC
- Crea archivos `placeholder.cpp` vacíos para evitar errores de "No SOURCES"

**Módulos incluidos:**
- `@react-native-async-storage/async-storage`
- `react-native-gesture-handler`
- `react-native-image-picker`
- `react-native-pdf`
- `react-native-permissions`
- `react-native-webview`

### 2. `create-headers-placeholder.sh`

Este script crea headers C++ placeholder para evitar errores de compilación cuando los headers generados no existen.

**Ubicación:** `KikiApp/create-headers-placeholder.sh`

**Qué hace:**
- Crea headers placeholder en `jni/` para módulos que necesitan headers JSI
- Crea headers de componentes React Native en `react/renderer/components/`:
  - `Props.h` para `react-native-safe-area-context` y `react-native-screens`
  - `EventEmitters.h` para los mismos módulos

**Módulos con headers placeholder:**
- `@react-native-async-storage/async-storage` → `rnasyncstorage.h`
- `react-native-gesture-handler` → `rngesturehandler_codegen.h`
- `react-native-image-picker` → `RNImagePickerSpec.h`
- `react-native-pdf` → `rnpdf.h`
- `react-native-permissions` → `RNPermissionsSpec.h`
- `react-native-webview` → `RNCWebViewSpec.h`
- `react-native-safe-area-context` → `Props.h`, `EventEmitters.h`
- `react-native-screens` → `Props.h`, `EventEmitters.h`

## Configuración en `android/app/build.gradle`

El archivo `build.gradle` incluye dos tareas automáticas:

### Tarea `createCmakePlaceholders`

Se ejecuta antes de cualquier tarea de CMake (`configureCMake`, `externalNativeBuild`).

```gradle
task createCmakePlaceholders {
    doLast {
        def scriptPath = new File(projectDir.parent, "create-cmake-placeholders.sh")
        if (scriptPath.exists()) {
            exec {
                commandLine "bash", scriptPath.absolutePath
            }
        }
    }
}
```

### Tarea `fixAutolinkingIncludes`

Se ejecuta después de generar `autolinking.cpp` y antes de compilar. Comenta includes y bloques completos de código problemáticos, incluyendo:
- Los `#include` de headers que no existen
- Las llamadas a `ModuleProvider` de módulos problemáticos
- Los bloques `if` completos que verifican si el módulo fue encontrado
- Los `return` statements dentro de esos bloques
- **Importante:** Los `}` que cierran los bloques `if`, para evitar que la función termine prematuramente

```gradle
task fixAutolinkingIncludes {
    doLast {
        def autolinkingCpp = new File(projectDir, "build/generated/autolinking/src/main/jni/autolinking.cpp")
        if (autolinkingCpp.exists()) {
            def content = autolinkingCpp.text
            
            // Comentar includes problemáticos
            content = content.replaceAll('#include <rnasyncstorage\\.h>', '// #include <rnasyncstorage.h> // Placeholder')
            // ... más reemplazos ...
            
            autolinkingCpp.text = content
        }
    }
}
```

**Módulos comentados en autolinking.cpp:**
- `rnasyncstorage`
- `rngesturehandler_codegen`
- `RNImagePickerSpec`
- `rnpdf`
- `RNPermissionsSpec`
- `RNCWebViewSpec`

## Pasos para Resolver Problemas de Compilación

### Paso 1: Ejecutar Scripts Manualmente (si es necesario)

Si los scripts automáticos no se ejecutan correctamente, puedes ejecutarlos manualmente:

```bash
cd KikiApp

# Crear placeholders de CMake
bash create-cmake-placeholders.sh

# Crear headers placeholder
bash create-headers-placeholder.sh
```

### Paso 2: Limpiar Build Anterior

**Nota:** Después de ejecutar `clean`, los directorios placeholder se eliminan. El script `createCmakePlaceholders` debería ejecutarse automáticamente antes de las tareas de CMake, pero si encuentras errores, ejecuta el script manualmente primero:

```bash
# Opción 1: Ejecutar script manualmente antes del clean (recomendado si hay problemas)
cd KikiApp
bash create-cmake-placeholders.sh
cd android
./gradlew clean

# Opción 2: Solo ejecutar clean (el script se ejecutará automáticamente)
cd KikiApp/android
./gradlew clean
```

### Paso 3: Recompilar

```bash
# Desde la raíz del proyecto
cd KikiApp
npm run android

# O desde android/
cd android
./gradlew assembleDebug
# O para release
./gradlew assembleRelease
```

## Orden de Ejecución Automática

Las tareas se ejecutan en este orden durante el build:

1. **`createCmakePlaceholders`** → Se ejecuta antes de `configureCMake` o `externalNativeBuild`
2. **`generateAutolinking`** → Genera `autolinking.cpp` (tarea de React Native)
3. **`fixAutolinkingIncludes`** → Corrige `autolinking.cpp` después de generarlo
4. **`buildCMake`** → Compila el código C++

## Verificación

Para verificar que los scripts funcionan correctamente:

1. **Verificar que los directorios existen:**
   ```bash
   ls -la node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni/
   ls -la node_modules/react-native-safe-area-context/android/build/generated/source/codegen/jni/react/renderer/components/safeareacontext/
   ```

2. **Verificar que los headers existen:**
   ```bash
   find node_modules -name "rnasyncstorage.h" -o -name "Props.h" | grep codegen
   ```

3. **Verificar que autolinking.cpp está corregido:**
   ```bash
   grep "// #include <rnasyncstorage.h>" android/app/build/generated/autolinking/src/main/jni/autolinking.cpp
   ```

## Notas Importantes

1. **Los scripts se ejecutan automáticamente** durante el build gracias a las tareas de Gradle configuradas.

2. **Los placeholders son temporales** - El código real se generará durante el build de Gradle, pero los placeholders evitan errores de compilación tempranos.

3. **Si cambias de versión de React Native o módulos nativos**, puede ser necesario:
   - Ejecutar los scripts manualmente nuevamente
   - Limpiar el build: `cd android && ./gradlew clean`
   - Recompilar

4. **El archivo `autolinking.cpp` se regenera** en cada build, por lo que la tarea `fixAutolinkingIncludes` debe ejecutarse después de cada generación.

## Troubleshooting

### Error: "CMake Error: add_subdirectory given source ... which is not an existing directory"

**Solución:** Ejecutar `create-cmake-placeholders.sh` manualmente.

### Error: "fatal error: 'rnasyncstorage.h' file not found"

**Solución:** Ejecutar `create-headers-placeholder.sh` manualmente.

### Error: "fatal error: 'react/renderer/components/safeareacontext/Props.h' file not found"

**Solución:** El script `create-headers-placeholder.sh` ya incluye estos headers. Verificar que se ejecutó correctamente.

### Error: "non-void function does not return a value" y "use of undeclared identifier 'moduleName'"

**Síntomas:**
```
/autolinking.cpp:37:1: error: non-void function does not return a value
/autolinking.cpp:38:66: error: use of undeclared identifier 'moduleName'
```

**Causa:** El script `fixAutolinkingIncludes` comentó las líneas del módulo pero dejó el `}` que cierra el bloque `if` sin comentar, haciendo que la función termine prematuramente.

**Solución:** 
1. Ejecutar la tarea manualmente: `cd android && ./gradlew :app:fixAutolinkingIncludes`
2. Verificar que el `}` después de los módulos comentados también esté comentado en `autolinking.cpp`
3. Si el problema persiste, limpiar y recompilar: `cd android && ./gradlew clean && cd .. && npm run android`

### Error: "Task :react-native-reanimated:assertNewArchitectureEnabledTask FAILED"

**Solución:** Asegurarse de que `newArchEnabled=true` en `android/gradle.properties` y que `react-native-reanimated/plugin` está en `babel.config.js`.

### Los scripts no se ejecutan automáticamente

**Solución:** Verificar que las tareas en `build.gradle` están correctamente configuradas y que los scripts tienen permisos de ejecución:
```bash
chmod +x create-cmake-placeholders.sh
chmod +x create-headers-placeholder.sh
```

## Referencias

- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [React Native Reanimated - New Architecture](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#installation)
- [CMake Documentation](https://cmake.org/documentation/)

