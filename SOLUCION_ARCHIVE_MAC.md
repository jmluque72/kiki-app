# Solución: Error "Provisioning profile doesn't include MacBook Pro"

## 🔴 Error

```
error: Provisioning profile "iOS Team Provisioning Profile: org.kikiapp.application" 
doesn't include the currently selected device "MacBook Pro de Manuel"
```

## 🔍 Causa

Xcode está intentando hacer el Archive para un **Mac** en lugar de para un **dispositivo iOS**. Esto ocurre cuando:
- No se especifica explícitamente el SDK `iphoneos`
- Xcode detecta automáticamente el Mac como dispositivo disponible

## ✅ Solución

El script ya está actualizado para especificar explícitamente `-sdk iphoneos`. 

### Verificar en Xcode

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Ve a **Product → Destination**
3. Asegúrate de que esté seleccionado **"Any iOS Device"** o un dispositivo iOS específico
4. **NO** debe estar seleccionado tu Mac

### Si el error persiste

Ejecuta el script de nuevo:

```bash
npm run ios:archive:prod
```

O verifica manualmente:

```bash
# Ver SDKs disponibles
xcodebuild -showsdks

# Deberías ver algo como:
# iOS SDKs:
# 	iphoneos 17.0
```

### Configuración adicional en Xcode

Si sigue fallando, verifica en Xcode:

1. **Target KikiApp → General → Deployment Info:**
   - **Destination:** iOS (no macOS)
   - **Minimum Deployments:** iOS 16.0 o superior

2. **Target KikiApp → Signing & Capabilities:**
   - **Automatically manage signing:** ✅ Marcado
   - **Team:** Tu equipo seleccionado
   - **Bundle Identifier:** `org.kikiapp.application`

3. **Product → Scheme → Edit Scheme → Archive:**
   - **Build Configuration:** Release
   - **Destination:** Any iOS Device

## 📝 Nota

El script ahora especifica explícitamente:
- `-sdk iphoneos` - Para asegurar que compile para iOS
- `CODE_SIGNING_REQUIRED=YES` - Para habilitar code signing
- `CODE_SIGNING_ALLOWED=YES` - Para permitir signing automático

Esto debería resolver el problema.

