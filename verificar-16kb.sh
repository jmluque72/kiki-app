#!/bin/bash
# Script para verificar el alineamiento de librerías .so para soporte de 16 KB

set -e

echo "🔍 Verificador de Alineamiento para Páginas de 16 KB"
echo "=================================================="
echo ""

# Buscar APK o AAB
APK_PATH=""
AAB_PATH=""

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    echo "✅ APK encontrado: $APK_PATH"
elif [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
    echo "✅ AAB encontrado: $AAB_PATH"
    echo "⚠️  Nota: AAB necesita ser extraído primero"
else
    echo "❌ No se encontró APK ni AAB compilado"
    echo "💡 Ejecuta primero: cd android && ./gradlew assembleRelease"
    exit 1
fi

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
echo "📁 Directorio temporal: $TEMP_DIR"
echo ""

# Extraer APK o AAB
if [ -n "$APK_PATH" ]; then
    echo "📦 Extrayendo APK..."
    unzip -q -o "$APK_PATH" -d "$TEMP_DIR" 2>/dev/null || {
        echo "❌ Error al extraer APK"
        rm -rf "$TEMP_DIR"
        exit 1
    }
    LIB_DIR="$TEMP_DIR/lib"
elif [ -n "$AAB_PATH" ]; then
    echo "📦 Extrayendo AAB..."
    unzip -q -o "$AAB_PATH" -d "$TEMP_DIR" 2>/dev/null || {
        echo "❌ Error al extraer AAB"
        rm -rf "$TEMP_DIR"
        exit 1
    }
    # AAB tiene estructura diferente
    if [ -d "$TEMP_DIR/base/lib" ]; then
        LIB_DIR="$TEMP_DIR/base/lib"
    else
        LIB_DIR="$TEMP_DIR/lib"
    fi
fi

if [ ! -d "$LIB_DIR" ]; then
    echo "❌ No se encontró directorio lib/"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "🔍 Verificando alineamiento de librerías .so..."
echo ""

# Contadores
TOTAL=0
COMPATIBLE=0
NO_COMPATIBLE=0
PROBLEMAS=()

# Verificar cada arquitectura
for arch_dir in "$LIB_DIR"/*; do
    if [ -d "$arch_dir" ]; then
        arch=$(basename "$arch_dir")
        echo "📱 Arquitectura: $arch"
        echo "----------------------------------------"
        
        for so_file in "$arch_dir"/*.so; do
            if [ -f "$so_file" ]; then
                TOTAL=$((TOTAL + 1))
                so_name=$(basename "$so_file")
                
                # Verificar alineamiento usando readelf (greadelf en macOS con binutils)
                READELF_CMD=""
                if command -v greadelf >/dev/null 2>&1; then
                    READELF_CMD="greadelf"
                elif command -v readelf >/dev/null 2>&1; then
                    READELF_CMD="readelf"
                elif [ -f "/opt/homebrew/Cellar/binutils/2.45.1/bin/readelf" ]; then
                    READELF_CMD="/opt/homebrew/Cellar/binutils/2.45.1/bin/readelf"
                elif [ -f "/opt/homebrew/bin/greadelf" ]; then
                    READELF_CMD="/opt/homebrew/bin/greadelf"
                else
                    # Buscar readelf en binutils
                    READELF_CMD=$(find /opt/homebrew -name "readelf" 2>/dev/null | head -1)
                fi
                
                if [ -n "$READELF_CMD" ]; then
                    # El formato varía según la arquitectura:
                    # - armeabi-v7a/x86: alineamiento al final de la primera línea LOAD
                    # - arm64-v8a/x86_64: alineamiento en la segunda línea después de LOAD
                    output=$($READELF_CMD -l "$so_file" 2>/dev/null)
                    
                    # Intentar primero: formato armeabi-v7a/x86 (alineamiento al final de la línea)
                    align=$(echo "$output" | grep "^  LOAD" | head -1 | awk '{print $NF}' | grep -E "0x[0-9a-fA-F]+" || echo "")
                    
                    if [ -z "$align" ] || [ "$align" = "0x0000000000000000" ]; then
                        # Intentar segundo: formato arm64-v8a/x86_64 (alineamiento en la segunda línea)
                        align=$(echo "$output" | grep -A 1 "^  LOAD" | head -2 | tail -1 | awk '{print $NF}' | grep -E "0x[0-9a-fA-F]+" || echo "")
                    fi
                    
                    if [ -z "$align" ] || [ "$align" = "0x0000000000000000" ]; then
                        # Intentar método alternativo - buscar cualquier número hexadecimal al final
                        align=$(echo "$output" | grep "^  LOAD" -A 1 | grep -oE "0x[0-9a-fA-F]+" | tail -1 || echo "")
                    fi
                else
                    align=""
                fi
                
                if [ -n "$align" ]; then
                    # Convertir a decimal para comparación
                    align_decimal=$(echo "$align" | sed 's/0x//' | tr '[:lower:]' '[:upper:]')
                    align_decimal=$((16#$align_decimal))
                    
                    if [ "$align_decimal" -eq 16384 ] || [ "$align" = "0x4000" ]; then
                        echo "  ✅ $so_name: Alineado a 16 KB ($align)"
                        COMPATIBLE=$((COMPATIBLE + 1))
                    else
                        echo "  ❌ $so_name: Alineado a $align ($align_decimal bytes) - NO es 16 KB"
                        NO_COMPATIBLE=$((NO_COMPATIBLE + 1))
                        PROBLEMAS+=("$arch/$so_name: $align ($align_decimal bytes)")
                    fi
                else
                    echo "  ⚠️  $so_name: No se pudo determinar alineamiento"
                    NO_COMPATIBLE=$((NO_COMPATIBLE + 1))
                    PROBLEMAS+=("$arch/$so_name: No se pudo verificar")
                fi
            fi
        done
        echo ""
    fi
done

# Resumen
echo "=================================================="
echo "📊 RESUMEN"
echo "=================================================="
echo "Total de librerías verificadas: $TOTAL"
echo "✅ Compatibles con 16 KB: $COMPATIBLE"
echo "❌ NO compatibles con 16 KB: $NO_COMPATIBLE"
echo ""

if [ ${#PROBLEMAS[@]} -gt 0 ]; then
    echo "⚠️  LIBRERÍAS CON PROBLEMAS:"
    echo "----------------------------------------"
    for problema in "${PROBLEMAS[@]}"; do
        echo "  • $problema"
    done
    echo ""
    echo "💡 RECOMENDACIONES:"
    echo "  1. Actualizar las dependencias que generan estas librerías"
    echo "  2. Verificar si hay versiones más recientes disponibles"
    echo "  3. Contactar a los mantenedores si no hay actualizaciones"
    echo "  4. Considerar alternativas si el problema persiste"
else
    echo "✅ ¡Todas las librerías están correctamente alineadas para 16 KB!"
fi

# Limpiar
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Verificación completada"

