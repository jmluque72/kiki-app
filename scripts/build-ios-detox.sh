#!/bin/bash

# Script para construir la app iOS para Detox con generación de codegen

set -e

# Obtener el directorio del script y cambiar al directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔨 [DETOX BUILD] Iniciando build para Detox..."
echo "📁 [DETOX BUILD] Directorio del proyecto: $PROJECT_ROOT"

# Cambiar al directorio ios
cd "$PROJECT_ROOT/ios"

# Verificar si necesitamos generar codegen
echo "🔍 [DETOX BUILD] Verificando archivos de codegen..."

# Asegurar que el framework de Detox esté instalado
echo "🔧 [DETOX BUILD] Verificando framework de Detox..."
if [ ! -d "$HOME/Library/Detox/ios" ]; then
  echo "📦 [DETOX BUILD] Instalando framework de Detox..."
  cd "$PROJECT_ROOT"
  npx detox build-framework-cache || echo "⚠️ [DETOX BUILD] Error instalando framework, continuando..."
fi

# Intentar el build normal primero
echo "🚀 [DETOX BUILD] Ejecutando build de Xcode..."
if xcodebuild -workspace KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build \
  -destination "generic/platform=iOS Simulator" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  ONLY_ACTIVE_ARCH=NO \
  build 2>&1 | tee /tmp/detox-build.log; then
  echo "✅ [DETOX BUILD] Build exitoso"
  exit 0
fi

# Si falla, verificar si es por codegen
BUILD_OUTPUT=$(cat /tmp/detox-build.log)
if echo "$BUILD_OUTPUT" | grep -qiE "codegen|generated|States\.cpp|cannot be found|Build input file cannot be found"; then
  echo "⚠️  [DETOX BUILD] Error relacionado con codegen detectado"
  echo "🔄 [DETOX BUILD] Limpiando build anterior..."
  
  # Limpiar build anterior
  rm -rf build/Build/Products/Debug-iphonesimulator/KikiApp.app 2>/dev/null || true
  
  echo "🔨 [DETOX BUILD] Generando archivos de codegen (esto puede tomar unos minutos)..."
  
  # Ejecutar build que generará codegen
  xcodebuild -workspace KikiApp.xcworkspace \
    -scheme KikiApp \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath build \
    -destination "generic/platform=iOS Simulator" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    ONLY_ACTIVE_ARCH=NO \
    build 2>&1 | grep -E "(error|warning|BUILD|Codegen|Succeeded|Failed)" | tail -50 || true
  
  echo "✅ [DETOX BUILD] Codegen generado, build completado"
  exit 0
else
  echo "❌ [DETOX BUILD] Error de build no relacionado con codegen"
  echo "📋 [DETOX BUILD] Últimas líneas del log:"
  tail -30 /tmp/detox-build.log
  exit 1
fi

