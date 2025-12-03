#!/bin/bash

# Script para crear Archive de iOS con mejor manejo de errores
# Uso: ./scripts/ios-archive.sh [uat|prod]

set -e  # Salir si hay algún error

ENV=${1:-prod}  # Por defecto prod

if [ "$ENV" != "uat" ] && [ "$ENV" != "prod" ]; then
  echo "❌ Error: El entorno debe ser 'uat' o 'prod'"
  exit 1
fi

ENVFILE=".env.$ENV"
ARCHIVE_NAME="KikiApp-$ENV"
ARCHIVE_PATH="ios/build/$ARCHIVE_NAME.xcarchive"
EXPORT_PATH="ios/build/$ENV"

echo "🚀 Iniciando build de iOS para $ENV..."
echo "📁 Usando archivo: $ENVFILE"
echo ""

# Verificar que existe el archivo .env
if [ ! -f "$ENVFILE" ]; then
  echo "❌ Error: No se encontró el archivo $ENVFILE"
  exit 1
fi

# Verificar que existe ExportOptions.plist
if [ ! -f "ios/ExportOptions.plist" ]; then
  echo "❌ Error: No se encontró ios/ExportOptions.plist"
  exit 1
fi

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
ENVFILE=$ENVFILE xcodebuild clean \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  2>&1 | grep -v "Disabling previews" || true

# Crear Archive
echo ""
echo "📦 Creando Archive..."
echo "🔐 Usando code signing automático (Apple Distribution para Release)"
ENVFILE=$ENVFILE xcodebuild \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  2>&1 | tee /tmp/xcodebuild.log | grep -v "Disabling previews" || {
    echo ""
    echo "❌ Error al crear Archive. Últimas líneas del log:"
    tail -50 /tmp/xcodebuild.log | grep -A 20 "error:"
    exit 1
  }

# Verificar que el archive se creó
if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "❌ Error: El Archive no se creó en $ARCHIVE_PATH"
  exit 1
fi

echo ""
echo "✅ Archive creado exitosamente en: $ARCHIVE_PATH"

# Exportar IPA
echo ""
echo "📤 Exportando IPA..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist ios/ExportOptions.plist \
  2>&1 | tee /tmp/xcodebuild-export.log || {
    echo ""
    echo "❌ Error al exportar IPA. Últimas líneas del log:"
    tail -50 /tmp/xcodebuild-export.log | grep -A 20 "error:"
    exit 1
  }

# Verificar que el IPA se creó
IPA_PATH="$EXPORT_PATH/KikiApp.ipa"
if [ ! -f "$IPA_PATH" ]; then
  echo "❌ Error: El IPA no se creó en $IPA_PATH"
  exit 1
fi

echo ""
echo "✅ IPA exportado exitosamente en: $IPA_PATH"
echo ""
echo "📊 Tamaño del IPA: $(ls -lh "$IPA_PATH" | awk '{print $5}')"
echo ""
echo "🎉 Build completado exitosamente!"

