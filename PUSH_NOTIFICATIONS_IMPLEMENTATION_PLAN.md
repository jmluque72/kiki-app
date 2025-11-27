# Plan de Implementación de Notificaciones Push

## 📋 Estado Actual

### ✅ Lo que ya existe:

1. **Servicios de Push Notifications:**
   - `pushNotificationService.ts` - Servicio principal
   - `pushNotificationServiceSafe.ts` - Servicio seguro
   - `pushNotificationServiceAuto.ts` - Servicio automático con fallback
   - `pushNotificationServiceFallback.ts` - Servicio de fallback

2. **Hook de React:**
   - `usePushNotifications.ts` - Hook para usar en componentes

3. **Componente UI:**
   - `PushNotificationPreferences.tsx` - Componente de preferencias

4. **API Backend:**
   - `/push/register-token` - Endpoint para registrar tokens
   - `/push/unregister-token` - Endpoint para desregistrar tokens
   - `pushNotificationService.js` - Servicio para enviar notificaciones
   - Modelo `Device` - Para almacenar tokens

5. **Dependencias instaladas:**
   - `react-native-push-notification` ✅
   - `@react-native-community/push-notification-ios` ✅

### ❌ Lo que está comentado/deshabilitado:

1. **En `App.tsx`:**
   - Hook `usePushNotifications` está comentado (línea 24, 39)
   - Inicialización de push notifications deshabilitada

2. **En `HomeScreen.tsx`:**
   - Inicialización de push notifications comentada (líneas 123-130)

## 🎯 Plan de Implementación

### Fase 1: Reactivar Inicialización Básica

1. **Descomentar hook en App.tsx**
   - Activar `usePushNotifications` hook
   - Asegurar que se inicialice cuando el usuario esté autenticado

2. **Verificar que el hook funcione correctamente**
   - El hook debe inicializar el servicio automáticamente
   - Debe obtener el token del dispositivo
   - Debe registrar el token en el servidor

### Fase 2: Configuración de Plataformas

#### iOS:
- ✅ Certificados APNs configurados
- ✅ Permisos en `Info.plist`
- ✅ Configuración en Xcode

#### Android:
- ✅ Firebase Cloud Messaging (FCM) configurado
- ✅ `google-services.json` en `android/app/`
- ✅ Permisos en `AndroidManifest.xml`

### Fase 3: Integración con Backend

1. **Verificar endpoints del API:**
   - `/push/register-token` funciona
   - `/push/unregister-token` funciona
   - Servicio de envío de push notifications funciona

2. **Probar registro de token:**
   - Login en la app
   - Verificar que el token se registre en MongoDB
   - Verificar en la colección `devices`

### Fase 4: Manejo de Notificaciones

1. **Notificaciones en primer plano:**
   - Mostrar notificación local cuando la app está abierta
   - Manejar clic en notificación

2. **Notificaciones en segundo plano:**
   - Recibir notificaciones cuando la app está cerrada
   - Manejar navegación cuando se abre desde notificación

3. **Notificaciones cuando la app está en background:**
   - Recibir notificaciones
   - Actualizar badge/contador

## 🔧 Cambios Necesarios

### 1. Reactivar en App.tsx

```typescript
// Descomentar estas líneas:
import { usePushNotifications } from './src/hooks/usePushNotifications';

// En AppContent:
const pushNotifications = usePushNotifications();
```

### 2. Verificar Configuración iOS

Revisar:
- `ios/KikiApp/Info.plist` - Permisos de notificaciones
- Certificados APNs en Apple Developer
- Configuración en Xcode

### 3. Verificar Configuración Android

Revisar:
- `android/app/google-services.json` - Configuración FCM
- `android/app/src/main/AndroidManifest.xml` - Permisos
- Firebase project configurado

### 4. Probar Flujo Completo

1. Login en la app
2. Verificar que se solicite permiso de notificaciones
3. Verificar que el token se registre en el servidor
4. Enviar notificación de prueba desde el backend
5. Verificar recepción en la app

## 📝 Checklist de Implementación

- [ ] Descomentar hook en App.tsx
- [ ] Verificar que el servicio se inicialice correctamente
- [ ] Verificar permisos en iOS (Info.plist)
- [ ] Verificar permisos en Android (AndroidManifest.xml)
- [ ] Verificar certificados APNs (iOS)
- [ ] Verificar configuración FCM (Android)
- [ ] Probar registro de token
- [ ] Probar recepción de notificaciones
- [ ] Probar manejo de notificaciones (foreground, background, quit)
- [ ] Probar navegación desde notificaciones
- [ ] Probar componente de preferencias

## 🐛 Posibles Problemas

1. **Token no se registra:**
   - Verificar que el usuario esté autenticado
   - Verificar que el endpoint `/push/register-token` funcione
   - Revisar logs del servidor

2. **Notificaciones no llegan:**
   - Verificar certificados APNs (iOS)
   - Verificar configuración FCM (Android)
   - Verificar que el token esté activo en la BD

3. **Permisos no se solicitan:**
   - Verificar configuración en Info.plist (iOS)
   - Verificar configuración en AndroidManifest.xml (Android)

## 📚 Documentación de Referencia

- [react-native-push-notification](https://github.com/zo0r/react-native-push-notification)
- [APNs Configuration](https://developer.apple.com/documentation/usernotifications)
- [FCM Setup](https://firebase.google.com/docs/cloud-messaging)

