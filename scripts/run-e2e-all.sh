#!/bin/bash

# Script para ejecutar todos los tests E2E automatizados

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

PLATFORM=${1:-ios}
CONFIG=""

if [ "$PLATFORM" = "ios" ]; then
    CONFIG="ios.sim.debug"
elif [ "$PLATFORM" = "android" ]; then
    CONFIG="android.emu.debug"
else
    echo -e "${RED}❌ Plataforma no válida. Usa 'ios' o 'android'${NC}"
    exit 1
fi

print_info "🚀 Ejecutando todos los tests E2E en $PLATFORM"

# Construir la app
print_info "🔨 Construyendo app..."
npx detox build --configuration $CONFIG

# Ejecutar todos los tests
print_info "🧪 Ejecutando tests..."
npx detox test --configuration $CONFIG

print_info "✅ Tests completados"

