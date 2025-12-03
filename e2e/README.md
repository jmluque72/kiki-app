# Tests E2E con Detox

Este directorio contiene los tests end-to-end (E2E) para la aplicación móvil Kiki usando Detox.

## 📋 Prerequisitos

1. **Detox instalado globalmente** (opcional):
```bash
npm install -g detox-cli
```

2. **Dependencias instaladas**:
```bash
npm install
```

3. **Para iOS**:
   - Xcode instalado
   - Simulador iOS configurado

4. **Para Android**:
   - Android Studio instalado
   - Emulador Android configurado (AVD)

## 🚀 Configuración Inicial

### 1. Instalar Detox (si no está instalado)

```bash
npm install --save-dev detox
```

### 2. Construir la app para testing

**iOS:**
```bash
npm run e2e:build:ios
```

**Android:**
```bash
npm run e2e:build:android
```

## 🧪 Ejecutar Tests

### Ejecutar todos los tests

```bash
npm run e2e:test
```

### Ejecutar tests por plataforma

**iOS:**
```bash
npm run e2e:test:ios
```

**Android:**
```bash
npm run e2e:test:android
```

### Ejecutar tests específicos

```bash
# Tests de autenticación
npm run e2e:test:auth

# Tests de actividades
npm run e2e:test:activities

# Tests de asistencia
npm run e2e:test:attendance

# Tests de acciones diarias
npm run e2e:test:actions

# Tests de formularios
npm run e2e:test:forms
```

### Ejecutar un test específico

```bash
detox test e2e/activities.e2e.js
```

## 📁 Estructura de Tests

```
e2e/
├── auth.e2e.js              # Tests de autenticación
├── activities.e2e.js        # Tests de creación de actividades
├── attendance.e2e.js        # Tests de registro de asistencia
├── student-actions.e2e.js   # Tests de acciones diarias
├── forms.e2e.js            # Tests de formularios
├── config.json             # Configuración de Jest para Detox
├── init.js                 # Inicialización de tests
└── utils/
    ├── selectors.js        # Selectores reutilizables
    └── testUtils.js        # Utilidades de testing
```

## 🔧 Configuración de Datos de Prueba

Los tests utilizan usuarios de prueba definidos en la documentación:

- **Coordinador**: `coordinador@test.com` / `password123`
- **Familyadmin**: `familyadmin@test.com` / `password123`
- **Familyviewer**: `familyviewer@test.com` / `password123`

Asegúrate de que estos usuarios existan en tu base de datos de prueba.

## 📝 Flujos Documentados

Los tests implementan los flujos documentados en `PLATAFORMA_DOCUMENTACION_COMPLETA.md`:

1. **Login como Coordinador** - Verifica login y pestañas visibles
2. **Crear Actividad** - Crea actividad con título y estudiantes
3. **Registrar Asistencia** - Marca estudiantes como presentes/ausentes
4. **Acciones Diarias** - Registra acciones diarias para estudiantes
5. **Completar Formulario** - Completa formularios como familyadmin

## 🐛 Debugging

### Ver logs detallados

```bash
detox test --loglevel trace
```

### Tomar screenshots automáticos

Los screenshots se guardan automáticamente en `artifacts/` cuando un test falla.

### Ejecutar en modo interactivo

```bash
detox test --debug-synchronization
```

## ⚠️ Notas Importantes

1. **Test IDs**: Algunas pantallas pueden no tener `testID` implementados. Los tests usan métodos alternativos (búsqueda por texto, tipo de componente, etc.).

2. **Timing**: Los tests incluyen `sleep()` para esperar que se carguen los datos. Ajusta los tiempos según sea necesario.

3. **Permisos**: Los tests requieren permisos de cámara, fotos y notificaciones. Se configuran automáticamente al lanzar la app.

4. **Datos de Prueba**: Asegúrate de que existan datos de prueba (estudiantes, instituciones, etc.) en la base de datos.

## 🔄 Actualizar Tests

Cuando agregues nuevas funcionalidades:

1. Agrega `testID` a los componentes nuevos
2. Actualiza `e2e/utils/selectors.js` con nuevos selectores
3. Crea nuevos archivos de test en `e2e/`
4. Actualiza este README

## 📚 Recursos

- [Documentación de Detox](https://github.com/wix/Detox)
- [Guía de Testing E2E](https://wix.github.io/Detox/docs/introduction/getting-started)
- [Documentación Completa de la Plataforma](../PLATAFORMA_DOCUMENTACION_COMPLETA.md)

