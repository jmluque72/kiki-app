import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken, setGlobalLogout } from '../src/services/api';
import { ActiveAssociationService, ActiveAssociation } from '../src/services/activeAssociationService';
import { HybridAuthService } from '../src/services/hybridAuthService';
import RefreshTokenService from '../src/services/refreshTokenService';
import { configureAmplify } from '../src/config/cognitoConfig';

interface User {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  isFirstLogin?: boolean;
  isCognitoUser?: boolean; // Nuevo campo para identificar usuarios de Cognito
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
  activeAssociation: ActiveAssociation | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  login: (userData: User) => void; // Sobrecarga para actualizar usuario
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshActiveAssociation: () => Promise<void>;
  updateUserAfterPasswordChange: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ASSOCIATIONS: 'auth_associations',
  ACTIVE_ASSOCIATION: 'auth_active_association'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [activeAssociation, setActiveAssociation] = useState<ActiveAssociation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos guardados al iniciar la app
  useEffect(() => {
    // Inicializar Amplify para Cognito
    console.log('🔧 Inicializando Amplify para Cognito...');
    const amplifyConfigured = configureAmplify();
    if (amplifyConfigured) {
      console.log('✅ Amplify configurado correctamente');
    } else {
      console.log('⚠️ Amplify no se pudo configurar, usando solo autenticación legacy');
    }
    
    loadStoredAuth();
  }, []);

  // Registrar la función de logout global para el manejo de errores 401
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('🔄 Cargando datos de autenticación guardados...');
      
