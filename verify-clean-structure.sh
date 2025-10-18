#!/bin/bash

echo "🔍 Verificando estructura limpia de assets..."

# Verificar que la estructura sea correcta
if [ -d "ios/KikiApp/assets/design/icons" ]; then
    echo "✅ Estructura correcta encontrada:"
    echo "   - assets/design/icons/ existe"
    echo "   - Archivos PNG: $(find ios/KikiApp/assets/design/icons -name "*.png" | wc -l)"
    
    echo ""
    echo "📁 Estructura actual:"
    find ios/KikiApp/assets -type f | head -5
    
    echo ""
    echo "📱 En Xcode, verifica que en Build Phases → Copy Bundle Resources aparezca:"
    echo "   ✅ main.jsbundle"
    echo "   ✅ assets/ (solo esta entrada)"
    echo "   ❌ NO debe aparecer: assets/assets/ o archivos PNG individuales"
    
else
    echo "❌ Error: Estructura incorrecta"
    echo "   Ejecuta: ./fix-assets-structure.sh"
    exit 1
fi

echo ""
echo "🧹 Después de verificar, haz Clean Build en Xcode:"
echo "   1. Product → Clean Build Folder (Cmd+Shift+K)"
echo "   2. Xcode → Preferences → Locations → Derived Data → Delete"
echo "   3. Cerrar y reabrir Xcode"
echo "   4. Build → Build (Cmd+B)"
