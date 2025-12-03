# 🔐 Configurar Apple Distribution para Archive

## 📋 Situación Actual

En Xcode veo que estás usando:
- **Team:** Katter S.A.S
- **Signing Certificate:** Apple Development: Juan Cruz Praddaude

## ⚠️ Problema

Para hacer un **Archive para App Store**, necesitas usar:
- **Signing Certificate:** `Apple Distribution` (no "Apple Development")

## ✅ Solución

### Opción 1: Configurar en Xcode (Recomendado)

1. En Xcode, ve a **Target KikiApp → Signing & Capabilities**
2. Asegúrate de que **"Automatically manage signing"** esté marcado
3. Para **Release builds**, Xcode debería usar automáticamente "Apple Distribution"
4. Si no aparece, verifica:
   - Xcode → Preferences → Accounts
   - Selecciona "Katter S.A.S"
   - Haz clic en "Manage Certificates..."
   - Deberías ver "Apple Distribution" disponible
   - Si no está, haz clic en "+" → "Apple Distribution"

### Opción 2: El script ya está configurado

El script ahora especifica explícitamente:
```bash
CODE_SIGN_IDENTITY="Apple Distribution"
```

Esto fuerza el uso de "Apple Distribution" para el Archive, independientemente de la configuración en Xcode.

## 🔍 Verificar Certificados Disponibles

```bash
security find-identity -v -p codesigning | grep "Apple Distribution"
```

Deberías ver algo como:
```
Apple Distribution: Katter S.A.S (...)
```

## 📝 Nota

- **Apple Development:** Para desarrollo y testing
- **Apple Distribution:** Para Archive y subir a App Store

El script ahora fuerza el uso de "Apple Distribution" para asegurar que el Archive sea válido para App Store.

