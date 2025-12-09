# Fix para Iconos SVG no visibles en iOS Build

## Problema
Los iconos SVG nuevos (como el icono de lápiz) no se ven cuando se hace build en iOS.

## Posibles Causas

1. **react-native-svg no está correctamente vinculado**
2. **Cache de build de iOS**
3. **Pods no actualizados**
4. **Problemas con la nueva arquitectura**

## Soluciones

### 1. Limpiar y Reinstalar Pods

```bash
cd KikiApp/ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### 2. Limpiar Build de iOS

```bash
cd KikiApp/ios
rm -rf build DerivedData
cd ..
```

### 3. Verificar que react-native-svg esté instalado

```bash
cd KikiApp
npm list react-native-svg
```

Debería mostrar: `react-native-svg@^15.0.0`

### 4. Rebuild completo

```bash
cd KikiApp

# Limpiar todo
cd ios
rm -rf build DerivedData Pods Podfile.lock
cd ..

# Reinstalar dependencias
npm install

# Reinstalar pods
cd ios
pod install
cd ..

# Rebuild
npm run ios
```

### 5. Verificar en Xcode

1. Abre `ios/KikiApp.xcworkspace` en Xcode
2. Ve a **Build Phases** → **Link Binary With Libraries**
3. Verifica que `RNSVG.xcframework` o `libRNSVG.a` esté presente
4. Si no está, agrega `RNSVG` manualmente

### 6. Si sigue sin funcionar - Usar alternativa con Text

Si los SVG siguen sin funcionar, podemos usar un componente alternativo basado en texto o crear un componente más simple.

## Verificación

Después de aplicar las soluciones, verifica que el icono se vea:
- En el simulador
- En un dispositivo físico
- En el build de release

