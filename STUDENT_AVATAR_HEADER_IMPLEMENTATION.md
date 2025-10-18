# 👤 Implementación de Avatar del Estudiante en CommonHeader

## ✅ **Estado: IMPLEMENTADO**

La funcionalidad para mostrar la foto del estudiante en el `CommonHeader` para usuarios `familyadmin` y `familyviewer` ya está implementada.

## 🔧 **Lógica Implementada**

### **1. Detección de Rol**
```typescript
const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;

// Para familyadmin y familyviewer, mostrar avatar del estudiante
if (currentRole === 'familyadmin' || currentRole === 'familyviewer') {
  // Mostrar avatar del estudiante
}
```

### **2. Prioridades para Avatar del Estudiante**
```typescript
// Prioridad 1: Avatar del estudiante desde activeAssociation
if (activeAssociation?.student?.avatar) {
  return <Image source={{ uri: activeAssociation.student.avatar }} />;
}

// Prioridad 2: Avatar del estudiante desde activeStudent prop
if (activeStudent?.avatar) {
  return <Image source={{ uri: activeStudent.avatar }} />;
}

// Si no hay avatar, mostrar placeholder
return <Text>👤</Text>;
```

### **3. Logging Detallado**
Se agregó logging completo para debuggear:
- ✅ **Props recibidas** en CommonHeader
- ✅ **Rol actual** del usuario
- ✅ **Avatar disponible** en activeAssociation
- ✅ **Avatar disponible** en activeStudent prop
- ✅ **Errores de carga** de imágenes

## 📱 **Pantallas que Usan CommonHeader**

### **✅ Con activeStudent prop:**
- `InicioScreen` - `activeStudent={getActiveStudent()}`
- `ActividadScreen` - `activeStudent={getActiveStudent()}`
- `PerfilScreen` - `activeStudent={getActiveStudent()}`
- `EventosScreen` - `activeStudent={getActiveStudent()}`
- `AlbumScreen` - `activeStudent={getActiveStudent()}`
- `AsistenciaScreen` - `activeStudent={getActiveStudent()}`

### **❌ Sin activeStudent prop:**
- `SettingsScreen` - `activeStudent={null}`
- `NotificationsScreen` - `activeStudent={null}`
- `ProfileScreen` - `activeStudent={null}`
- `ConfiguracionScreen` - `activeStudent={null}`
- `AssociationsScreen` - `activeStudent={null}`

## 🔍 **Cómo Debuggear**

### **1. Revisar Logs en Consola**
Busca estos logs específicos:

```
🔍 [CommonHeader] ===== PROPS RECIBIDAS =====
🔍 [CommonHeader] currentRole: familyadmin
🔍 [CommonHeader] activeStudent: { id: "...", name: "...", avatar: "..." }
🔍 [CommonHeader] activeAssociationStudent: { id: "...", name: "...", avatar: "..." }
🖼️ [CommonHeader] Avatar logic - currentRole: familyadmin
🖼️ [CommonHeader] Mostrando avatar del estudiante desde activeAssociation
```

### **2. Verificar Datos del Estudiante**
Los logs de `getActiveStudent()` deberían mostrar:
```
🎓 [GET ACTIVE STUDENT] Usando estudiante de activeAssociation: {
  id: "...",
  name: "...",
  avatar: "https://..."
}
```

### **3. Verificar Errores de Carga**
Si hay errores al cargar la imagen:
```
❌ [CommonHeader] Error cargando avatar del estudiante desde activeAssociation: [error]
```

## 🧪 **Casos de Prueba**

### **✅ Caso 1: familyadmin con avatar del estudiante**
- **Rol**: `familyadmin`
- **Avatar disponible**: `activeAssociation.student.avatar`
- **Resultado esperado**: Muestra foto del estudiante

### **✅ Caso 2: familyviewer con avatar del estudiante**
- **Rol**: `familyviewer`
- **Avatar disponible**: `activeStudent.avatar`
- **Resultado esperado**: Muestra foto del estudiante

### **❌ Caso 3: familyadmin sin avatar del estudiante**
- **Rol**: `familyadmin`
- **Avatar disponible**: `null`
- **Resultado esperado**: Muestra placeholder 👤

### **✅ Caso 4: coordinador con su propio avatar**
- **Rol**: `coordinador`
- **Avatar disponible**: `user.avatar`
- **Resultado esperado**: Muestra foto del coordinador

## 🔧 **Posibles Problemas**

### **1. Avatar no se carga**
- **Causa**: URL del avatar no es válida
- **Solución**: Verificar que `activeAssociation.student.avatar` tiene una URL válida

### **2. Se muestra placeholder en lugar del avatar**
- **Causa**: `activeAssociation.student.avatar` es `null` o `undefined`
- **Solución**: Verificar que el estudiante tiene avatar en la base de datos

### **3. Se muestra avatar del coordinador en lugar del estudiante**
- **Causa**: El rol no se está detectando correctamente
- **Solución**: Verificar que `activeAssociation.role.nombre` es `familyadmin` o `familyviewer`

## 📊 **Logs Esperados para Debugging**

### **Avatar del Estudiante Funcionando:**
```
🔍 [CommonHeader] currentRole: familyadmin
🔍 [CommonHeader] activeAssociationStudent: { avatar: "https://..." }
🖼️ [CommonHeader] Mostrando avatar del estudiante desde activeAssociation
```

### **Avatar del Estudiante No Disponible:**
```
🔍 [CommonHeader] currentRole: familyadmin
🔍 [CommonHeader] activeAssociationStudent: { avatar: null }
🖼️ [CommonHeader] No se encontró avatar del estudiante para familyadmin
```

### **Rol Incorrecto:**
```
🔍 [CommonHeader] currentRole: coordinador
🖼️ [CommonHeader] Mostrando avatar del coordinador
```

## 🎯 **Próximos Pasos**

1. **Probar con usuario familyadmin/familyviewer**
2. **Revisar logs en consola** para ver qué datos se están pasando
3. **Verificar que el estudiante tiene avatar** en la base de datos
4. **Reportar qué logs ves** para identificar el problema exacto

## ⚠️ **Nota Importante**

La funcionalidad ya está implementada. Si no funciona, el problema está en:
1. **Los datos del estudiante** no tienen avatar
2. **El rol no se detecta** correctamente
3. **La URL del avatar** no es válida

**¡Revisa los logs para identificar el problema exacto!** 🔍
