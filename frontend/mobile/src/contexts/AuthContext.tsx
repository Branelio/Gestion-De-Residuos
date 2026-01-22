/**
 * Contexto de autenticación para gestionar el usuario y token
 */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, LoginCredentials } from '../services/authService';
import { userService, User } from '../services/userService';
import { httpClient } from '../services/httpClient';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const TOKEN_KEY = '@LatacungaWaste:token';
const USER_KEY = '@LatacungaWaste:user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos almacenados al iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  // Configurar token en httpClient cuando cambie
  useEffect(() => {
    if (token) {
      httpClient.setAuthToken(token);
    } else {
      httpClient.clearAuthToken();
    }
  }, [token]);

  /**
   * Cargar token y usuario desde AsyncStorage
   */
  const loadStoredData = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        httpClient.setAuthToken(storedToken);
        
        // Refrescar datos del usuario en background
        try {
          const freshUser = await userService.getCurrentUser();
          setUser(freshUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } catch (error) {
          console.log('⚠️ No se pudo refrescar usuario, usando datos en caché');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando datos almacenados:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      const { token: newToken, user: userData } = response;
      
      // Guardar en estado
      setToken(newToken);
      setUser(userData);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Configurar token en httpClient
      httpClient.setAuthToken(newToken);
      
      console.log('✅ Login exitoso:', userData.name);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setLoading(true);
      
      // Limpiar estado
      setUser(null);
      setToken(null);
      
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      
      // Limpiar token del httpClient
      httpClient.clearAuthToken();
      
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar datos del usuario en el contexto
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  /**
   * Refrescar datos del usuario desde el servidor
   */
  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const freshUser = await userService.getCurrentUser();
      setUser(freshUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      console.log('✅ Usuario refrescado');
    } catch (error) {
      console.error('❌ Error refrescando usuario:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
