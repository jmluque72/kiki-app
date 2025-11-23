# Librerías Externas que Pueden No Soportar Páginas de 16 KB

## Resumen
Este documento identifica las librerías nativas en el proyecto que pueden tener problemas de compatibilidad con páginas de memoria de 16 kB en Android.

## Librerías Nativas Identificadas en el Proyecto

Basado en el análisis del build, las siguientes librerías `.so` están presentes:

### Lista Completa de Librerías .so Encontradas:
- `libbarhopper_v3.so` - Barhopper (procesamiento de imágenes)
- `libc++_shared.so` - C++ Standard Library
- `libfbjni.so` - Facebook JNI (React Native)
- `libhermes.so` - Hermes JavaScript Engine
- `libhermestooling.so` - Hermes Tooling
- `libimage_processing_util_jni.so` - Procesamiento de imágenes
- `libimagepipeline.so` - Image Pipeline (Fresco)
- `libjsi.so` - JavaScript Interface (React Native)
- `libnative-filters.so` - Filtros nativos
- `libnative-imagetranscoder.so` - Transcodificación de imágenes
- `libpdfium.so` - PDFium (react-native-pdf) ⚠️
- `libpdfiumandroid.so` - PDFium Android (react-native-pdf) ⚠️
- `libreactnative.so` - React Native Core
- `librnscreens.so` - React Native Screens
- `libsurface_util_jni.so` - Utilidades de superficie

### Librerías de React Native Core
- `libjsi.so` - JavaScript Interface (React Native)
- `libfbjni.so` - Facebook JNI (React Native)
- `libhermestooling.so` - Hermes JavaScript Engine

### Librerías de Dependencias Nativas

#### 1. react-native-pdf (PDFium)
- **Librerías**: `libpdfium.so`, `libpdfiumandroid.so`
- **Riesgo**: ⚠️ **ALTO** - PDFium es una librería C++ compleja
- **Estado**: PDFium puede tener problemas con alineamiento de 16 kB si no está compilado correctamente
- **Versión actual**: `6.7.7`
- **Recomendación**: 
  - Verificar si la versión `7.0.3` tiene mejor soporte
  - Considerar actualizar si es posible

#### 2. react-native-video (ExoPlayer)
- **Librerías**: Depende de ExoPlayer (librería Java/Kotlin, pero puede usar código nativo)
- **Riesgo**: ⚠️ **MEDIO** - ExoPlayer generalmente está bien, pero depende de la versión
- **Estado**: ExoPlayer moderno debería soportar 16 kB
- **Versión actual**: `6.16.1`
- **Recomendación**: 
  - Verificar que ExoPlayer esté actualizado
  - La versión actual debería estar bien

#### 3. react-native-camera-kit
- **Librerías**: Puede incluir código nativo para procesamiento de imágenes
- **Riesgo**: ⚠️ **MEDIO** - Depende de las dependencias nativas que use
- **Versión actual**: `16.0.1`
- **Recomendación**: 
  - Actualizar a `16.1.3` (versión más reciente)
  - Verificar changelog para soporte de 16 kB

#### 4. react-native-image-picker
- **Librerías**: Puede usar código nativo para procesamiento
- **Riesgo**: ⚠️ **BAJO-MEDIO**
- **Versión actual**: `8.2.1`
- **Recomendación**: Ya está en la versión más reciente

#### 5. react-native-image-resizer
- **Librerías**: Usa código nativo para redimensionamiento de imágenes
- **Riesgo**: ⚠️ **MEDIO** - Procesamiento de imágenes puede tener problemas
- **Versión actual**: `1.4.5`
- **Recomendación**: Verificar si hay actualizaciones disponibles

#### 6. react-native-gesture-handler
- **Librerías**: Puede incluir código nativo para gestos
- **Riesgo**: ⚠️ **BAJO** - Generalmente bien mantenido
- **Versión actual**: `2.28.0` (instalada: `2.29.1`)
- **Recomendación**: Ya está actualizada

#### 7. @aws-amplify/react-native
- **Librerías**: Puede incluir código nativo para crypto/autenticación
- **Riesgo**: ⚠️ **MEDIO** - Depende de las dependencias nativas de AWS
- **Versión actual**: `1.2.0`
- **Recomendación**: Verificar actualizaciones de AWS SDK

## Librerías con Mayor Riesgo

### 🔴 Alto Riesgo

1. **react-native-pdf (PDFium)**
   - PDFium es una librería C++ compleja y grande
   - Puede tener problemas de alineamiento si no está compilado para 16 kB
   - **Acción**: Verificar alineamiento de `libpdfium.so` y `libpdfiumandroid.so`

### 🟡 Riesgo Medio

2. **react-native-image-resizer**
   - Procesamiento de imágenes puede requerir alineamiento específico
   - **Acción**: Verificar si hay actualizaciones

3. **react-native-camera-kit**
   - Procesamiento de imágenes y cámara
   - **Acción**: Actualizar a `16.1.3`

4. **@aws-amplify/react-native**
   - Depende de librerías nativas de AWS
   - **Acción**: Verificar actualizaciones

## Cómo Verificar el Alineamiento

