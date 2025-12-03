# 🔐 Configuración: Apple Distribution: Katter S.A.S

## ✅ Cambios Realizados

1. **Script actualizado** para usar: `CODE_SIGN_IDENTITY="Apple Distribution: Katter S.A.S"`
2. **ExportOptions.plist actualizado** con Team ID: `6MQ93QHPC3`

## ⚠️ Verificación Necesaria

El certificado "Apple Distribution: Katter S.A.S" no se encontró en el sistema. Verifica:

### Opción 1: El certificado existe con nombre diferente

Ejecuta para ver todos los certificados:
```bash
security find-identity -v -p codesigning
```

Busca uno que diga "Katter" o que corresponda al Team ID `6MQ93QHPC3`.

### Opción 2: Crear/Instalar el certificado

1. Abre Xcode → Preferences → Accounts
2. Selecciona la cuenta de "Katter S.A.S"
3. Haz clic en "Manage Certificates..."
4. Si no ves "Apple Distribution", haz clic en "+" → "Apple Distribution"
5. Xcode creará el certificado automáticamente

### Opción 3: El script usará el certificado correcto automáticamente

Si el certificado exacto no existe, Xcode puede usar el certificado de distribución que corresponda al Team ID `6MQ93QHPC3` cuando uses `CODE_SIGN_IDENTITY="Apple Distribution"` (sin el nombre específico).

## 🔍 Verificar qué certificado se usará

Después de ejecutar el script, revisa el log:
```bash
npm run ios:archive:prod 2>&1 | grep -i "sign\|certificate"
```

O verifica en Xcode:
- Target KikiApp → Signing & Capabilities
- Para Release, debería mostrar el certificado que se usará

## 📝 Nota

El script ahora especifica `"Apple Distribution: Katter S.A.S"` pero si ese certificado exacto no existe, puedes:

1. **Cambiar a solo "Apple Distribution"** - Xcode elegirá el correcto según el Team
2. **O instalar el certificado específico** desde Xcode

¿Quieres que cambie el script para usar solo "Apple Distribution" y dejar que Xcode elija automáticamente según el Team?

