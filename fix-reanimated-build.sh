#!/bin/bash

echo "🔧 Configurando react-native-reanimated para nueva arquitectura..."

# Crear directorios de código generado que faltan
echo "📁 Creando directorios de código generado..."

# Directorios para módulos comunes
echo "📁 Creando directorios para todos los módulos nativos..."

# Lista de todos los módulos que pueden necesitar código generado
MODULES=(
  "@react-native-async-storage/async-storage"
  "react-native-gesture-handler"
  "react-native-safe-area-context"
  "react-native-screens"
  "react-native-svg"
  "react-native-reanimated"
  "react-native-worklets"
  "react-native-pdf"
  "@react-native-picker/picker"
  "react-native-webview"
  "react-native-image-picker"
  "react-native-permissions"
  "react-native-video"
  "react-native-camera-kit"
)

# Crear directorios y archivos CMakeLists.txt para cada módulo
for module in "${MODULES[@]}"; do
  dir="node_modules/$module/android/build/generated/source/codegen/jni"
  if [ -d "node_modules/$module/android" ]; then
    mkdir -p "$dir"
    if [ ! -f "$dir/CMakeLists.txt" ]; then
      cat > "$dir/CMakeLists.txt" << 'EOF'
# Placeholder CMakeLists.txt
# Este archivo evita errores de CMake cuando el código generado no existe
# El código real se generará durante el build de Gradle
EOF
    fi
    echo "✅ Creado: $dir"
  else
    echo "⚠️  Módulo no encontrado: $module"
  fi
done

echo "✅ Directorios creados"
echo ""
echo "Ahora intenta compilar con: npm run android"
echo "Si aún falla, ejecuta: cd android && ./gradlew clean && cd .. && npm run android"

