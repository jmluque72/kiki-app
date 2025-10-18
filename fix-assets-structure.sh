#!/bin/bash

echo "🔧 Arreglando estructura de assets..."

# Directorio raíz del proyecto React Native
RN_ROOT=$(dirname "$0")
cd "$RN_ROOT"

# 1. Limpiar estructura anterior
echo "🧹 Limpiando estructura anterior..."
rm -rf ios/KikiApp/assets

# 2. Crear nueva estructura correcta
echo "📁 Creando nueva estructura..."
mkdir -p ios/KikiApp/assets/design/icons

# 3. Copiar solo los archivos de iconos directamente
echo "📋 Copiando archivos de iconos..."
cp ios/assets/design/icons/*.png ios/KikiApp/assets/design/icons/

# 4. Verificar estructura
echo "🔍 Verificando nueva estructura..."
echo "Estructura creada:"
find ios/KikiApp/assets -type f | head -10

echo "✅ Estructura arreglada"
echo "📱 Ahora en Xcode:"
echo "   1. Elimina la carpeta 'assets' actual del proyecto"
echo "   2. Agrega la nueva carpeta 'assets' (sin duplicación)"
echo "   3. Asegúrate de que esté en 'Copy Bundle Resources'"
