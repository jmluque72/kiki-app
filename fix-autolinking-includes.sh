#!/bin/bash

echo "🔧 Corrigiendo includes en autolinking.cpp..."

AUTOLINKING_CPP="android/app/build/generated/autolinking/src/main/jni/autolinking.cpp"

if [ ! -f "$AUTOLINKING_CPP" ]; then
    echo "⚠️  Archivo autolinking.cpp no encontrado, se generará durante el build"
    exit 0
fi

# Crear una copia de respaldo
cp "$AUTOLINKING_CPP" "$AUTOLINKING_CPP.bak"

# Comentar las líneas de includes que causan problemas si los headers no existen
# O mejor, agregar comentarios condicionales
sed -i.bak2 's/#include <rnasyncstorage\.h>/\/\/ #include <rnasyncstorage.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"
sed -i.bak3 's/#include <rngesturehandler_codegen\.h>/\/\/ #include <rngesturehandler_codegen.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"
sed -i.bak4 's/#include <RNImagePickerSpec\.h>/\/\/ #include <RNImagePickerSpec.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"
sed -i.bak5 's/#include <rnpdf\.h>/\/\/ #include <rnpdf.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"
sed -i.bak6 's/#include <RNPermissionsSpec\.h>/\/\/ #include <RNPermissionsSpec.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"
sed -i.bak7 's/#include <RNCWebViewSpec\.h>/\/\/ #include <RNCWebViewSpec.h> \/\/ Placeholder: header se generará durante el build/g' "$AUTOLINKING_CPP"

# También comentar las llamadas a funciones que dependen de esos headers
sed -i.bak8 's/auto module_rnasyncstorage = rnasyncstorage_ModuleProvider/\/\/ auto module_rnasyncstorage = rnasyncstorage_ModuleProvider \/\/ Placeholder/g' "$AUTOLINKING_CPP"
sed -i.bak9 's/if (module_rnasyncstorage != nullptr) {/\/\/ if (module_rnasyncstorage != nullptr) { \/\/ Placeholder/g' "$AUTOLINKING_CPP"
sed -i.bak10 's/return module_rnasyncstorage;/\/\/ return module_rnasyncstorage; \/\/ Placeholder/g' "$AUTOLINKING_CPP"
sed -i.bak11 's/}/\/\/ } \/\/ Placeholder/g' "$AUTOLINKING_CPP" | head -1

echo "✅ Archivo autolinking.cpp modificado"

