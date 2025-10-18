# Guía de Debugging de Crashes en Producción

## 🚨 Problema
La app crashea al arrancar cuando se publica en la store o TestFlight, pero funciona correctamente en desarrollo.

## 🔧 Soluciones Implementadas

### 1. Crash Reporting con Sentry
- **Archivo**: `src/config/sentryConfig.ts`
- **Función**: Captura automática de crashes y errores
- **Configuración**: Necesitas configurar tu DSN real de Sentry

```typescript
// Reemplazar en src/config/sentryConfig.ts
dsn: 'https://tu-dsn-real@sentry.io/proyecto-id'
```

### 2. Sistema de Logging Mejorado
- **Archivo**: `src/utils/logger.ts`
- **Función**: Logging estructurado con diferentes niveles
- **Características**:
  - Logs en consola durante desarrollo
  - Envío automático a Sentry en producción
  - Categorización por secciones (auth, api, navigation, etc.)

### 3. Error Boundaries Mejorados
- **Archivo**: `components/ErrorBoundary.tsx`
- **Función**: Captura errores de React y los reporta
- **Mejoras**:
  - Logging detallado de errores
  - Reporte automático a Sentry
  - Información de contexto adicional

### 4. Monitoreo de Estado de App
- **Archivo**: `src/hooks/useCrashMonitoring.ts`
- **Función**: Detecta cambios inesperados en el estado de la app
- **Características**:
  - Monitoreo de transiciones de estado
  - Detección de crashes basada en tiempo
  - Contexto de usuario para debugging

### 5. Script de Verificación
- **Archivo**: `debug-production-build.js`
- **Función**: Verifica configuración antes de publicar
- **Uso**: `node debug-production-build.js`

## 📋 Checklist de Debugging

### Antes de Publicar
- [ ] Ejecutar `node debug-production-build.js`
- [ ] Configurar DSN real de Sentry
- [ ] Verificar que la configuración de API use URLs de producción
- [ ] Probar en dispositivos físicos
- [ ] Verificar que todas las dependencias estén instaladas

### Después de Publicar
- [ ] Revisar logs de Sentry
- [ ] Verificar métricas de crash en App Store Connect/Google Play Console
- [ ] Revisar logs del dispositivo (Xcode/Android Studio)
- [ ] Probar en diferentes dispositivos y versiones de OS

## 🔍 Cómo Diagnosticar Crashes

### 1. Revisar Logs de Sentry
```bash
# Acceder a tu dashboard de Sentry
# Buscar por:
# - Errores de JavaScript
# - Crashes nativos
# - Errores de red
# - Problemas de inicialización
```

### 2. Logs del Dispositivo
```bash
# iOS (Xcode)
# Window > Devices and Simulators > Seleccionar dispositivo > View Device Logs

# Android (Android Studio)
# View > Tool Windows > Logcat
```

### 3. Logs de la App
Los logs ahora se envían automáticamente a Sentry con contexto detallado:
- Estado de autenticación
- Configuración de API
- Estado de navegación
- Errores de push notifications

## 🚀 Comandos Útiles

### Verificar Build
```bash
cd KikiApp
node debug-production-build.js
```

### Limpiar y Rebuild
```bash
# iOS
cd ios && xcodebuild clean && cd ..
npx react-native run-ios --configuration Release

# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android --variant=release
```

### Verificar Dependencias
```bash
npm ls --depth=0
```

## 🐛 Problemas Comunes y Soluciones

### 1. App crashea al arrancar
**Posibles causas**:
- Configuración de API incorrecta
- Dependencias faltantes
- Problemas de permisos
- Errores en la inicialización de Sentry

**Solución**:
- Revisar logs de Sentry
- Verificar configuración de API
- Probar en dispositivo físico

### 2. Errores de red en producción
**Posibles causas**:
- URLs de API incorrectas
- Problemas de certificados SSL
- Configuración de red del dispositivo

**Solución**:
- Verificar `src/config/apiConfig.ts`
- Probar conectividad de red
- Revisar logs de API

### 3. Problemas de autenticación
**Posibles causas**:
- Token expirado
- Configuración de almacenamiento
- Problemas de sincronización

**Solución**:
- Revisar logs de autenticación
- Verificar AsyncStorage
- Probar flujo de login completo

## 📊 Métricas a Monitorear

### Sentry Dashboard
- **Crash Rate**: Porcentaje de sesiones que crashean
- **Error Rate**: Frecuencia de errores no fatales
- **Performance**: Tiempo de carga y respuesta
- **User Impact**: Número de usuarios afectados

### App Store Connect / Google Play Console
- **Crash Reports**: Crashes nativos del sistema
- **ANR Reports**: Aplicaciones que no responden
- **User Feedback**: Comentarios de usuarios

## 🔄 Proceso de Debugging

1. **Identificar el problema**: Revisar logs de Sentry
2. **Reproducir localmente**: Intentar reproducir en desarrollo
3. **Aislar la causa**: Usar logs detallados para identificar el punto exacto
4. **Implementar fix**: Corregir el problema
5. **Probar**: Verificar en dispositivo físico
6. **Publicar**: Subir nueva versión
7. **Monitorear**: Revisar métricas post-publicación

## 📞 Contacto y Soporte

Si necesitas ayuda adicional:
1. Revisar logs de Sentry
2. Ejecutar script de debugging
3. Documentar el problema con logs específicos
4. Probar en diferentes dispositivos

---

**Nota**: Esta guía se actualiza constantemente. Mantén este documento actualizado con nuevos problemas y soluciones encontradas.
