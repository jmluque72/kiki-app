# Cómo Android lee el archivo .env en `./gradlew assembleRelease`

## 📋 Resumen

Cuando ejecutas `./gradlew assembleRelease` en Android, `react-native-config` busca el archivo `.env` de la siguiente manera:

### 1. **Variable de Entorno `ENVFILE` (Prioridad Alta)**

Si especificas la variable `ENVFILE` antes del comando:

```bash
cd KikiApp/android
ENVFILE=.env.prod ./gradlew assembleRelease
```

React Native Config leerá el archivo especificado (`.env.prod` en este caso).

### 2. **Archivo `.env` por Defecto (Si no hay ENVFILE)**

Si **NO** especificas `ENVFILE`, `react-native-config` busca automáticamente:

- **Ubicación**: `KikiApp/.env` (raíz del proyecto React Native, NO en `android/`)
- **Ruta relativa desde `android/`**: `../.env`

### 3. **Cómo funciona internamente**

`react-native-config` en Android:

1. Lee la variable de entorno `ENVFILE` si existe
2. Si no existe, usa `.env` como valor por defecto
3. Busca el archivo en la raíz del proyecto React Native (`KikiApp/`)
4. Genera un archivo `BuildConfig.java` con las variables del `.env`
5. Las variables están disponibles en el código Java/Kotlin como `BuildConfig.VARIABLE_NAME`

## 🔍 Verificación

### Ver qué archivo está usando:

```bash
cd KikiApp/android

# Verificar si existe .env por defecto
ls -la ../.env

# Verificar archivos .env disponibles
ls -la ../.env*

# Build con archivo específico
ENVFILE=.env.prod ./gradlew assembleRelease

# Build sin especificar (usa .env por defecto)
./gradlew assembleRelease
```

### Ver las variables generadas:

Después del build, puedes ver las variables generadas en:

```
android/app/build/generated/source/buildConfig/release/com/kikiapp/katter/BuildConfig.java
```

## ⚠️ Importante

1. **El archivo `.env` debe estar en la raíz del proyecto React Native** (`KikiApp/`), NO en `android/`
2. **Si no especificas `ENVFILE`**, se usa `.env` por defecto
3. **Si especificas `ENVFILE=.env.prod`**, se usa ese archivo específico
4. **Después de cambiar un `.env`**, necesitas hacer `./gradlew clean` y rebuild

## 📝 Ejemplo de Uso

```bash
# Build de producción con .env.prod
cd KikiApp/android
ENVFILE=.env.prod ./gradlew assembleRelease

# Build de UAT con .env.uat
ENVFILE=.env.uat ./gradlew assembleRelease

# Build usando .env por defecto (si existe)
./gradlew assembleRelease
```

## 🔧 Configuración Recomendada

Para evitar confusiones, es recomendable:

1. **Siempre especificar `ENVFILE`** explícitamente en los builds de release
2. **No tener un archivo `.env` por defecto** si usas múltiples entornos (`.env.local`, `.env.uat`, `.env.prod`)
3. **Usar scripts de build** que especifiquen el `ENVFILE` correcto

### Script de ejemplo (`build-release-prod.sh`):

```bash
#!/bin/bash
cd "$(dirname "$0")/android"
ENVFILE=../.env.prod ./gradlew assembleRelease
```

