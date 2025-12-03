# 🔐 Información de Code Signing Actual

## 📋 Configuración Detectada

### Team ID:
- **DEVELOPMENT_TEAM:** `6MQ93QHPC3`

### Certificados Disponibles:
1. ✅ **Apple Development: Manuel Luque (Y5VL93VA9S)**
2. ✅ **Apple Development: Manuel Luque (JYW22S2PE4)**
3. ✅ **Apple Development: Juan Cruz Praddaude (6NU47QQCK2)**
4. ✅ **Apple Distribution: ITLGLABS S.A.S. (BUSJY324YY)** ⭐ Para Archive

### Configuración Actual del Proyecto:
- **CODE_SIGN_IDENTITY:** `iPhone Developer` (para Debug)
- **Para Archive/Release:** Debería usar `Apple Distribution`

## ⚠️ Problema Detectado

El proyecto está configurado para usar `iPhone Developer` pero para hacer un **Archive para App Store** necesita usar **`Apple Distribution`**.

## ✅ Solución

### Opción 1: Configurar en Xcode (Recomendado)

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Selecciona el proyecto **KikiApp** → Target **KikiApp**
3. Ve a **"Signing & Capabilities"**
4. Asegúrate de que:
   - ✅ **"Automatically manage signing"** esté marcado
   - **Team:** Debe estar seleccionado (Team ID: `6MQ93QHPC3`)
   - Para **Release builds**, Xcode debería usar automáticamente "Apple Distribution"

5. Si no aparece "Apple Distribution", verifica:
   - Xcode → Preferences → Accounts
   - Selecciona tu cuenta → Haz clic en "Manage Certificates..."
   - Deberías ver "Apple Distribution: ITLGLABS S.A.S. (BUSJY324YY)"
   - Si no está, haz clic en "+" → "Apple Distribution"

### Opción 2: Verificar que el certificado esté en Keychain

```bash
# Ver certificados de distribución
security find-identity -v -p codesigning | grep "Apple Distribution"
```

Deberías ver:
```
Apple Distribution: ITLGLABS S.A.S. (BUSJY324YY)
```

### Opción 3: Especificar en el script (si es necesario)

Si Xcode no detecta automáticamente el certificado correcto, puedes especificarlo en el script:

```bash
CODE_SIGN_IDENTITY="Apple Distribution"
DEVELOPMENT_TEAM="6MQ93QHPC3"
```

Pero es mejor dejar que Xcode lo maneje automáticamente.

## 🔍 Verificar qué está usando

Después de configurar en Xcode, verifica:

```bash
cd ios
xcodebuild -showBuildSettings \
  -workspace KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release | grep CODE_SIGN_IDENTITY
```

Para Release, debería mostrar algo como:
```
CODE_SIGN_IDENTITY = Apple Distribution
```

## 📝 Nota

El script ya está corregido y **NO** especifica `CODE_SIGN_IDENTITY=""`, por lo que usará la configuración de Xcode. Asegúrate de que en Xcode esté configurado correctamente para usar "Apple Distribution" en Release builds.

