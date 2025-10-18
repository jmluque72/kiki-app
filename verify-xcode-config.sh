#!/bin/bash

echo "🔍 Verificando configuración correcta de Xcode..."

# Verificar estructura de archivos
if [ -d "ios/KikiApp/assets/design/icons" ]; then
    echo "✅ Estructura de archivos correcta:"
    echo "   - assets/design/icons/ existe"
    echo "   - Archivos PNG: $(find ios/KikiApp/assets/design/icons -name "*.png" | wc -l)"
    
    echo ""
    echo "📱 CONFIGURACIÓN CORRECTA EN XCODE:"
    echo ""
    echo "1. NAVEGADOR DEL PROYECTO debe mostrar:"
    echo "   KikiApp/"
    echo "   ├── KikiApp/"
    echo "   │   ├── AppDelegate.swift"
    echo "   │   ├── Info.plist"
    echo "   │   └── assets/                    ← Solo esta carpeta"
    echo "   │       └── design/"
    echo "   │           └── icons/"
    echo "   │               ├── kiki_login.png"
    echo "   │               └── ..."
    echo "   ├── main.jsbundle"
    echo "   └── Pods/"
    echo ""
    echo "2. BUILD PHASES → Copy Bundle Resources debe mostrar:"
    echo "   Copy Bundle Resources (2 items)"
    echo "   ├── main.jsbundle"
    echo "   └── assets/                    ← Solo esta entrada"
    echo ""
    echo "❌ NO debe aparecer:"
    echo "   - assets/assets/"
    echo "   - Archivos PNG individuales"
    echo "   - Múltiples entradas de assets"
    echo ""
    echo "🔧 Si no está así:"
    echo "   1. Elimina la carpeta 'assets' del proyecto"
    echo "   2. Elimina todas las entradas de 'assets' en Build Phases"
    echo "   3. Agrega de nuevo con 'Create groups'"
    echo "   4. Verifica que aparezca solo 'assets/' en Build Phases"
    
else
    echo "❌ Error: Estructura no encontrada"
    echo "   Ejecuta: ./fix-assets-structure.sh"
fi
