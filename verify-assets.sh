#!/bin/bash

echo "🔍 Verificando assets para iOS..."

# Verificar que los assets existan
if [ -d "ios/KikiApp/assets" ]; then
    echo "✅ Assets encontrados:"
    find ios/KikiApp/assets -name "*.png" | wc -l | xargs echo "   - Archivos PNG:"
    find ios/KikiApp/assets -name "*.jpg" | wc -l | xargs echo "   - Archivos JPG:"
    echo "   - Total de assets: $(find ios/KikiApp/assets -type f | wc -l)"
else
    echo "❌ Error: Assets no encontrados"
    exit 1
fi

# Verificar que el bundle exista
if [ -f "ios/main.jsbundle" ]; then
    echo "✅ Bundle JavaScript generado"
else
    echo "❌ Error: Bundle JavaScript no encontrado"
    exit 1
fi

echo "📱 Ahora abre Xcode y agrega la carpeta 'assets' al proyecto"
echo "   - Selecciona el proyecto KikiApp"
echo "   - Add Files to KikiApp"
echo "   - Selecciona la carpeta ios/KikiApp/assets"
echo "   - Asegúrate de que esté en 'Copy Bundle Resources'"
