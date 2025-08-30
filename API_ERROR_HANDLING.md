# Manejo de Errores 401 - App Mobile

## 🎯 Objetivo
Implementar un manejo global de errores 401 (Unauthorized) que redirija automáticamente al usuario al login desde cualquier parte de la aplicación.

## 🔧 Implementación

### 1. Interceptor Global (api.ts)
El interceptor de respuesta en `src/services/api.ts` maneja automáticamente los errores 401:

```typescript
// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Token expirado o inválido - Redirigiendo al login');
      
      // Limpiar el token actual
      setAuthToken(null);
      
      // Llamar a la función de logout global
      if (globalLogout) {
        await globalLogout();
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. Registro de Logout Global (AuthContext.tsx)
El AuthContext registra su función de logout para que el interceptor pueda usarla:

```typescript
// Registrar la función de logout global para el manejo de errores 401
useEffect(() => {
  setGlobalLogout(logout);
}, []);
```

### 3. Hook de Manejo de Errores (useApiError.ts)
Hook personalizado para manejar errores de API de manera consistente:

```typescript
const { handleApiError } = useApiError();

const errorInfo = handleApiError(error, 'Mensaje personalizado');
```

### 4. Componente de Manejo de Errores (ApiErrorHandler.tsx)
Componente que puede ser usado para mostrar errores de manera consistente:

```typescript
const { showError } = useApiErrorHandler();

// En un catch block
catch (error) {
  showError(error, 'Error al cargar datos');
}
```

## 📱 Uso en Componentes

### Opción 1: Uso Automático (Recomendado)
Los errores 401 se manejan automáticamente. Solo necesitas manejar otros errores:

```typescript
const loadData = async () => {
  try {
    const data = await apiClient.get('/some-endpoint');
    // Procesar datos
  } catch (error) {
    // Solo manejar errores no-401
    if (error.response?.status !== 401) {
      Alert.alert('Error', 'Error al cargar datos');
    }
    // Los errores 401 se manejan automáticamente
  }
};
```

### Opción 2: Uso con Hook Personalizado
Para manejo más específico de errores:

```typescript
import { useApiErrorHandler } from '../components/ApiErrorHandler';

const MyComponent = () => {
  const { showError } = useApiErrorHandler();

  const handleApiCall = async () => {
    try {
      const data = await apiClient.get('/some-endpoint');
      // Procesar datos
    } catch (error) {
      const errorInfo = showError(error, 'Error personalizado');
      
      if (!errorInfo.shouldLogout) {
        // Hacer algo específico para errores no-401
        console.log('Error no relacionado con autenticación');
      }
    }
  };
};
```

### Opción 3: Uso con Componente
Para componentes que necesitan manejo de errores específico:

```typescript
import { ApiErrorHandler } from '../components/ApiErrorHandler';

const MyComponent = () => {
  const [error, setError] = useState(null);

  return (
    <View>
      <ApiErrorHandler 
        error={error} 
        customMessage="Error al cargar datos"
        onError={(errorInfo) => {
          // Manejo personalizado
          console.log('Error manejado:', errorInfo.message);
        }}
      />
      {/* Resto del componente */}
    </View>
  );
};
```

## 🔄 Flujo de Manejo de Errores 401

1. **Llamada a API** → Error 401
2. **Interceptor detecta** → Limpia token
3. **Llama a logout global** → Limpia estado y AsyncStorage
4. **AuthContext actualiza** → `isAuthenticated = false`
5. **App.tsx detecta** → Redirige automáticamente al LoginScreen

## ✅ Beneficios

- **Automático**: No necesitas manejar errores 401 en cada componente
- **Consistente**: Mismo comportamiento en toda la app
- **Limpio**: Limpia automáticamente el estado y el almacenamiento
- **Flexible**: Permite manejo personalizado para otros errores
- **User-friendly**: Redirige automáticamente al login

## 🚨 Consideraciones

- Los errores 401 se manejan automáticamente
- No necesitas try/catch específico para errores 401
- El logout es automático y completo
- La redirección al login es automática
- Otros errores (403, 404, 500, etc.) se pueden manejar manualmente

## 📝 Ejemplo Completo

```typescript
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { useApiErrorHandler } from '../components/ApiErrorHandler';
import { apiClient } from '../src/services/api';

const MyScreen = () => {
  const [loading, setLoading] = useState(false);
  const { showError } = useApiErrorHandler();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/protected-endpoint');
      // Procesar datos exitosamente
      Alert.alert('Éxito', 'Datos cargados correctamente');
    } catch (error) {
      // Los errores 401 se manejan automáticamente
      // Solo mostrar mensaje para otros errores
      if (error.response?.status !== 401) {
        showError(error, 'Error al cargar datos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button 
        title={loading ? "Cargando..." : "Cargar Datos"} 
        onPress={loadData}
        disabled={loading}
      />
    </View>
  );
};
```
