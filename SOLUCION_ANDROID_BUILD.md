# Solución para Error de Build Android - CMake

## Problema
El error indica que CMake está buscando directorios de código generado que no existen:
- `@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni/`
- `react-native-gesture-handler/android/build/generated/source/codegen/jni/`

## Causa
Esto ocurre cuando `newArchEnabled=true` está habilitado pero los módulos nativos no han generado su código.

## Soluciones

### Opción 1: Generar el código faltante (Recomendado)

```bash
# 1. Limpiar el proyecto
cd android
./gradlew clean

# 2. Limpiar builds de módulos
cd ..
rm -rf node_modules/@react-native-async-storage/async-storage/android/build
rm -rf node_modules/react-native-gesture-handler/android/build

# 3. Regenerar código
cd android
./gradlew :app:generateCodegenArtifactsFromSchema

# 4. Compilar
cd ..
npm run android
```

### Opción 2: Deshabilitar temporalmente la Nueva Arquitectura

Si no necesitas la nueva arquitectura de React Native, puedes deshabilitarla:

1. Edita `android/gradle.properties`
2. Cambia `newArchEnabled=true` a `newArchEnabled=false`
3. Limpia y recompila:

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Opción 3: Usar el script de limpieza

```bash
chmod +x fix-android-build.sh
./fix-android-build.sh
npm run android
```

## Nota
Si usas la nueva arquitectura (`newArchEnabled=true`), asegúrate de que todos los módulos nativos sean compatibles y tengan su código generado correctamente.

