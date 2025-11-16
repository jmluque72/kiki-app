# Testing en KikiApp

Este documento describe cómo ejecutar y escribir tests automatizados para la aplicación móvil KikiApp.

## 📋 Requisitos Previos

Asegúrate de tener instaladas las dependencias:

```bash
npm install
```

## 🚀 Ejecutar Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests para CI/CD
```bash
npm run test:ci
```

### Limpiar caché de Jest
```bash
npm run test:clear-cache
```

## 📁 Estructura de Tests

```
__tests__/
├── components/          # Tests de componentes React Native
├── services/           # Tests de servicios y APIs
├── hooks/               # Tests de hooks personalizados
├── config/              # Tests de configuración
├── integration/         # Tests de integración
└── utils/               # Tests de utilidades
```

## 🧪 Tipos de Tests

### 1. Tests Unitarios
Prueban funciones individuales y componentes aislados:

```typescript
// Ejemplo: authService.test.ts
describe('AuthService', () => {
  it('debe iniciar sesión exitosamente', async () => {
    const result = await AuthService.login(credentials);
    expect(result.token).toBeDefined();
  });
});
```

### 2. Tests de Componentes
Prueban componentes React Native:

```typescript
// Ejemplo: PasswordInput.test.tsx
describe('PasswordInput', () => {
  it('debe mostrar/ocultar contraseña', () => {
    const { getByTestId } = render(<PasswordInput />);
    const eyeIcon = getByTestId('eye-icon');
    fireEvent.press(eyeIcon);
    expect(input.props.secureTextEntry).toBe(false);
  });
});
```

### 3. Tests de Hooks
Prueban hooks personalizados:

```typescript
// Ejemplo: useApiError.test.ts
describe('useApiError', () => {
  it('debe manejar errores de red', () => {
    const { result } = renderHook(() => useApiError());
    result.current.handleApiError(networkError);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
```

### 4. Tests de Integración
Prueban flujos completos de usuario:

```typescript
// Ejemplo: authFlow.test.tsx
describe('Flujo de Autenticación', () => {
  it('debe completar el login exitosamente', async () => {
    // Simular flujo completo de login
  });
});
```

### 5. Tests de Snapshot
Verifican que la UI no cambie inadvertidamente:

```typescript
// Ejemplo: ComponentSnapshots.test.tsx
describe('Snapshot Tests', () => {
  it('debe coincidir con el snapshot de ActivityCard', () => {
    const tree = renderer
      .create(
        <ThemeProvider>
          <ActivityCard
            activity={mockActivity}
            onPress={jest.fn()}
            currentUserId="user1"
          />
        </ThemeProvider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### 6. Tests de Utilidad
Prueban funciones auxiliares y formateadores:

```typescript
// Ejemplo: dateUtils.test.ts
describe('dateUtils', () => {
  it('debe formatear fecha correctamente', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15/01/2024');
  });

  it('debe calcular diferencia de días', () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-20');
    expect(getDaysDifference(date1, date2)).toBe(5);
  });

  it('debe obtener tiempo relativo', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(getRelativeTime(fiveMinutesAgo)).toBe('hace 5 minutos');
  });
});
```

## 📝 Escribir Nuevos Tests

### Convenciones de Nomenclatura
- **Archivos de test**: `ComponentName.test.tsx` o `serviceName.test.ts`
- **Descripciones**: Usar español, comenzar con "debe"
- **Mocks**: Nombrar con prefijo `mock` (ej: `mockUser`, `mockResponse`)
- **Funciones de utilidad**: Crear en `__tests__/utils/`

### Estructura Básica
```typescript
describe('Nombre del Componente/Servicio', () => {
  beforeEach(() => {
    // Configuración antes de cada test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Limpieza después de cada test
  });

  describe('Método/Escenario Específico', () => {
    it('debe comportarse de cierta manera', () => {
      // Arrange - Preparar datos
      // Act - Ejecutar acción
      // Assert - Verificar resultado
    });
  });
});
```

## 🔄 Mocks Comunes

### React Navigation
```typescript
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));
```

### AsyncStorage
```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Servicios
```typescript
jest.mock('../../src/services/api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));
```

## 📊 Cobertura de Tests

### Objetivos de Cobertura
- **Statements**: Mínimo 80%
- **Branches**: Mínimo 75%
- **Functions**: Mínimo 80%
- **Lines**: Mínimo 80%

### Archivos Excluidos
- Archivos de configuración
- Mocks y utilidades de test
- Componentes de terceros
- Archivos de tipos (`.d.ts`)

### Generar Reporte de Cobertura
```bash
# Generar reporte HTML
cd KikiApp
npm run test:coverage

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

## 🧪 Tipos de Tests Implementados

### 1. Tests Unitarios
- **Servicios**: Prueban la lógica de negocio
- **Hooks**: Prueban el estado y efectos secundarios
- **Utilidades**: Prueban funciones auxiliares
- **Componentes**: Prueban renderizado y comportamiento aislado

### 2. Tests de Integración
- Prueban la interacción entre múltiples componentes
- Verifican flujos completos del usuario
- Testean la integración con servicios externos

### 3. Tests de Snapshot
- Capturan la estructura de la UI
- Detectan cambios no intencionales
- Se actualizan cuando los cambios son intencionales

### 4. Tests de Regresión Visual
- Complementan los snapshots para detectar cambios visuales
- Se pueden implementar con herramientas como Loki o Chromatic

## 🎯 Mejores Prácticas

1. **Aislamiento**: Cada test debe ser independiente
2. **Claridad**: Los tests deben ser fáciles de leer y entender
3. **Mocking**: Usar mocks para dependencias externas
4. **Asincronía**: Manejar correctamente operaciones asíncronas
5. **Errores**: Probar tanto casos exitosos como de error
6. **Nomenclatura**: Usar nombres descriptivos para los tests

## 🔧 Troubleshooting

### Error: "Cannot find module"
```bash
npm run test:clear-cache
```

### Error: "Network request failed"
Asegúrate de tener los mocks apropiados para fetch/axios.

### Error: "Invariant Violation"
Verifica que todos los providers necesarios estén envueltos en el render.

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [React Navigation Testing](https://reactnavigation.org/docs/testing/)
- [Testing Library](https://testing-library.com/docs/)

## 🚀 CI/CD

Los tests se ejecutan automáticamente en:
- Pull requests
- Merge a main/develop
- Despliegues

Configuración en `.github/workflows/` (si existe).