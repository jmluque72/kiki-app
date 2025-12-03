# 📋 Resumen: Configuración de Variables de Entorno

## ✅ Lo que ya está hecho

1. ✅ **`react-native-config` instalado** (con `--legacy-peer-deps`)
2. ✅ **`apiConfig.ts` actualizado** para usar `Config` de `react-native-config`
3. ✅ **`.gitignore` actualizado** para ignorar archivos `.env`

---

## 📝 Lo que TÚ debes hacer

### 1. Crear los archivos `.env` en la raíz de `KikiApp/`

Crea estos 3 archivos manualmente (no puedo crearlos porque están en `.gitignore`):

#### `.env.local`
```bash
API_ENV=local
API_BASE_URL_LOCAL=http://192.168.68.113:3000
```

#### `.env.uat`
```bash
API_ENV=uat
API_BASE_URL_UAT=https://uat-api.kiki.com.ar
```

#### `.env.prod`
```bash
API_ENV=prod
API_BASE_URL_PROD=https://api.kiki.com.ar
```

**Puedes agregar todas las variables que necesites en cada archivo:**
```bash
# Ejemplo con más variables
API_ENV=local
API_BASE_URL_LOCAL=http://192.168.68.113:3000
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
AWS_REGION=us-east-1
# ... etc
```

---

### 2. Instalar Pods en iOS (cuando puedas)

```bash
cd KikiApp/ios
pod install
cd ..
```

**Nota:** Si hay problemas de encoding, puedes hacerlo desde Xcode o más tarde.

---

### 3. Configurar Xcode (iOS)

#### Opción A: Usando Schemes (Recomendado)

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. `Product → Scheme → Edit Scheme...`
3. Selecciona `Run` → pestaña `Arguments`
4. En `Environment Variables`, agrega:
   - **Key:** `ENVFILE`
   - **Value:** `.env.local` (o `.env.uat` o `.env.prod`)

5. **Para tener múltiples entornos:**
   - `Product → Scheme → Manage Schemes...`
   - Duplica el scheme 3 veces:
     - `KikiApp-Local` → `ENVFILE = .env.local`
     - `KikiApp-UAT` → `ENVFILE = .env.uat`
     - `KikiApp-Prod` → `ENVFILE = .env.prod`

#### Opción B: Desde Terminal

```bash
cd KikiApp
ENVFILE=.env.local npx react-native run-ios
ENVFILE=.env.uat npx react-native run-ios
ENVFILE=.env.prod npx react-native run-ios
```

---

### 4. Configurar Android

#### Desde Terminal

```bash
# Local
cd KikiApp
ENVFILE=.env.local npx react-native run-android

# UAT
ENVFILE=.env.uat npx react-native run-android

# Prod
ENVFILE=.env.prod npx react-native run-android
```

O para builds:

```bash
cd KikiApp/android
ENVFILE=.env.local ./gradlew assembleDebug
ENVFILE=.env.uat ./gradlew assembleRelease
ENVFILE=.env.prod ./gradlew assembleRelease
```

#### Desde Android Studio

1. `Run → Edit Configurations...`
2. Selecciona tu configuración
3. En `Environment variables`, agrega:
   - `ENVFILE=.env.local` (o `.env.uat` o `.env.prod`)

---

## 🎯 Cómo funciona

1. **Solo configuras UNA variable** (`ENVFILE`) en Xcode/Gradle
2. **`react-native-config` lee el archivo `.env`** correspondiente
3. **Todas las variables** de ese `.env` están disponibles en tu código
4. **Usas `Config.VARIABLE_NAME`** en lugar de `process.env.VARIABLE_NAME`

---

## 💡 Ejemplo de uso en código

```typescript
import Config from 'react-native-config';

// Todas las variables del .env están disponibles
const apiUrl = Config.API_BASE_URL_LOCAL;
const cognitoPoolId = Config.COGNITO_USER_POOL_ID;
const cognitoClientId = Config.COGNITO_CLIENT_ID;
// ... etc
```

---

## ⚠️ Notas importantes

- **Después de cambiar un `.env`**, necesitas **rebuild completo** (no solo reload)
- **iOS:** `Product → Clean Build Folder` y rebuild
- **Android:** `./gradlew clean` y rebuild
- **Las variables se inyectan en tiempo de build**, no en runtime
- **Siempre define valores por defecto** en el código (usando `||`)

---

## 📚 Documentación completa

Ver `CONFIGURACION_ENV.md` para más detalles.

