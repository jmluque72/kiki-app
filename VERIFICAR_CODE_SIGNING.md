# 🔐 Verificar Code Signing para Archive

## 🔍 Cómo verificar qué certificado/team está usando

### Opción 1: Desde Xcode (Recomendado)

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Selecciona el proyecto **KikiApp** en el navegador izquierdo
3. Selecciona el target **KikiApp**
4. Ve a la pestaña **"Signing & Capabilities"**
5. Verás:
   - **Team:** El nombre de tu equipo/cuenta
   - **Signing Certificate:** "Apple Distribution" o "Apple Development"
   - **Provisioning Profile:** El perfil que está usando

### Opción 2: Desde línea de comandos

```bash
# Ver certificados disponibles
security find-identity -v -p codesigning

# Ver configuración del proyecto
cd ios
xcodebuild -showBuildSettings -workspace KikiApp.xcworkspace -scheme KikiApp | grep -i "CODE_SIGN\|DEVELOPMENT_TEAM\|PROVISIONING"
```

### Opción 3: Ver en el proyecto

```bash
# Ver configuración en el proyecto Xcode
grep -r "DEVELOPMENT_TEAM" ios/KikiApp.xcodeproj/project.pbxproj
grep -r "CODE_SIGN" ios/KikiApp.xcodeproj/project.pbxproj
```

## ✅ Configuración correcta para Archive

Para hacer un Archive para App Store, necesitas:

1. **Team configurado:**
   - En Xcode → Signing & Capabilities → Team
   - Debe estar seleccionado tu equipo

2. **Signing Certificate:**
   - Para **Release/Archive:** "Apple Distribution"
   - Para **Debug:** "Apple Development"

3. **Automatically manage signing:**
   - Debe estar **marcado** ✅
   - Xcode generará automáticamente el provisioning profile

4. **Bundle Identifier:**
   - Debe coincidir con el que está en App Store Connect
   - En tu caso: `org.kikiapp.application`

## 🔧 Si no tienes certificado configurado

### Crear certificado automáticamente (Recomendado):

1. En Xcode → Preferences → Accounts
2. Agrega tu Apple ID
3. Selecciona tu cuenta → Haz clic en "Manage Certificates..."
4. Haz clic en "+" → "Apple Distribution"
5. Xcode creará el certificado automáticamente

### O desde línea de comandos:

```bash
# Ver qué cuentas tienes configuradas
xcrun altool --list-providers -u "tu-email@example.com" -p "app-specific-password"
```

## 📝 Actualizar el script para usar un certificado específico

Si quieres especificar un certificado en el script, puedes hacerlo así:

```bash
# En el script, agrega:
CODE_SIGN_IDENTITY="Apple Distribution"
DEVELOPMENT_TEAM="TU_TEAM_ID"
```

Pero es mejor dejar que Xcode use el code signing automático configurado en el proyecto.

## ⚠️ Nota importante

El script ahora **NO** especifica `CODE_SIGN_IDENTITY=""`, lo que significa que usará la configuración de Xcode. Esto es lo correcto para Archive.

Si necesitas verificar qué está usando, ejecuta:

```bash
cd ios
xcodebuild -showBuildSettings \
  -workspace KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release | grep -i "CODE_SIGN\|TEAM"
```

