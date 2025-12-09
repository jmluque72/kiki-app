# Resumen: Upload de Imágenes en Android

## 📋 Lugares donde se suben imágenes en formularios

### 1. **Avatar de Usuario** (`userService.ts`)
- **Ubicación**: `KikiApp/src/services/userService.ts`
- **Líneas**: 104-159
- **Método**: `fetch` directamente
- **Endpoint**: `/users/avatar` (PUT)
- **Nota**: En iOS usa `apiClient` (axios), pero en Android usa `fetch`

```typescript
// En Android, usar fetch directamente (más confiable para archivos)
if (Platform.OS === 'android') {
  const fetchResponse = await fetch(`${API_FULL_URL}/users/avatar`, {
    method: 'PUT',
    body: formData,
    headers: {
      'Authorization': `Bearer ${currentToken}`,
      // NO incluir Content-Type - fetch lo establecerá automáticamente con boundary
    },
  });
}
```

### 2. **Imágenes de Actividades** (`ActividadScreen.tsx`)
- **Ubicación**: `KikiApp/screens/ActividadScreen.tsx`
- **Líneas**: 580-587 (uploadImages) y 823-950 (uploadMedia)
- **Método**: `fetch` directamente
- **Endpoint**: `/upload/s3/image` (POST)
- **Nota**: Usa `fetch` tanto en Android como iOS

```typescript
// En uploadImages (línea 580)
const response = await fetch(`${API_FULL_URL}/upload/s3/image`, {
  method: 'POST',
  body: formDataArray[i],
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  signal: controller.signal,
});

// En uploadMedia (línea 823+)
if (Platform.OS === 'android') {
  console.log('📱 [ACTIVIDAD] Android - usando fetch directamente');
  const fetchResponse = await fetch(`${API_FULL_URL}/upload/s3/image`, {
    method: 'POST',
    body: formDataToUse,
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
}
```

### 3. **Campos de Tipo Imagen en Formularios** (`CompleteFormScreen.tsx`)
- **Ubicación**: `KikiApp/screens/CompleteFormScreen.tsx`
- **Líneas**: 99-286 (uploadFileToS3)
- **Método**: `fetch` directamente
- **Endpoint**: `/upload/s3/file` (POST)
- **Nota**: Usa `fetch` tanto en Android como iOS para mantener consistencia

```typescript
// En Android, usar fetch directamente (más confiable para FormData)
// En iOS, también usar fetch para mantener consistencia
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  const fetchResponse = await uploadWithRetry(0);
  // ...
}
```

## ✅ Conclusión

**En Android, TODOS los uploads de imágenes usan `fetch` directamente:**

1. ✅ Avatar de usuario → `fetch`
2. ✅ Imágenes de actividades → `fetch`
3. ✅ Campos de tipo imagen en formularios → `fetch`

**Razones para usar `fetch` en Android:**
- Maneja mejor FormData con URIs `content://` y `file://`
- Más confiable para archivos temporales
- No tiene problemas con el Content-Type (React Native lo establece automáticamente)
- Mejor manejo de errores de red

**En iOS:**
- Avatar de usuario → `apiClient` (axios) - funciona bien
- Imágenes de actividades → `fetch` - para mantener consistencia
- Campos de tipo imagen → `fetch` - para mantener consistencia

## 🔍 Verificación

Para verificar que todos los lugares usan `fetch` en Android:

```bash
cd KikiApp
grep -r "Platform.OS.*android" src/ screens/ | grep -E "(fetch|axios|apiClient)" | grep -i upload
```

