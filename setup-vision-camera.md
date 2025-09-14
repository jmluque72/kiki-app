# Configuración de react-native-camera-kit

## Pasos para configurar la cámara QR:

### 1. ✅ Librerías Instaladas:
- `react-native-camera-kit@16.0.1`

### 2. ✅ Permisos en AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### 3. 🔧 Pasos Adicionales Requeridos:

#### Para Android:
1. **Limpiar y reconstruir:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

2. **Verificar vinculación automática:**
   - La librería usa auto-linking
   - No requiere configuración manual adicional

#### Para iOS (si se usa):
1. **Ejecutar pod install:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### 4. 🧪 Pruebas:
1. Abrir la app en dispositivo físico
2. Ir a pantalla de asistencia
3. Presionar "Escanear QR"
4. Aceptar permisos de cámara
5. La cámara debería abrirse correctamente

### 5. 🐛 Solución de Problemas:
- **Si sigue sin funcionar:** Limpiar caché de Metro
  ```bash
  npx react-native start --reset-cache
  ```
- **Reconstruir completamente:**
  ```bash
  rm -rf node_modules
  yarn install
  cd android && ./gradlew clean && cd ..
  npx react-native run-android
  ```

### 6. 📱 Características del Nuevo Scanner:
- ✅ Usa react-native-camera-kit (estable y confiable)
- ✅ Compatible con iOS y Android
- ✅ Manejo automático de permisos
- ✅ UI integrada con marcador visual
- ✅ Sin problemas de compilación
