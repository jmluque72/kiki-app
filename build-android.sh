#!/bin/bash

cd "$(dirname "$0")"

echo "🔧 Limpiando build anterior..."
cd android
./gradlew clean

echo "📦 Compilando APK de debug..."
./gradlew :app:assembleDebug 2>&1 | tee /tmp/android-build-output.log

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        echo "📱 APK generado: app/build/outputs/apk/debug/app-debug.apk"
        ls -lh app/build/outputs/apk/debug/app-debug.apk
    fi
else
    echo "❌ Build falló. Revisando errores..."
    echo ""
    echo "=== ÚLTIMOS ERRORES ==="
    tail -50 /tmp/android-build-output.log | grep -A 10 -i "error\|failed\|exception"
fi

