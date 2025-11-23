#!/bin/bash

# Script para resolver problemas de compilación Android con Nueva Arquitectura
# Basado en PROBLEMA_COMPILACION_ANDROID.md y las soluciones implementadas

set -e  # Salir si hay algún error

echo "🔧 Iniciando solución para problemas de compilación Android..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz de KikiApp"
    exit 1
fi

# Paso 1: Limpiar builds anteriores
print_step "Paso 1: Limpiando builds anteriores..."
cd android
./gradlew clean
cd ..
echo "✅ Limpieza completada"
echo ""

# Paso 2: Crear placeholders de CMake
print_step "Paso 2: Creando placeholders de CMake..."
if [ -f "create-cmake-placeholders.sh" ]; then
    chmod +x create-cmake-placeholders.sh
    bash create-cmake-placeholders.sh
    echo "✅ Placeholders de CMake creados"
else
    print_warning "create-cmake-placeholders.sh no encontrado, saltando..."
fi
echo ""

# Paso 3: Crear headers placeholder
print_step "Paso 3: Creando headers placeholder..."
if [ -f "create-headers-placeholder.sh" ]; then
    chmod +x create-headers-placeholder.sh
    bash create-headers-placeholder.sh
    echo "✅ Headers placeholder creados"
else
    print_warning "create-headers-placeholder.sh no encontrado, saltando..."
fi
echo ""

# Paso 4: Regenerar archivos de codegen para módulos críticos
print_step "Paso 4: Regenerando archivos de codegen..."
cd android

# Regenerar para react-native-safe-area-context
print_step "  - Regenerando codegen para react-native-safe-area-context..."
./gradlew :react-native-safe-area-context:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando safe-area-context"

# Regenerar para react-native-screens
print_step "  - Regenerando codegen para react-native-screens..."
./gradlew :react-native-screens:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando screens"

# Regenerar para react-native-svg
print_step "  - Regenerando codegen para react-native-svg..."
./gradlew :react-native-svg:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando svg"

# Regenerar para react-native-safe-area-context (asegurar Props.h)
print_step "  - Regenerando codegen para react-native-safe-area-context..."
rm -f ../node_modules/react-native-safe-area-context/android/build/generated/source/codegen/jni/react/renderer/components/safeareacontext/Props.h
./gradlew :react-native-safe-area-context:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando safe-area-context"

# Regenerar para react-native-screens (asegurar Props.h)
print_step "  - Regenerando codegen para react-native-screens..."
rm -f ../node_modules/react-native-screens/android/build/generated/source/codegen/jni/react/renderer/components/rnscreens/Props.h
./gradlew :react-native-screens:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando screens"

cd ..
echo "✅ Archivos de codegen regenerados"
echo ""

# Paso 5: Aplicar fix de autolinking
print_step "Paso 5: Aplicando fix de autolinking..."
cd android
./gradlew :app:fixAutolinkingIncludes
cd ..
echo "✅ Fix de autolinking aplicado"
echo ""

# Paso 6: Verificar que el include de jsi/jsi.h esté en todos los archivos State
print_step "Paso 6: Verificando fix de JSI_EXPORT en archivos State..."

# Función para agregar jsi/jsi.h si no está presente
add_jsi_include() {
    local file=$1
    if [ -f "$file" ]; then
        if grep -q "#include <jsi/jsi.h>" "$file"; then
            echo "  ✅ $file ya tiene jsi/jsi.h"
        else
            print_warning "  Agregando jsi/jsi.h a $file..."
            # Agregar después de #pragma once o al inicio si no hay #pragma once
            if grep -q "^#pragma once" "$file"; then
                sed -i.bak '2a\
#include <jsi/jsi.h>
' "$file"
            else
                sed -i.bak '1a\
#include <jsi/jsi.h>
' "$file"
            fi
            rm -f "${file}.bak"
            echo "  ✅ Include agregado"
        fi
    fi
}

# react-native-safe-area-context
add_jsi_include "node_modules/react-native-safe-area-context/common/cpp/react/renderer/components/safeareacontext/RNCSafeAreaViewState.h"

