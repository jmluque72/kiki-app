#!/bin/bash

echo "🔧 Creando headers placeholder para módulos nativos..."

# Crear header para async-storage
ASYNC_STORAGE_DIR="node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni"
mkdir -p "$ASYNC_STORAGE_DIR"

# NO sobrescribir si el archivo ya existe y fue generado por codegen
if [ -f "$ASYNC_STORAGE_DIR/rnasyncstorage.h" ] && grep -q "react-native-codegen\|@generated" "$ASYNC_STORAGE_DIR/rnasyncstorage.h" 2>/dev/null; then
  echo "⏭️  Saltando: $ASYNC_STORAGE_DIR/rnasyncstorage.h (ya existe y fue generado por codegen)"
else
  cat > "$ASYNC_STORAGE_DIR/rnasyncstorage.h" << 'EOF'
// Placeholder header file
// Este archivo evita errores de compilación cuando el código generado no existe
#ifndef RNASYNCSTORAGE_H
#define RNASYNCSTORAGE_H

#include <jsi/jsi.h>
#include <ReactCommon/TurboModule.h>
#include <memory>

namespace facebook {
namespace react {

// Forward declarations
class CallInvoker;

// Placeholder TurboModule para AsyncStorage
class AsyncStorageSpecJSI : public TurboModule {
public:
    AsyncStorageSpecJSI(std::shared_ptr<CallInvoker> jsInvoker);
    virtual ~AsyncStorageSpecJSI() = default;
};

// ModuleProvider function - AsyncStorage usa JavaTurboModule
std::shared_ptr<TurboModule> rnasyncstorage_ModuleProvider(
    const std::string moduleName,
    const JavaTurboModule::InitParams &params
) {
    // Esta función será implementada por el código generado o por JavaTurboModule
    return nullptr;
}

} // namespace react
} // namespace facebook

#endif // RNASYNCSTORAGE_H
EOF
  echo "✅ Creado: $ASYNC_STORAGE_DIR/rnasyncstorage.h"
fi

# Crear headers para otros módulos que puedan necesitarlos
create_header() {
  local dir=$1
  local header_name=$2
  local guard_name=$(echo "$header_name" | tr '[:lower:]' '[:upper:]' | tr '/' '_' | sed 's/\./_/g')
  
  mkdir -p "$dir"
  cat > "$dir/$header_name" << EOF
// Placeholder header file
// Este archivo evita errores de compilación cuando el código generado no existe
#ifndef ${guard_name}_H
#define ${guard_name}_H

namespace facebook {
namespace react {

// Placeholder class
class ${header_name}SpecJSI {
public:
    virtual ~${header_name}SpecJSI() = default;
};

} // namespace react
} // namespace facebook

#endif // ${guard_name}_H
EOF
  echo "✅ Creado: $dir/$header_name"
}

# Crear headers para otros módulos
create_header \
  "node_modules/react-native-gesture-handler/android/build/generated/source/codegen/jni" \
  "rngesturehandler_codegen.h"

create_header \
  "node_modules/react-native-image-picker/android/build/generated/source/codegen/jni" \
  "RNImagePickerSpec.h"

create_header \
  "node_modules/react-native-pdf/android/build/generated/source/codegen/jni" \
  "rnpdf.h"

create_header \
  "node_modules/react-native-permissions/android/build/generated/source/codegen/jni" \
  "RNPermissionsSpec.h"

create_header \
  "node_modules/react-native-webview/android/build/generated/source/codegen/jni" \
  "RNCWebViewSpec.h"

# Función para crear headers de componentes React Native
create_component_header() {
  local base_dir=$1
  local component_name=$2
  local header_name=$3
  local full_path="$base_dir/react/renderer/components/$component_name/$header_name"
  local guard_name=$(echo "${component_name}_${header_name}" | tr '[:lower:]' '[:upper:]' | tr '/' '_' | sed 's/\./_/g')
  
  mkdir -p "$(dirname "$full_path")"
  
  # NO sobrescribir si el archivo ya existe y fue generado por codegen
  if [ -f "$full_path" ] && grep -q "react-native-codegen" "$full_path" 2>/dev/null; then
    echo "⏭️  Saltando: $full_path (ya existe y fue generado por codegen)"
    return
  fi
  
  if [ "$header_name" = "Props.h" ]; then
    cat > "$full_path" << EOF
// Placeholder header file
// Este archivo evita errores de compilación cuando el código generado no existe
#ifndef ${guard_name}_H
#define ${guard_name}_H

namespace facebook {
namespace react {

// Forward declarations
class Props;
class PropsParserContext;
class RawProps;

// Placeholder Props struct
struct ${component_name}Props {
    ${component_name}Props() = default;
};

} // namespace react
} // namespace facebook

#endif // ${guard_name}_H
EOF
  elif [ "$header_name" = "EventEmitters.h" ]; then
    cat > "$full_path" << EOF
// Placeholder header file
// Este archivo evita errores de compilación cuando el código generado no existe
#ifndef ${guard_name}_H
#define ${guard_name}_H

namespace facebook {
namespace react {

// Forward declarations
class EventEmitter;

// Placeholder EventEmitter struct
struct ${component_name}EventEmitter {
    ${component_name}EventEmitter() = default;
};

} // namespace react
} // namespace facebook

#endif // ${guard_name}_H
EOF
  else
    # Generic placeholder
    cat > "$full_path" << EOF
// Placeholder header file
// Este archivo evita errores de compilación cuando el código generado no existe
#ifndef ${guard_name}_H
#define ${guard_name}_H

namespace facebook {
namespace react {

// Placeholder

} // namespace react
} // namespace facebook

#endif // ${guard_name}_H
EOF
  fi
  
  echo "✅ Creado: $full_path"
}

# Crear headers para react-native-safe-area-context
SAFEAREA_BASE="node_modules/react-native-safe-area-context/android/build/generated/source/codegen/jni"
create_component_header "$SAFEAREA_BASE" "safeareacontext" "Props.h"
create_component_header "$SAFEAREA_BASE" "safeareacontext" "EventEmitters.h"

# Crear headers para react-native-screens
SCREENS_BASE="node_modules/react-native-screens/android/build/generated/source/codegen/jni"
create_component_header "$SCREENS_BASE" "rnscreens" "Props.h"
create_component_header "$SCREENS_BASE" "rnscreens" "EventEmitters.h"

echo ""
echo "✅ Todos los headers placeholder creados"