### Método 1: Usar readelf (Linux/Mac)
```bash
# Verificar alineamiento de una librería .so
readelf -l libpdfium.so | grep LOAD
# Buscar: Align = 0x4000 (16 kB = 16384 = 0x4000)
```

### Método 2: Usar APK Analyzer
1. Abrir Android Studio
2. Build > Analyze APK
3. Seleccionar el APK/AAB
4. Navegar a `lib/` y verificar las librerías `.so`
5. Verificar el alineamiento de cada librería

### Método 3: Script de Verificación
```bash
# Verificar todas las librerías .so en el APK
unzip -l app-release.apk | grep "\.so$"
```

## Soluciones Recomendadas

### 1. Actualizar Dependencias
```bash
# Actualizar react-native-camera-kit
npm install react-native-camera-kit@16.1.3

# Verificar react-native-pdf (cuidado con cambio mayor)
# npm install react-native-pdf@7.0.3  # Solo si es necesario
```

### 2. Verificar Alineamiento Manual
Si el problema persiste después de actualizar:
1. Extraer el APK/AAB
2. Verificar el alineamiento de cada `.so`
3. Identificar qué librería específica tiene el problema
4. Contactar al mantenedor de esa librería si es necesario

### 3. Usar AAB en lugar de APK
El Android App Bundle (AAB) permite que Google Play optimice el alineamiento:
```bash
cd android && ./gradlew bundleRelease
```

### 4. Forzar Recompilación
Asegurar que todas las librerías se recompilen con el NDK correcto:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## Dependencias de Terceros Problemáticas Conocidas

### Librerías que Históricamente Han Tenido Problemas:

1. **PDFium** (usado por react-native-pdf) 🔴 **ALTO RIESGO**
   - Librería C++ grande y compleja
   - Puede requerir recompilación específica
   - **Librerías en el proyecto**: `libpdfium.so`, `libpdfiumandroid.so`

2. **React Native Core** (libjsi.so, libreactnative.so, libhermes.so)
   - Versiones antiguas de React Native han tenido problemas
   - **Estado**: React Native 0.80 debería estar bien, pero verificar
   - **Librerías en el proyecto**: `libjsi.so`, `libreactnative.so`, `libhermes.so`

3. **Image Processing Libraries**
   - Procesamiento de imágenes puede tener problemas de alineamiento
   - **Librerías en el proyecto**: 
     - `libimage_processing_util_jni.so`
     - `libimagepipeline.so` (Fresco)
     - `libnative-imagetranscoder.so`
     - `libbarhopper_v3.so`

4. **Fresco (Image Pipeline)**
   - Usado para carga de imágenes
   - **Librería en el proyecto**: `libimagepipeline.so`
   - Generalmente bien mantenido, pero verificar

5. **React Native Screens**
   - **Librería en el proyecto**: `librnscreens.so`
   - Debería estar bien en versiones recientes

## Próximos Pasos

1. ✅ Actualizar `react-native-camera-kit` a `16.1.3`
2. ⚠️ **PRIORITARIO**: Verificar alineamiento de `libpdfium.so` y `libpdfiumandroid.so`
3. ⚠️ Verificar si `react-native-pdf` necesita actualización a `7.0.3`
4. ⚠️ Verificar librerías de procesamiento de imágenes:
   - `libimage_processing_util_jni.so`
   - `libimagepipeline.so`
   - `libnative-imagetranscoder.so`
   - `libbarhopper_v3.so`
5. 🔍 Generar un AAB y verificar si el problema persiste
6. 🔍 Si persiste, usar `readelf` para verificar el alineamiento de cada `.so`:
   ```bash
   # Extraer APK
   unzip app-release.apk -d apk_extracted
   
   # Verificar cada librería
   readelf -l apk_extracted/lib/armeabi-v7a/libpdfium.so | grep LOAD
   # Buscar: Align = 0x4000 (16 kB)
   ```

## Script de Verificación Rápida

```bash
#!/bin/bash
# Verificar alineamiento de todas las librerías .so

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
TEMP_DIR=$(mktemp -d)

echo "📦 Extrayendo APK..."
unzip -q "$APK_PATH" -d "$TEMP_DIR"

echo "🔍 Verificando alineamiento de librerías .so..."
for so_file in $(find "$TEMP_DIR/lib" -name "*.so"); do
    align=$(readelf -l "$so_file" 2>/dev/null | grep -A 1 "LOAD" | grep "Align" | awk '{print $NF}')
    if [ -n "$align" ]; then
        if [ "$align" = "0x4000" ] || [ "$align" = "16384" ]; then
            echo "✅ $(basename $so_file): Alineado a 16 KB"
        else
            echo "❌ $(basename $so_file): Alineado a $align (NO es 16 KB)"
        fi
    fi
done

rm -rf "$TEMP_DIR"
```

## Nota Importante

El problema de 16 kB puede no ser de una librería específica, sino de cómo se empaquetan todas las librerías juntas. El Android Gradle Plugin 8.5.1+ debería manejar esto automáticamente, pero si alguna librería está precompilada con alineamiento incorrecto, puede causar problemas.