      const [storedToken, storedUser, storedAssociations, storedActiveAssociation] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ASSOCIATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ASSOCIATION),
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
        console.log('   - Tipo:', userData.isCognitoUser ? 'Cognito' : 'Legacy');
        console.log('   - isFirstLogin:', userData.isFirstLogin);
        console.log('   - isFirstLogin tipo:', typeof userData.isFirstLogin);
        
        console.log('🏫 Asociaciones guardadas:', associationsData.length);
        associationsData.forEach((assoc: Association, index: number) => {
          console.log(`   ${index + 1}. Cuenta: ${assoc.account.nombre}`);
          console.log(`      División: ${assoc.division?.nombre || 'Sin división'}`);
          console.log(`      Estado: ${assoc.status}`);
        });
        
        setToken(storedToken);
        setUser(userData);
        setAssociations(associationsData);
        
        // Cargar asociación activa si existe
        if (storedActiveAssociation) {
          const activeAssociationData = JSON.parse(storedActiveAssociation);
          setActiveAssociation(activeAssociationData);
          console.log('🎯 Asociación activa cargada:', activeAssociationData.account.nombre);
        }
        
        // Configurar el token en el cliente API
        setAuthToken(storedToken);
      } else {
        console.log('❌ No se encontraron datos de autenticación guardados');
      }
    } catch (error) {
      console.error('❌ Error cargando datos de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshActiveAssociation = async () => {
    try {
      if (activeAssociation) {
        const refreshed = await ActiveAssociationService.getActiveAssociation();
        if (refreshed) {
          setActiveAssociation(refreshed);
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ASSOCIATION, JSON.stringify(refreshed));
        }
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error refrescando asociación activa:', error);
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
    
    // Si se pasa email y password, hacer login híbrido
    const email = emailOrUserData;
    if (!password) {
      throw new Error('Password es requerido para login');
    }
    
    try {
      console.log('🔐 Iniciando login híbrido para:', email);
      
      // Usar el servicio híbrido
      const loginResult = await HybridAuthService.login(email, password);
      
      console.log('🔍 [AuthContext] Resultado del login:', loginResult);
      
      if (!loginResult || !loginResult.success) {
        const errorMessage = loginResult?.error || 'Error en el login';
        console.error('❌ [AuthContext] Login falló:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Verificar que loginResult tiene la estructura esperada
      if (!loginResult.user || !loginResult.accessToken) {
        console.error('❌ [AuthContext] Estructura de respuesta inválida:', loginResult);
        throw new Error('Respuesta de login inválida del servidor');
      }
      
      const { 
        user: userData, 
        accessToken: newToken, 
        refreshToken: newRefreshToken,
        tokenExpiresIn,
        activeAssociation: activeAssociationData, 
        associations: userAssociations, 
        isCognitoUser 
      } = loginResult;
      
      console.log('✅ Login exitoso');
      console.log('👤 Perfil del usuario:');
      console.log('   - ID:', userData._id);
      console.log('   - Nombre:', userData.name);
      console.log('   - Email:', userData.email);
      console.log('   - Rol (del usuario):', userData.role.nombre);
      console.log('   - Descripción del rol:', userData.role.descripcion);
      console.log('   - Tipo de autenticación:', isCognitoUser ? 'Cognito' : 'Legacy');
      console.log('   - isFirstLogin:', userData.isFirstLogin);
      console.log('   - isFirstLogin tipo:', typeof userData.isFirstLogin);
      console.log('   - isFirstLogin === true:', userData.isFirstLogin === true);
      
      if (activeAssociationData) {
        console.log('🎯 Asociación activa recibida del login:');
        console.log('   - Cuenta:', activeAssociationData.account.nombre);
        console.log('   - División:', activeAssociationData.division?.nombre || 'Sin división');
        console.log('   - Rol activo:', activeAssociationData.role.nombre);
        console.log('   - Estudiante:', activeAssociationData.student?.name || 'Sin estudiante');
      } else {
        console.log('ℹ️ No hay asociación activa en el login');
      }
      
      console.log('🔑 Access token recibido:', newToken ? 'Token válido' : 'Sin token');
      console.log('🔄 Refresh token recibido:', newRefreshToken ? 'Token válido' : 'Sin token');
      console.log('⏰ Token expira en:', tokenExpiresIn, 'segundos');
      
      setToken(newToken);
      setUser(userData);
      
      // Guardar refresh tokens
      if (newRefreshToken && tokenExpiresIn) {
        await RefreshTokenService.saveTokens({
          accessToken: newToken,
          refreshToken: newRefreshToken,
          tokenExpiresIn: tokenExpiresIn,
          expiresAt: 0 // Se calcula automáticamente
        });
        console.log('💾 [AUTH CONTEXT] Refresh tokens guardados');
      }
      
      // Detectar primer login inmediatamente después del login
      if (userData.isFirstLogin) {
        console.log('🔑 [AUTH CONTEXT] ¡PRIMER LOGIN DETECTADO! Usuario debe cambiar contraseña');
      } else {
        console.log('🔑 [AUTH CONTEXT] Usuario ya cambió contraseña, continuando flujo normal');
      }
      
      // Configurar la asociación activa si viene del login
      if (activeAssociationData) {
        setActiveAssociation(activeAssociationData);
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ASSOCIATION, JSON.stringify(activeAssociationData));
      }
      
      // Configurar el token en el cliente API
      setAuthToken(newToken);
      
      // Guardar usuario y token en AsyncStorage
      // Solo guardar el token si no es null o undefined
      if (newToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      } else {
        console.warn('⚠️ [AuthContext] Token es null/undefined, no se guardará en AsyncStorage');
        // Si no hay token, eliminar el token anterior
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
      console.log('💾 [AUTH CONTEXT] Guardando usuario en AsyncStorage con isFirstLogin:', userData.isFirstLogin);
      console.log('💾 [AUTH CONTEXT] Tipo de isFirstLogin:', typeof userData.isFirstLogin);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      
      // Cargar asociaciones del usuario
      if (userAssociations && userAssociations.length > 0) {
        console.log('🏫 Asociaciones recibidas del login:', userAssociations.length);
        setAssociations(userAssociations);
        await AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(userAssociations));
      } else {
        console.log('🏫 Cargando asociaciones del usuario...');
        try {
          const sharedService = require('../src/services/sharedService').default;
          const userAssociations = await sharedService.getUserAssociations();
          
          console.log('✅ Asociaciones cargadas:', userAssociations.length);
          setAssociations(userAssociations);
          await AsyncStorage.setItem(STORAGE_KEYS.ASSOCIATIONS, JSON.stringify(userAssociations));
        } catch (assocError) {
          console.error('❌ Error cargando asociaciones:', assocError);
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 Cerrando sesión...');
      
      // Revocar refresh token en el servidor
      await RefreshTokenService.revokeRefreshToken();
      
      // Usar el servicio híbrido para logout
      await HybridAuthService.logout();
      
      // Limpiar estado local
      setUser(null);
      setToken(null);
      setAssociations([]);
      setActiveAssociation(null);
      
      // Limpiar AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.ASSOCIATIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_ASSOCIATION),
      ]);
      
      // Limpiar refresh tokens
      await RefreshTokenService.clearTokens();
      
      // Limpiar token del cliente API
      setAuthToken(null);
      
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  const updateUserAfterPasswordChange = () => {
    if (user) {
      const updatedUser = { ...user, isFirstLogin: false };
      setUser(updatedUser);
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    associations,
    activeAssociation,
    isLoading,
    login,
    logout,
    isAuthenticated,
    refreshActiveAssociation,
    updateUserAfterPasswordChange,
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
    console.error('❌ [useAuth] useAuth debe ser usado dentro de un AuthProvider');
    console.error('❌ [useAuth] Stack trace:', new Error().stack);
    // En lugar de lanzar error, retornar valores por defecto
    return {
      user: null,
      token: null,
      associations: [],
      activeAssociation: null,
      isLoading: true,
      login: async () => false,
      logout: async () => {},
      isAuthenticated: false,
      refreshActiveAssociation: async () => {},
      updateUserAfterPasswordChange: () => {}
    };
  }
  return context;
};

export default AuthContext;
