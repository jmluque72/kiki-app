#!/bin/bash

# Script para generar el bundle de Android en modo release
# Este script genera el AAB (Android App Bundle) que se usa para subir a Google Play Store

set -e

echo "🚀 Generando bundle de Android en modo release..."

# Navegar al directorio de Android
cd "$(dirname "$0")/android"

# Limpiar builds anteriores (opcional, descomentar si quieres limpiar)
# echo "🧹 Limpiando builds anteriores..."
# ./gradlew clean

# Generar el bundle (AAB)
echo "📦 Generando Android App Bundle (AAB)..."
./gradlew bundleRelease

# El archivo se generará en:
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_PATH" ]; then
    echo "✅ Bundle generado exitosamente!"
    echo "📍 Ubicación: $AAB_PATH"
    echo ""
    echo "📊 Información del bundle:"
    ls -lh "$AAB_PATH"
else
    echo "❌ Error: No se pudo generar el bundle"
    exit 1
fi

echo ""
echo "💡 Para generar un APK en lugar de AAB, ejecuta:"
echo "   npm run android:build:apk"
echo ""
echo "💡 Para subir el bundle a Google Play Store, usa:"
echo "   https://play.google.com/console"







