#!/bin/bash

# Script para ejecutar tests E2E automatizados
# Este script construye la app y ejecuta los tests automáticamente

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz de KikiApp"
    exit 1
fi

# Detectar plataforma
PLATFORM=${1:-ios}
CONFIG=""

if [ "$PLATFORM" = "ios" ]; then
    CONFIG="ios.sim.debug"
    print_info "Plataforma: iOS Simulator"
elif [ "$PLATFORM" = "android" ]; then
    CONFIG="android.emu.debug"
    print_info "Plataforma: Android Emulator"
else
    print_error "Plataforma no válida. Usa 'ios' o 'android'"
    exit 1
fi

print_info "=========================================="
print_info "🚀 Iniciando Tests E2E Automatizados"
print_info "=========================================="
print_info "Plataforma: $PLATFORM"
print_info "Configuración: $CONFIG"
print_info ""

# Paso 1: Limpiar builds anteriores
print_info "📦 Paso 1: Limpiando builds anteriores..."
if [ "$PLATFORM" = "ios" ]; then
    print_info "Limpiando builds y archivos generados de iOS..."
    rm -rf ios/build
    rm -rf ios/build/generated
    print_info "✅ Builds de iOS limpiados"
else
    cd android && ./gradlew clean && cd ..
    print_info "✅ Builds de Android limpiados"
fi

# Paso 2: Preparar iOS (regenerar codegen si es necesario)
if [ "$PLATFORM" = "ios" ]; then
    print_info ""
    print_info "🔧 Paso 2: Preparando proyecto iOS..."
    
    # Verificar que los pods estén instalados
    if [ ! -d "ios/Pods" ]; then
        print_warning "Pods no encontrados. Instalando pods..."
        cd ios && pod install && cd ..
    fi
    
    print_info "✅ Preparación de iOS completada"
    print_info "Nota: Los archivos de codegen se generarán automáticamente durante el build"
fi

# Paso 3: Construir la app
print_info ""
print_info "🔨 Paso 3: Construyendo la app para testing..."

if [ "$PLATFORM" = "ios" ]; then
    print_info "Ejecutando build de Detox para iOS..."
    
    # Intentar el build de Detox primero (más rápido)
    # Guardar output en archivo temporal para análisis
    TEMP_BUILD_LOG=$(mktemp)
    
    set +e  # No salir en error temporalmente
    npx detox build --configuration $CONFIG 2>&1 | tee "$TEMP_BUILD_LOG"
    BUILD_EXIT_CODE=${PIPESTATUS[0]}
    set -e  # Volver a activar salida en error
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        BUILD_OUTPUT=$(cat "$TEMP_BUILD_LOG")
        rm -f "$TEMP_BUILD_LOG"
        
        # Verificar si el error está relacionado con codegen
        if echo "$BUILD_OUTPUT" | grep -qiE "codegen|generated|States\.cpp|cannot be found|Build input file cannot be found"; then
            print_warning "Error relacionado con archivos de codegen detectado."
            print_info "Intentando generar archivos de codegen primero..."
            
            # Generar archivos de codegen usando un build mínimo de React Native
            cd ios
            
            print_info "Ejecutando build previo para generar codegen (esto puede tomar unos minutos)..."
            xcodebuild -workspace KikiApp.xcworkspace \
                -scheme KikiApp \
                -configuration Debug \
                -sdk iphonesimulator \
                -derivedDataPath build \
                -destination 'generic/platform=iOS Simulator' \
                CODE_SIGNING_ALLOWED=NO \
                CODE_SIGN_IDENTITY="" \
                CODE_SIGNING_REQUIRED=NO \
                ONLY_ACTIVE_ARCH=NO \
                build 2>&1 | grep -E "(error|warning|BUILD|Codegen|Succeeded|Failed)" | tail -30 || true
            
            cd ..
            
            print_info "Reintentando build de Detox..."
            if ! npx detox build --configuration $CONFIG; then
                print_error "Error al construir la app después de generar codegen"
                print_info ""
                print_info "💡 Sugerencias para resolver el problema:"
                print_info "1. Reinstala los pods: cd ios && pod install && cd .."
                print_info "2. Limpia y reconstruye:"
                print_info "   rm -rf ios/build"
                print_info "   cd ios && pod install && cd .."
                print_info "   npm run e2e:build:ios"
                print_info "3. O ejecuta manualmente: npx react-native run-ios --no-packager"
                exit 1
            fi
        else
            print_error "Error al construir la app (no relacionado con codegen)"
            echo "$BUILD_OUTPUT" | tail -20
            exit 1
        fi
    fi
else
    print_info "Ejecutando: detox build --configuration $CONFIG"
    npx detox build --configuration $CONFIG
    
    if [ $? -ne 0 ]; then
        print_error "Error al construir la app"
        exit 1
    fi
fi

print_info "✅ App construida exitosamente"

# Paso 4: Verificar que el emulador/dispositivo está disponible
print_info ""
print_info "📱 Paso 3: Verificando emulador/dispositivo..."
if [ "$PLATFORM" = "ios" ]; then
    # Verificar simulador iOS
    xcrun simctl list devices | grep -q "Booted" || {
        print_warning "No hay simuladores ejecutándose. Iniciando simulador..."
        # Intentar iniciar el simulador por defecto
        xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || print_warning "No se pudo iniciar simulador automáticamente"
    }
else
    # Verificar emulador Android
    adb devices | grep -q "emulator" || {
        print_warning "No hay emuladores ejecutándose. Por favor inicia un emulador Android."
        print_info "Puedes iniciar uno con: emulator -avd Pixel_5_API_31"
    }
fi

# Paso 5: Ejecutar tests
print_info ""
print_info "🧪 Paso 5: Ejecutando tests E2E..."
print_info "Ejecutando: detox test --configuration $CONFIG e2e/login-automated.e2e.js"

npx detox test --configuration $CONFIG e2e/login-automated.e2e.js

TEST_RESULT=$?

# Paso 6: Resultados
print_info ""
if [ $TEST_RESULT -eq 0 ]; then
    print_info "=========================================="
    print_info "✅ Tests E2E completados exitosamente"
    print_info "=========================================="
else
    print_error "=========================================="
    print_error "❌ Tests E2E fallaron"
    print_error "=========================================="
    print_info "Revisa los logs y screenshots en la carpeta 'artifacts'"
fi

exit $TEST_RESULT

