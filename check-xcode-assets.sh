#!/bin/bash

echo "🔍 Verificando configuración de assets en Xcode..."

# Verificar que la estructura exista
if [ -d "ios/KikiApp/assets/design/icons" ]; then
    echo "✅ Estructura de archivos correcta:"
    echo "   - assets/design/icons/ existe"
    echo "   - Archivos: $(find ios/KikiApp/assets/design/icons -name "*.png" | wc -l)"
    
    echo ""
    echo "📱 En Xcode, verifica que:"
    echo "   1. En el navegador del proyecto aparezca:"
    echo "      KikiApp/"
    echo "      └── assets/"
    echo "          └── design/"
    echo "              └── icons/"
    echo "                  ├── kiki_login.png"
    echo "                  └── ..."
    echo ""
    echo "   2. En Build Phases → Copy Bundle Resources aparezca SOLO:"
    echo "      ✅ main.jsbundle"
    echo "      ✅ assets/ (una sola entrada)"
    echo "      ❌ NO deben aparecer archivos PNG individuales"
    echo ""
    echo "   3. Si aparecen archivos individuales:"
    echo "      - Elimina la carpeta 'assets' del proyecto"
    echo "      - Agrega de nuevo con 'Create groups'"
    echo "      - NO 'Create folder references'"
    
else
    echo "❌ Error: Estructura no encontrada"
    echo "   Ejecuta: ./fix-assets-structure.sh"
fi
