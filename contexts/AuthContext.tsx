import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken, setGlobalLogout } from '../src/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
}

interface Association {
  _id: string;
  account: {
    _id: string;
    nombre: string;
    razonSocial: string;
  };
  division?: {
    _id: string;
    nombre: string;
    descripcion: string;
  } | null;
  status: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  associations: Association[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  login: (userData: User) => void; // Sobrecarga para actualizar usuario
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ASSOCIATIONS: 'auth_associations',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos guardados al iniciar la app
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Registrar la función de logout global para el manejo de errores 401
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔄 Cargando datos de autenticación guardados...');
      
      const [storedToken, storedUser, storedAssociations] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
      ]);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        const associationsData = storedAssociations ? JSON.parse(storedAssociations) : [];
        
        console.log('✅ Datos de autenticación encontrados');
        console.log('👤 Usuario guardado:');
        console.log('   - ID:', userData._id);
        console.log('   - Nombre:', userData.name);
        console.log('   - Email:', userData.email);
        console.log('   - Rol:', userData.role.nombre);
        
        console.log('🏫 Asociaciones guardadas:', associationsData.length);
        associationsData.forEach((assoc: Association, index: number) => {
          console.log(`   ${index + 1}. Cuenta: ${assoc.account.nombre}`);
          console.log(`      División: ${assoc.division?.nombre || 'Sin división'}`);
          console.log(`      Estado: ${assoc.status}`);
        });
        
        setToken(storedToken);
        setUser(userData);
        setAssociations(associationsData);
        
        // Configurar el token en el cliente API
        setAuthToken(storedToken);
      } else {
        console.log('❌ No se encontraron datos de autenticación guardados');
      }
    } catch (error) {
      console.error('❌ Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (token: string, user: User, associations: Association[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(associations)),
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (emailOrUserData: string | User, password?: string): Promise<boolean> => {
    // Si se pasa un objeto User, actualizar el usuario
    if (typeof emailOrUserData === 'object') {
      const userData = emailOrUserData;
      console.log('🔄 [AuthContext] Actualizando usuario:', userData);
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      return true;
    }
    
    // Si se pasa email y password, hacer login normal
    const email = emailOrUserData;
    if (!password) {
      throw new Error('Password es requerido para login');
    }
    
    try {
      console.log('🔐 Iniciando login para:', email);
      
      const response = await apiClient.post('/users/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        console.log('✅ Login exitoso');
        console.log('👤 Perfil del usuario:');
        console.log('   - ID:', userData._id);
        console.log('   - Nombre:', userData.name);
        console.log('   - Email:', userData.email);
        console.log('   - Rol:', userData.role.nombre);
        console.log('   - Descripción del rol:', userData.role.descripcion);
        
        console.log('🔑 Token recibido:', newToken ? 'Token válido' : 'Sin token');
        
        setToken(newToken);
        setUser(userData);
        
        // Configurar el token en el cliente API
        setAuthToken(newToken);
        
        // Guardar usuario y token en AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        // Ahora cargar las asociaciones del usuario
        console.log('🏫 Cargando asociaciones del usuario...');
        try {
          const sharedService = require('../src/services/sharedService').default;
          const userAssociations = await sharedService.getUserAssociations();
          
          console.log('✅ Asociaciones cargadas:', userAssociations.length);
          userAssociations.forEach((assoc: any, index: number) => {
            console.log(`   ${index + 1}. Cuenta: ${assoc.account.nombre}`);
            console.log(`      División: ${assoc.division?.nombre || 'Sin división'}`);
            console.log(`      Estado: ${assoc.status}`);
            console.log(`      Rol: ${assoc.role.nombre}`);
            if (assoc.student) {
              console.log(`      Estudiante: ${assoc.student.nombre} ${assoc.student.apellido}`);
              console.log(`      Avatar: ${assoc.student.avatar ? 'Sí' : 'No'}`);
            }
          });
          
          setAssociations(userAssociations);
          
          // Guardar asociaciones en AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(userAssociations));
          
          // Verificar si el usuario tiene asociaciones
          if (userAssociations.length === 0) {
            console.log('⚠️ Usuario sin asociaciones');
            Alert.alert(
              '⚠️ Sin Asociaciones',
              'No tienes asociaciones activas en el sistema.\n\nContacta al administrador para que te asigne a una institución.',
              [
                {
                  text: 'OK',
                  onPress: () => console.log('Usuario confirmó alert de sin asociaciones')
                }
              ]
            );
            throw new Error('No tienes asociaciones activas. Contacta al administrador.');
          }
          
          // Mostrar alert con los datos de las asociaciones
          const associationsInfo = userAssociations.map((assoc, index) => {
            const studentInfo = assoc.student 
              ? `\n   Estudiante: ${assoc.student.nombre} ${assoc.student.apellido}${assoc.student.avatar ? ' (con avatar)' : ''}`
              : '\n   Sin estudiante asociado';
            
            return `${index + 1}. ${assoc.account.nombre}${assoc.division ? ` - ${assoc.division.nombre}` : ''} (${assoc.role.nombre})${studentInfo}`;
          }).join('\n\n');
          
          Alert.alert(
            '✅ Login Exitoso',
            `Usuario: ${userData.name || userData.email}\n\nAsociaciones encontradas (${userAssociations.length}):\n\n${associationsInfo}`,
            [
              {
                text: 'OK',
                onPress: () => console.log('Usuario confirmó alert de asociaciones')
              }
            ]
          );
          
          return true;
        } catch (sharedError: any) {
          console.error('❌ Error cargando asociaciones:', sharedError);
          if (sharedError.message.includes('No tienes asociaciones activas')) {
            throw sharedError;
          }
          Alert.alert(
            '❌ Error',
            'Error al cargar asociaciones del usuario.\n\nDetalles: ' + sharedError.message,
            [
              {
                text: 'OK',
                onPress: () => console.log('Usuario confirmó alert de error')
              }
            ]
          );
          throw new Error('Error al cargar asociaciones del usuario');
        }
      } else {
        console.error('❌ Login failed:', response.data.message);
        throw new Error(response.data.message || 'Error en el servidor');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Prevenir que el error se propague como un error no manejado
      let errorMessage = 'Error inesperado';
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const message = error.response.data?.message;
        
        switch (status) {
          case 401:
            errorMessage = 'Usuario o contraseña incorrectos';
            break;
          case 404:
            errorMessage = 'Usuario no encontrado';
            break;
          case 422:
            errorMessage = message || 'Datos de entrada inválidos';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde';
            break;
          default:
            errorMessage = message || 'Error de conexión';
        }
      } else if (error.request) {
        // Error de red (sin respuesta del servidor)
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet';
      } else {
        // Otros errores
        errorMessage = error.message || 'Error inesperado';
      }
      
      // Crear un nuevo error con el mensaje procesado
      const processedError = new Error(errorMessage);
      processedError.name = 'LoginError';
      
      throw processedError;
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 Iniciando logout...');
      
      // Limpiar el token del cliente API
      setAuthToken(null);
      
      // Limpiar estado
      setToken(null);
      setUser(null);
      setAssociations([]);
      
      // Limpiar AsyncStorage
      await clearAuthData();
      
      console.log('✅ Logout completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      // Asegurar que el estado se limpie incluso si hay error
      setToken(null);
      setUser(null);
      setAssociations([]);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    associations,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 