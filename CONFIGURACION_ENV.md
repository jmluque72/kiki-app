# Configuración de Variables de Entorno con react-native-config

## Resumen de la Solución

Usamos **`react-native-config`** para manejar múltiples variables de entorno desde archivos `.env` separados. Solo necesitas configurar **una variable** (`ENVFILE`) en Xcode/Gradle para elegir qué archivo `.env` usar.

---

## 1. Instalación

```bash
cd KikiApp
npm install react-native-config --save
```

### iOS - Instalar Pods

```bash
cd ios
pod install
cd ..
```

---

## 2. Crear Archivos `.env`

Crea estos 3 archivos en la raíz de `KikiApp/`:

### `.env.local`
```bash
API_ENV=local
API_BASE_URL_LOCAL=http://192.168.68.113:3000
# Agrega aquí todas las variables que necesites para local
# EJEMPLO:
# COGNITO_USER_POOL_ID=us-east-1_xxxxx
# COGNITO_CLIENT_ID=xxxxx
# AWS_REGION=us-east-1
```

### `.env.uat`
```bash
API_ENV=uat
API_BASE_URL_UAT=https://uat-api.kiki.com.ar
# Agrega aquí todas las variables que necesites para UAT
# EJEMPLO:
# COGNITO_USER_POOL_ID=us-east-1_yyyyy
# COGNITO_CLIENT_ID=yyyyy
# AWS_REGION=us-east-1
```

### `.env.prod`
```bash
API_ENV=prod
API_BASE_URL_PROD=https://api.kiki.com.ar
# Agrega aquí todas las variables que necesites para producción
# EJEMPLO:
# COGNITO_USER_POOL_ID=us-east-1_zzzzz
# COGNITO_CLIENT_ID=zzzzz
# AWS_REGION=us-east-1
```

---

## 3. Modificar `apiConfig.ts`

Cambiar `process.env` por `Config` de `react-native-config`:

```typescript
import { Platform } from 'react-native';
import Config from 'react-native-config';

type ApiEnv = 'local' | 'uat' | 'prod';

const API_ENV: ApiEnv = (Config.API_ENV as ApiEnv) || 'local';

const API_BASE_URL_LOCAL = Config.API_BASE_URL_LOCAL || 'http://192.168.68.113:3000';
const API_BASE_URL_UAT = Config.API_BASE_URL_UAT || 'https://uat-api.kiki.com.ar';
const API_BASE_URL_PROD = Config.API_BASE_URL_PROD || 'https://api.kiki.com.ar';

const API_BASE_URLS: Record<ApiEnv, string> = {
  local: API_BASE_URL_LOCAL,
  uat: API_BASE_URL_UAT,
  prod: API_BASE_URL_PROD,
};

export const getApiBaseUrl = () => {
  return API_BASE_URLS[API_ENV];
};
```

**Para usar cualquier otra variable:**
```typescript
const COGNITO_USER_POOL_ID = Config.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = Config.COGNITO_CLIENT_ID;
```

---

## 4. Configuración en Xcode (iOS)

### Opción A: Usando Schemes (Recomendado)

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Ve a `Product → Scheme → Edit Scheme...`
3. Selecciona `Run` en el panel izquierdo
4. Ve a la pestaña `Arguments`
5. En `Environment Variables`, agrega:
   - **Key:** `ENVFILE`
   - **Value:** `.env.local` (o `.env.uat` o `.env.prod`)

6. **Crear múltiples Schemes:**
   - `Product → Scheme → Manage Schemes...`
   - Duplica el scheme base 3 veces:
     - `KikiApp-Local` → `ENVFILE = .env.local`
     - `KikiApp-UAT` → `ENVFILE = .env.uat`
     - `KikiApp-Prod` → `ENVFILE = .env.prod`

### Opción B: Desde Terminal

```bash
cd KikiApp
ENVFILE=.env.local npx react-native run-ios
ENVFILE=.env.uat npx react-native run-ios
ENVFILE=.env.prod npx react-native run-ios
```

---

## 5. Configuración en Android (Gradle)

### Opción A: Desde Terminal

```bash
# Local
cd KikiApp/android
ENVFILE=.env.local ./gradlew assembleDebug

# UAT
ENVFILE=.env.uat ./gradlew assembleRelease

# Prod
ENVFILE=.env.prod ./gradlew assembleRelease
```

O con React Native CLI:

```bash
cd KikiApp
ENVFILE=.env.local npx react-native run-android
ENVFILE=.env.uat npx react-native run-android
ENVFILE=.env.prod npx react-native run-android
```

### Opción B: Desde Android Studio

1. Abre el proyecto en Android Studio
2. Ve a `Run → Edit Configurations...`
3. Selecciona tu configuración (ej: `app`)
4. En `Environment variables`, agrega:
   - `ENVFILE=.env.local` (o `.env.uat` o `.env.prod`)
5. Crea configuraciones separadas para cada entorno

---

## 6. Agregar `.env*` al `.gitignore`

**IMPORTANTE:** Agrega los archivos `.env` al `.gitignore` si contienen información sensible:

```bash
# .gitignore
.env.local
.env.uat
.env.prod
```

O crea archivos `.env.example` con valores de ejemplo (sin datos reales) para que otros desarrolladores sepan qué variables necesitan.

---

## 7. Ventajas de esta Solución

✅ **Una sola variable** (`ENVFILE`) para elegir el entorno  
✅ **Múltiples variables** en cada `.env` sin tocar Xcode/Gradle  
✅ **Fácil de mantener** - todo centralizado en archivos `.env`  
✅ **Escalable** - agrega las variables que necesites sin límite  
✅ **Funciona en CI/CD** - solo cambia `ENVFILE` en el pipeline  

---

## 8. Ejemplo de Uso Completo

### En tu código:

```typescript
import Config from 'react-native-config';

// Todas las variables están disponibles
const apiUrl = Config.API_BASE_URL_LOCAL;
const cognitoPoolId = Config.COGNITO_USER_POOL_ID;
const cognitoClientId = Config.COGNITO_CLIENT_ID;
const awsRegion = Config.AWS_REGION;
// ... etc
```

### Para buildear:

**iOS:**
```bash
# Solo cambias ENVFILE
ENVFILE=.env.local xcodebuild ...
ENVFILE=.env.uat xcodebuild ...
ENVFILE=.env.prod xcodebuild ...
```

**Android:**
```bash
# Solo cambias ENVFILE
ENVFILE=.env.local ./gradlew assembleDebug
ENVFILE=.env.uat ./gradlew assembleRelease
ENVFILE=.env.prod ./gradlew assembleRelease
```

---

## Notas Importantes

⚠️ **Después de cambiar `.env`**, necesitas:
- **iOS:** Rebuild completo (`Product → Clean Build Folder` y rebuild)
- **Android:** Rebuild completo (`./gradlew clean` y rebuild)

⚠️ **Las variables se inyectan en tiempo de build**, no en runtime. Si cambias un `.env`, debes rebuildear.

⚠️ **Valores por defecto:** Siempre define valores por defecto en el código (usando `||`) por si falta alguna variable.

