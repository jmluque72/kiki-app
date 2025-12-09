# Sección "Quien Retira" - App Mobile

## 🎯 Objetivo
Implementar la sección "Quien Retira" en la app mobile que solo sea visible para usuarios con rol `familyadmin`.

## 🔧 Implementación

### 1. Pantalla QuienRetiraScreen
- **Ubicación**: `KikiApp/screens/QuienRetiraScreen.tsx`
- **Funcionalidades**:
  - Lista de personas autorizadas para retirar estudiantes
  - Filtros por división y estudiante
  - Agregar nuevas personas autorizadas
  - Editar información existente
  - Eliminar personas autorizadas
  - Control de acceso basado en rol

### 2. Control de Acceso
```typescript
// Verificar si el usuario tiene el rol correcto
const isFamilyAdmin = user?.role?.nombre === 'familyadmin';

// Si no es familyadmin, mostrar mensaje de acceso denegado
if (!isFamilyAdmin) {
  return (
    <View style={styles.accessDeniedContainer}>
      <Text style={styles.accessDeniedIcon}>🚫</Text>
      <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
      <Text style={styles.accessDeniedMessage}>
        Solo los administradores familiares pueden acceder a esta sección.
      </Text>
    </View>
  );
}
```

### 3. Integración en HomeScreen
- **Ubicación**: `KikiApp/screens/HomeScreen.tsx`
- **Lógica**: La pestaña "Quien Retira" solo aparece para usuarios `familyadmin`
```typescript
{isFamilyAdmin && (
  <Tab.Screen
    name="QuienRetira"
    component={() => <QuienRetiraScreen onOpenNotifications={handleOpenNotifications} />}
    options={{
      headerShown: false,
      tabBarIcon: ({ focused }) => (
        <View style={styles.tabIconContainer}>
          <Image
            source={require('../assets/design/icons/kiki_personitas_3.png')}
            style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
            resizeMode="contain"
          />
        </View>
      ),
    }}
  />
)}
```

### 4. Servicio PickupService
- **Ubicación**: `KikiApp/src/services/pickupService.ts`
- **Funcionalidades**:
  - Obtener lista de quién retira
  - Crear nueva persona autorizada
  - Actualizar información
  - Eliminar persona autorizada
  - Obtener divisiones y estudiantes
  - Validar DNI único
  - Buscar por nombre o DNI

### 5. Modal PickupModal
- **Ubicación**: `KikiApp/components/PickupModal.tsx`
- **Funcionalidades**:
  - Formulario para agregar/editar personas
  - Validación de campos obligatorios
  - Selección de división y estudiante
  - Manejo de errores
  - Estados de carga

## 📱 Características de la UI

### Filtros
- **División**: Filtro horizontal con chips
- **Estudiante**: Filtro que aparece solo cuando se selecciona una división
- **Estado**: Filtros activos/inactivos visualmente diferenciados

### Lista de Personas
- **Cards**: Diseño moderno con sombras
- **Información mostrada**:
  - Nombre y apellido
  - DNI
  - Teléfono (si está disponible)
  - Relación con el estudiante
  - Estudiante asociado
  - División
  - Estado (activo/inactivo)

### Acciones
- **Botón Agregar**: Naranja prominente
- **Editar**: Botón con icono de lápiz
- **Eliminar**: Botón con icono de papelera
- **Pull to Refresh**: Para actualizar la lista

## 🔄 Flujo de Datos

1. **Carga inicial**:
   - Verificar rol del usuario
   - Cargar divisiones del usuario
   - Cargar lista de quién retira

2. **Filtrado**:
   - Al cambiar división → cargar estudiantes de esa división
   - Al cambiar estudiante → filtrar lista de quién retira

3. **Agregar/Editar**:
   - Abrir modal con formulario
   - Validar campos
   - Enviar datos al API
   - Actualizar lista

4. **Eliminar**:
   - Confirmar acción
   - Enviar request de eliminación
   - Actualizar lista

## 🎨 Estilos y Diseño

### Colores
- **Primario**: `#0E5FCE` (Azul)
- **Secundario**: `#FF8C42` (Naranja)
- **Fondo**: `#F5F5F5` (Gris claro)
- **Texto**: `#333` (Gris oscuro)

### Componentes
- **Header**: Azul con título y botón de notificaciones
- **Filtros**: Fondo blanco con chips interactivos
- **Cards**: Fondo blanco con sombras y bordes redondeados
- **Modal**: Fondo semitransparente con contenido centrado

## 🔒 Seguridad

### Control de Acceso
- Solo usuarios con rol `familyadmin` pueden acceder
- Verificación en tiempo real del rol del usuario
- Mensaje claro de acceso denegado para otros roles

### Validación
- Campos obligatorios validados
- Formato de DNI validado
- DNI único por persona
- Validación de teléfono opcional

## 📊 Estados de la Aplicación

### Estados de Carga
- **Loading**: Spinner con mensaje "Cargando..."
- **Empty**: Icono y mensaje cuando no hay datos
- **Error**: Manejo de errores con mensajes claros

### Estados de Interacción
- **Modal abierto**: Formulario activo
- **Filtros activos**: Chips seleccionados
- **Acciones**: Botones con estados de carga

## 🚀 Funcionalidades Futuras

### Posibles Mejoras
- **Búsqueda**: Buscar por nombre o DNI
- **Ordenamiento**: Por nombre, fecha, estado
- **Paginación**: Para listas grandes
- **Notificaciones**: Alertas de cambios
- **Exportar**: Lista en PDF o Excel
- **Fotos**: Agregar fotos de las personas autorizadas

### Integración con API
- **Endpoints necesarios**:
  - `GET /pickups` - Lista de quién retira
  - `POST /pickups` - Crear nueva persona
  - `PUT /pickups/:id` - Actualizar persona
  - `DELETE /pickups/:id` - Eliminar persona
  - `GET /divisions` - Lista de divisiones
  - `GET /students/division/:id` - Estudiantes por división

## ✅ Beneficios

- **Seguridad**: Control de acceso basado en roles
- **Usabilidad**: Interfaz intuitiva y responsive
- **Funcionalidad**: CRUD completo para gestión
- **Escalabilidad**: Arquitectura modular y extensible
- **Mantenibilidad**: Código bien estructurado y documentado
