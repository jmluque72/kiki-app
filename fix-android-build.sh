#!/bin/bash

echo "🧹 Limpiando proyecto Android..."

# Limpiar build de Android
cd android
./gradlew clean

# Limpiar directorios de build
rm -rf app/build
rm -rf build
rm -rf .gradle

# Limpiar node_modules de módulos problemáticos
cd ..
echo "📦 Limpiando módulos nativos..."
rm -rf node_modules/@react-native-async-storage/async-storage/android/build
rm -rf node_modules/react-native-gesture-handler/android/build

# Regenerar archivos de código nativo
echo "🔨 Regenerando código nativo..."
cd android

# Generar código para módulos que lo necesitan
./gradlew :app:generateCodegenArtifactsFromSchema || echo "⚠️ No se pudo generar código automáticamente"

# Intentar generar código para módulos específicos
echo "🔨 Generando código para async-storage..."
./gradlew :@react-native-async-storage_async-storage:generateCodegenArtifactsFromSchema 2>/dev/null || echo "⚠️ async-storage no tiene tarea de código"

echo "🔨 Generando código para gesture-handler..."
./gradlew :react-native-gesture-handler:generateCodegenArtifactsFromSchema 2>/dev/null || echo "⚠️ gesture-handler no tiene tarea de código"

cd ..
echo "✅ Limpieza completada."
echo ""
echo "Si el error persiste, intenta:"
echo "1. Deshabilitar la nueva arquitectura temporalmente en android/gradle.properties:"
echo "   Cambiar 'newArchEnabled=true' a 'newArchEnabled=false'"
echo ""
echo "2. O compilar nuevamente con: npm run android"

