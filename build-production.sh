#!/bin/bash

# Script para generar bundle de producción con assets
echo "🚀 Generando bundle de producción para iOS..."

# Limpiar cache
echo "🧹 Limpiando cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID

# Generar bundle con assets
echo "📦 Generando bundle con assets..."
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/ \
  --reset-cache

# Verificar que se generó correctamente
if [ -f "ios/main.jsbundle" ]; then
    echo "✅ Bundle generado correctamente"
    echo "📊 Tamaño del bundle: $(ls -lh ios/main.jsbundle | awk '{print $5}')"
    echo "📁 Assets copiados: $(find ios/assets -type f | wc -l) archivos"
else
    echo "❌ Error generando bundle"
    exit 1
fi

echo "🎉 Proceso completado!"
echo "📱 Ahora puedes compilar en Xcode"
