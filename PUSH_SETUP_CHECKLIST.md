# Checklist de Configuración de Push Notifications

## 📱 Configuración de la App Móvil

### ✅ Código (Ya implementado)
- [x] Servicios de push notifications implementados
- [x] Hook `usePushNotifications` implementado
- [x] Componente de preferencias implementado
- [x] Integración con API backend

### 🔧 Cambios Necesarios en el Código

1. **App.tsx** - ✅ DESHABILITADO → ✅ HABILITADO
   - [x] Descomentar import del hook
   - [x] Descomentar uso del hook
   - [x] Agregar logs de debug

2. **usePushNotifications.ts** - ✅ COMPLETADO
   - [x] Agregar método `requestPermissions()`
   - [x] Agregar método `sendTestNotification()`

## 🔐 Configuración iOS (APNs)

### Requisitos:
1. **Apple Developer Account:**
   - [ ] Certificado APNs configurado
   - [ ] Key ID de APNs
   - [ ] Team ID de Apple Developer
   - [ ] Bundle ID de la app (`com.kiki.app` o similar)

2. **Archivo de Certificado:**
   - [ ] Archivo `.p8` descargado de Apple Developer
   - [ ] Guardado en el servidor (ruta segura)

3. **Variables de Entorno (.env):**
   ```env
   APNS_KEY_PATH=/ruta/al/AuthKey_XXXXXXXXXX.p8
   APNS_KEY_ID=XXXXXXXXXX
   APNS_TEAM_ID=XXXXXXXXXX
   APNS_BUNDLE_ID=com.kiki.app
   ```

4. **Info.plist (iOS):**
   - [ ] Verificar permisos de notificaciones
   - [ ] Verificar configuración de background modes

## 🤖 Configuración Android (FCM)

### Requisitos:
1. **Firebase Project:**
   - [ ] Proyecto Firebase creado
   - [ ] App Android agregada al proyecto
   - [ ] `google-services.json` descargado

2. **Archivo de Configuración:**
   - [ ] `google-services.json` en `android/app/`
   - [ ] Verificar que el build.gradle incluya el plugin

3. **Server Key:**
   - [ ] Obtener Server Key de Firebase Console
   - [ ] Agregar a variables de entorno

4. **Variables de Entorno (.env):**
   ```env
   FCM_SERVER_KEY=YOUR_FCM_SERVER_KEY_AQUI
   ```

5. **AndroidManifest.xml:**
   - [ ] Verificar permisos de notificaciones
   - [ ] Verificar configuración de servicios

## 🖥️ Configuración del Backend

### Variables de Entorno Necesarias:

```env
# iOS (APNs)
APNS_KEY_PATH=/ruta/al/certificado.p8
APNS_KEY_ID=XXXXXXXXXX
APNS_TEAM_ID=XXXXXXXXXX
APNS_BUNDLE_ID=com.kiki.app

# Android (FCM)
FCM_SERVER_KEY=YOUR_FCM_SERVER_KEY

# Entorno
NODE_ENV=production
```

### Dependencias del Backend:

Verificar que estén instaladas:
- [ ] `apn` - Para iOS
- [ ] (FCM usa HTTPS nativo, no requiere dependencia adicional)

## 🧪 Testing

### Flujo de Prueba:

1. **Registro de Token:**
   - [ ] Login en la app
   - [ ] Verificar que se solicite permiso de notificaciones
   - [ ] Verificar que el token se registre en MongoDB (colección `devices`)
   - [ ] Verificar logs del servidor: `🔔 [PUSH REGISTER] Token registrado exitosamente`

2. **Envío de Notificación:**
   - [ ] Crear notificación desde el backoffice
   - [ ] Verificar que se envíe push notification
   - [ ] Verificar recepción en la app (foreground)
   - [ ] Verificar recepción en la app (background)
   - [ ] Verificar recepción en la app (cerrada)

3. **Manejo de Notificaciones:**
   - [ ] Click en notificación abre la app
   - [ ] Navegación correcta desde notificación
   - [ ] Badge se actualiza correctamente

## 📋 Archivos a Verificar

### iOS:
- `ios/KikiApp/Info.plist` - Permisos
- `ios/KikiApp/AppDelegate.m` o `.swift` - Configuración de notificaciones
- Certificados en Apple Developer Portal

### Android:
- `android/app/google-services.json` - Configuración FCM
- `android/app/build.gradle` - Plugin de Google Services
- `android/app/src/main/AndroidManifest.xml` - Permisos

### Backend:
- `.env` - Variables de entorno
- `api/pushNotificationService.js` - Servicio de envío
- Certificado APNs en servidor (ruta segura)

## 🚨 Problemas Comunes

### Token no se registra:
- Verificar que el usuario esté autenticado
- Verificar logs del servidor
- Verificar que el endpoint `/push/register-token` funcione

### Notificaciones no llegan (iOS):
- Verificar certificados APNs
- Verificar que el token sea válido
- Verificar que el bundle ID coincida

### Notificaciones no llegan (Android):
- Verificar `google-services.json`
- Verificar Server Key de FCM
- Verificar que el token sea válido

### Permisos no se solicitan:
- Verificar `Info.plist` (iOS)
- Verificar `AndroidManifest.xml` (Android)
- Verificar que la librería esté correctamente linkeada

## 📚 Recursos

- [APNs Setup Guide](https://developer.apple.com/documentation/usernotifications)
- [FCM Setup Guide](https://firebase.google.com/docs/cloud-messaging)
- [react-native-push-notification Docs](https://github.com/zo0r/react-native-push-notification)

