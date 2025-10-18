#!/bin/bash

# Script para arreglar assets en iOS
echo "🔧 Arreglando assets para iOS..."

# Directorio raíz del proyecto React Native
RN_ROOT=$(dirname "$0")
cd "$RN_ROOT"

# 1. Limpiar assets anteriores
echo "🧹 Limpiando assets anteriores..."
rm -rf ios/KikiApp/assets

# 2. Regenerar bundle con assets
echo "📦 Regenerando bundle con assets..."
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/ \
  --reset-cache

# 3. Copiar assets al bundle de la app
echo "📁 Copiando assets al bundle de la app..."
cp -r ios/assets/ ios/KikiApp/

# 4. Verificar que los assets se copiaron
echo "🔍 Verificando assets copiados..."
if [ -d "ios/KikiApp/assets" ]; then
  echo "✅ Assets copiados correctamente:"
  find ios/KikiApp/assets -name "*.png" | head -5
else
  echo "❌ Error: Assets no se copiaron"
  exit 1
fi

echo "✅ Assets arreglados para iOS"
echo "📱 Ahora compila en Xcode y verifica que los assets estén incluidos en 'Copy Bundle Resources'"
