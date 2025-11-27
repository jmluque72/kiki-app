# Reactivación de Notificaciones Push

## 📋 Resumen

Las notificaciones push están implementadas pero **deshabilitadas**. Este documento detalla qué se necesita para reactivarlas.

## ✅ Lo que ya está implementado

1. **Servicios:**
   - ✅ `pushNotificationService.ts` - Servicio principal
   - ✅ `pushNotificationServiceSafe.ts` - Servicio seguro
   - ✅ `pushNotificationServiceAuto.ts` - Servicio automático con fallback
   - ✅ `pushNotificationServiceFallback.ts` - Servicio de fallback

2. **Hook:**
   - ✅ `usePushNotifications.ts` - Hook implementado

3. **Componente UI:**
   - ✅ `PushNotificationPreferences.tsx` - Componente de preferencias

4. **Backend API:**
   - ✅ `/push/register-token` - Endpoint funcionando
   - ✅ `/push/unregister-token` - Endpoint funcionando
   - ✅ `pushNotificationService.js` - Servicio para enviar notificaciones
   - ✅ Modelo `Device` - Para almacenar tokens

5. **Dependencias:**
   - ✅ `react-native-push-notification` instalado
   - ✅ `@react-native-community/push-notification-ios` instalado

## ❌ Lo que está deshabilitado

1. **En `App.tsx` (líneas 22-24, 39):**
   ```typescript
   // import PushNotificationService from './src/services/pushNotificationService';
   // import { usePushNotifications } from './src/hooks/usePushNotifications';
   // const pushNotifications = usePushNotifications();
   ```

2. **En `HomeScreen.tsx` (líneas 123-130):**
   ```typescript
   // useEffect(() => {
   //   try {
   //     PushNotificationService.initialize();
   //   } catch (error) {
   //     console.error('Error initializing push notifications:', error);
   //   }
   // }, []);
   ```

## 🔧 Cambios Necesarios

### 1. Reactivar Hook en App.tsx

**Archivo:** `KikiApp/App.tsx`

**Cambios:**
- Descomentar import del hook
- Descomentar uso del hook
- Opcional: Descomentar logs de debug

### 2. Agregar Métodos Faltantes al Hook

**Archivo:** `KikiApp/src/hooks/usePushNotifications.ts`

El componente `PushNotificationPreferences` espera estos métodos que no están en el hook:
- `requestPermissions()` - Para solicitar permisos manualmente
- `sendTestNotification()` - Para enviar notificación de prueba

### 3. Configuración de Plataformas

#### iOS:
- [ ] Certificados APNs configurados en Apple Developer
- [ ] Archivo `.p8` de APNs en el servidor
- [ ] Variables de entorno en `.env`:
  - `APNS_KEY_PATH`
  - `APNS_KEY_ID`
  - `APNS_TEAM_ID`
  - `APNS_BUNDLE_ID`
- [ ] Permisos en `ios/KikiApp/Info.plist`

#### Android:
- [ ] Firebase Cloud Messaging (FCM) configurado
- [ ] Archivo `google-services.json` en `android/app/`
- [ ] Variable de entorno en `.env`:
  - `FCM_SERVER_KEY`
- [ ] Permisos en `android/app/src/main/AndroidManifest.xml`

## 🚀 Pasos para Reactivar

### Paso 1: Descomentar Hook en App.tsx

```typescript
import { usePushNotifications } from './src/hooks/usePushNotifications';

// En AppContent:
const pushNotifications = usePushNotifications();
```

### Paso 2: Agregar Métodos al Hook

Agregar `requestPermissions` y `sendTestNotification` al hook.

### Paso 3: Verificar Configuración

1. **iOS:** Verificar certificados APNs
2. **Android:** Verificar configuración FCM
3. **Backend:** Verificar variables de entorno

### Paso 4: Probar

1. Login en la app
2. Verificar que se solicite permiso de notificaciones
3. Verificar que el token se registre en MongoDB
4. Enviar notificación de prueba

## 📝 Checklist

- [ ] Descomentar hook en App.tsx
- [ ] Agregar `requestPermissions()` al hook
- [ ] Agregar `sendTestNotification()` al hook
- [ ] Verificar certificados APNs (iOS)
- [ ] Verificar configuración FCM (Android)
- [ ] Configurar variables de entorno en `.env`
- [ ] Probar registro de token
- [ ] Probar recepción de notificaciones