# react-native-screens
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSSafeAreaViewState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSScreenState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSFullWindowOverlayState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSBottomTabsState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSSplitViewScreenState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSScreenStackHeaderConfigState.h"
add_jsi_include "node_modules/react-native-screens/common/cpp/react/renderer/components/rnscreens/RNSScreenStackHeaderSubviewState.h"

echo "✅ Verificación de includes completada"
echo ""

# Paso 7: Regenerar codegen para AsyncStorage (asegurar que esté disponible)
print_step "Paso 7: Regenerando codegen para AsyncStorage..."
cd android
./gradlew :react-native-async-storage:generateCodegenArtifactsFromSchema --rerun-tasks 2>&1 | tail -3 || print_warning "Error regenerando AsyncStorage codegen"
cd ..
echo "✅ Codegen de AsyncStorage regenerado"
echo ""

# Paso 8: Limpiar y regenerar autolinking para asegurar que todo esté actualizado
print_step "Paso 8: Regenerando autolinking..."
cd android
./gradlew :app:generateAutolinking 2>&1 | tail -3 || print_warning "Error regenerando autolinking"
./gradlew :app:fixAutolinkingIncludes 2>&1 | tail -3 || print_warning "Error aplicando fix de autolinking"
cd ..
echo "✅ Autolinking regenerado"
echo ""

# Paso 9: Asegurar que todas las dependencias estén instaladas
print_step "Paso 9: Verificando dependencias..."
cd ..
if [ -f "package.json" ]; then
    print_step "  - Ejecutando npm install para asegurar dependencias..."
    npm install --legacy-peer-deps 2>&1 | tail -3 || print_warning "Error en npm install"
fi
echo "✅ Dependencias verificadas"
echo ""

# Paso 10: Intentar compilar
print_step "Paso 10: Intentando compilar APK de release..."
cd android
./gradlew assembleRelease 2>&1 | tee /tmp/gradle_build.log

# Verificar el resultado del build
if grep -q "BUILD SUCCESSFUL" /tmp/gradle_build.log; then
        echo ""
        print_step "✅ Build exitoso!"
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
            echo "✅ APK generado: $APK_PATH ($APK_SIZE)"
            
            # Verificar que el bundle de JavaScript esté incluido
            print_step "Verificando contenido del APK..."
            if unzip -l "$APK_PATH" 2>/dev/null | grep -q "index.android.bundle"; then
                echo "✅ Bundle de JavaScript encontrado en el APK"
            else
                print_warning "⚠️ Bundle de JavaScript NO encontrado en el APK"
                echo "   Esto puede causar que la app no arranque correctamente"
            fi
            
            # Verificar librerías nativas
            NATIVE_LIBS=$(unzip -l "$APK_PATH" 2>/dev/null | grep -c "\.so$" || echo "0")
            if [ "$NATIVE_LIBS" -gt "0" ]; then
                echo "✅ $NATIVE_LIBS librerías nativas (.so) encontradas en el APK"
            else
                print_warning "⚠️ No se encontraron librerías nativas en el APK"
            fi
        fi
else
    print_error "Build falló. Mostrando últimos errores:"
    echo ""
    # Mostrar los últimos errores del log
    tail -50 /tmp/gradle_build.log | grep -A 10 -B 5 -E "(error|ERROR|FAILED|Exception|fatal)" | head -40 || tail -30 /tmp/gradle_build.log
    echo ""
    print_warning "Errores comunes:"
    echo "  - Si hay errores de codegen, ejecuta: cd android && ./gradlew :MODULO:generateCodegenArtifactsFromSchema --rerun-tasks"
    echo "  - Si hay errores de autolinking, verifica que fixAutolinkingIncludes se ejecutó correctamente"
    echo "  - Si hay errores de CMake, verifica que los placeholders se crearon correctamente"
    echo "  - Revisa el log completo en /tmp/gradle_build.log"
    exit 1
fi

cd ..
echo ""
print_step "✅ Proceso completado!"
echo ""
echo "Si encuentras errores, revisa:"
echo "  - PROBLEMA_COMPILACION_ANDROID.md para el contexto del problema"
echo "  - SOLUCION_ASYNCSTORAGE.md para la solución de AsyncStorage"
echo "  - ANDROID_BUILD_FIX.md para más detalles técnicos"

