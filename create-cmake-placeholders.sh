#!/bin/bash

echo "🔧 Creando CMakeLists.txt placeholders para módulos nativos..."

# Función para crear un CMakeLists.txt válido pero vacío
create_cmake_placeholder() {
  local dir=$1
  local target_name=$2
  
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
  fi
  
  # Crear un archivo fuente vacío
  local cpp_file="$dir/placeholder.cpp"
  if [ ! -f "$cpp_file" ]; then
    cat > "$cpp_file" << 'CPPEOF'
// Placeholder source file
// Este archivo evita errores de CMake cuando el código generado no existe
// El código real se generará durante el build de Gradle
CPPEOF
  fi
  
  cat > "$dir/CMakeLists.txt" << EOF
# Placeholder CMakeLists.txt
# Este archivo evita errores de CMake cuando el código generado no existe
# El código real se generará durante el build de Gradle

# Crear una biblioteca STATIC con un archivo fuente placeholder
add_library($target_name STATIC
  placeholder.cpp
)

# Incluir directorios necesarios
target_include_directories($target_name PRIVATE
  \${CMAKE_CURRENT_SOURCE_DIR}
)
EOF
  echo "✅ Creado: $dir/CMakeLists.txt y placeholder.cpp"
}

# Crear placeholders para todos los módulos que aparecen en el autolinking
create_cmake_placeholder \
  "node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni" \
  "react_codegen_rnasyncstorage"

create_cmake_placeholder \
  "node_modules/react-native-gesture-handler/android/build/generated/source/codegen/jni" \
  "react_codegen_rngesturehandler_codegen"

create_cmake_placeholder \
  "node_modules/react-native-image-picker/android/build/generated/source/codegen/jni" \
  "react_codegen_RNImagePickerSpec"

create_cmake_placeholder \
  "node_modules/react-native-pdf/android/build/generated/source/codegen/jni" \
  "react_codegen_rnpdf"

create_cmake_placeholder \
  "node_modules/react-native-permissions/android/build/generated/source/codegen/jni" \
  "react_codegen_RNPermissionsSpec"

create_cmake_placeholder \
  "node_modules/react-native-reanimated/android/build/generated/source/codegen/jni" \
  "react_codegen_rnreanimated"

create_cmake_placeholder \
  "node_modules/react-native-webview/android/build/generated/source/codegen/jni" \
  "react_codegen_RNCWebViewSpec"

create_cmake_placeholder \
  "node_modules/react-native-worklets/android/build/generated/source/codegen/jni" \
  "react_codegen_rnworklets"

echo ""
echo "✅ Todos los placeholders creados"

# También crear headers placeholder
if [ -f "create-headers-placeholder.sh" ]; then
    echo ""
    echo "🔧 Creando headers placeholder..."
    bash create-headers-placeholder.sh 2>/dev/null || echo "⚠️ Error creando headers, continuando..."
fi

echo ""
echo "Ahora intenta compilar con: cd android && ./gradlew clean && cd .. && npm run android"

