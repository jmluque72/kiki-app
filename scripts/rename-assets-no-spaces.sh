#!/bin/bash

# Script para renombrar archivos con espacios y mayúsculas
# Esto es necesario porque Android no funciona bien con espacios ni mayúsculas en nombres de archivos

echo "🔄 Renombrando archivos con espacios y mayúsculas..."

cd "$(dirname "$0")/.."

# Directorio de iconos
ICONS_DIR="assets/design/icons"

# Contador de archivos renombrados
renamed_count=0

# Renombrar todos los archivos con espacios en el directorio de iconos
cd "$ICONS_DIR" || exit 1

# 1. Renombrar archivos con espacios
for file in *" "*; do
  if [ -f "$file" ]; then
    # Reemplazar espacios con guiones bajos
    new_name="${file// /_}"
    
    # Solo renombrar si el nombre cambió
    if [ "$file" != "$new_name" ]; then
      echo "📝 Renombrando (espacios): $file -> $new_name"
      mv "$file" "$new_name"
      ((renamed_count++))
    fi
  fi
done

# 2. Renombrar archivos con mayúsculas a minúsculas
for file in *[A-Z]*; do
  if [ -f "$file" ]; then
    # Convertir a minúsculas
    new_name=$(echo "$file" | tr '[:upper:]' '[:lower:]')
    
    # Solo renombrar si el nombre cambió
    if [ "$file" != "$new_name" ]; then
      echo "📝 Renombrando (mayúsculas): $file -> $new_name"
      mv "$file" "$new_name"
      ((renamed_count++))
    fi
  fi
done

cd - > /dev/null || exit 1

echo ""
echo "✅ Archivos renombrados: $renamed_count"
echo ""

# Verificar si quedan archivos con problemas
remaining_spaces=$(find "$ICONS_DIR" -type f \( -name "*.png" -o -name "*.svg" -o -name "*.jpg" -o -name "*.jpeg" \) -name "* *" 2>/dev/null | wc -l | tr -d ' ')
remaining_uppercase=$(find "$ICONS_DIR" -type f \( -name "*.png" -o -name "*.svg" -o -name "*.jpg" -o -name "*.jpeg" \) -name "*[A-Z]*" 2>/dev/null | wc -l | tr -d ' ')

if [ "$remaining_spaces" -eq 0 ] && [ "$remaining_uppercase" -eq 0 ]; then
  echo "✅ Todos los archivos fueron renombrados correctamente"
else
  if [ "$remaining_spaces" -gt 0 ]; then
    echo "⚠️  Aún quedan $remaining_spaces archivos con espacios"
  fi
  if [ "$remaining_uppercase" -gt 0 ]; then
    echo "⚠️  Aún quedan $remaining_uppercase archivos con mayúsculas"
  fi
fi

echo ""
echo "🔍 Buscando referencias en el código..."
echo "   (Revisa manualmente los archivos que usen estos iconos)"

