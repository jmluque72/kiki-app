# 🚀 Builds de Producción para Publicar en Tiendas

## 📱 iOS - Archive para App Store

### Scripts disponibles:

```bash
# UAT
npm run ios:archive:uat

# Producción
npm run ios:archive:prod
```

### ¿Qué hace?

1. **Limpia** el build anterior
2. **Crea el Archive** con el entorno correspondiente (`.env.uat` o `.env.prod`)
3. **Exporta el IPA** listo para subir a App Store Connect

### Archivos generados:

- **Archive:** `ios/build/KikiApp-UAT.xcarchive` o `ios/build/KikiApp-Prod.xcarchive`
- **IPA:** `ios/build/UAT/KikiApp.ipa` o `ios/build/Prod/KikiApp.ipa`

### Configuración necesaria:

1. **Actualizar `ios/ExportOptions.plist`:**
   - Cambiar `YOUR_TEAM_ID` por tu Team ID real
   - Puedes encontrarlo en Xcode → Preferences → Accounts → Tu cuenta → Team ID

2. **Verificar Code Signing:**
   - En Xcode, asegúrate de tener configurado:
     - **Signing Certificate** (Apple Distribution)
     - **Provisioning Profile** (App Store)
   - O usa **"Automatically manage signing"**

### Comandos manuales (si prefieres más control):

```bash
# 1. Limpiar
ENVFILE=.env.prod xcodebuild clean \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp

# 2. Crear Archive
ENVFILE=.env.prod xcodebuild \
  -workspace ios/KikiApp.xcworkspace \
  -scheme KikiApp \
  -configuration Release \
  -archivePath ios/build/KikiApp-Prod.xcarchive \
  archive

# 3. Exportar IPA
xcodebuild -exportArchive \
  -archivePath ios/build/KikiApp-Prod.xcarchive \
  -exportPath ios/build/Prod \
  -exportOptionsPlist ios/ExportOptions.plist
```

---

## 🤖 Android - Bundle (AAB) para Google Play

### Scripts disponibles:

```bash
# UAT
npm run android:bundle:uat

# Producción
npm run android:bundle:prod
```

### ¿Qué hace?

1. **Limpia** el build anterior
2. **Genera el Bundle (AAB)** con el entorno correspondiente
3. **Firma** el bundle con tu keystore (si está configurado)

### Archivos generados:

- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

### Configuración necesaria:

1. **Keystore para firmar:**
   - Asegúrate de tener configurado el `signingConfig` en `android/app/build.gradle`
   - O crea uno si no lo tienes:

```gradle
// En android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/your/keystore.jks')
            storePassword 'your-store-password'
            keyAlias 'your-key-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...
        }
    }
}
```

2. **Variables de entorno en Gradle:**
   - El `ENVFILE` se pasa al proceso de build
   - `react-native-config` lo leerá automáticamente

### Comandos manuales:

```bash
# UAT
cd android
ENVFILE=../.env.uat ./gradlew clean bundleRelease

# Producción
cd android
ENVFILE=../.env.prod ./gradlew clean bundleRelease
```

---

## 🔄 Build Combinado (iOS + Android)

### Scripts disponibles:

```bash
# Build UAT para ambas plataformas
npm run build:uat

# Build Producción para ambas plataformas
npm run build:prod
```

### ¿Qué hace?

1. Ejecuta el build de iOS (Archive + IPA)
2. Ejecuta el build de Android (Bundle AAB)
3. Genera ambos archivos listos para subir a las tiendas

---

## 📋 Checklist antes de publicar

### iOS:
- [ ] Team ID configurado en `ExportOptions.plist`
- [ ] Code signing configurado correctamente
- [ ] Version y Build number actualizados en Xcode
- [ ] App Store Connect configurado
- [ ] Screenshots y metadata listos

### Android:
- [ ] Keystore configurado y seguro
- [ ] Version code y version name actualizados en `build.gradle`
- [ ] Google Play Console configurado
- [ ] Screenshots y metadata listos

---

## 📍 Ubicación de los archivos generados

### iOS:
- **Archive:** `ios/build/KikiApp-Prod.xcarchive`
- **IPA:** `ios/build/Prod/KikiApp.ipa`

### Android:
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **APK (si lo necesitas):** `android/app/build/outputs/apk/release/app-release.apk`

---

## ⚠️ Notas importantes

1. **Primera vez:** Necesitas configurar:
   - Team ID en `ExportOptions.plist` (iOS)
   - Keystore en `build.gradle` (Android)

2. **Variables de entorno:** Los builds usan automáticamente:
   - `.env.uat` para builds UAT
   - `.env.prod` para builds de producción

3. **Limpieza:** Los scripts hacen `clean` automáticamente, pero si tienes problemas:
   ```bash
   # iOS
   cd ios && rm -rf build DerivedData
   
   # Android
   cd android && ./gradlew clean
   ```

4. **Tiempo de build:** Los builds de producción pueden tardar varios minutos, especialmente el primer build.

---

## 🐛 Troubleshooting

### iOS: "No signing certificate found"
- Verifica que tengas un certificado válido en Keychain
- O habilita "Automatically manage signing" en Xcode

### iOS: "Export failed"
- Verifica que `ExportOptions.plist` tenga el Team ID correcto
- Revisa los logs en Xcode → Window → Organizer

### Android: "Keystore not found"
- Verifica la ruta del keystore en `build.gradle`
- Asegúrate de que el archivo existe

### Android: "ENVFILE not found"
- Verifica que los archivos `.env.uat` y `.env.prod` existan en la raíz del proyecto

