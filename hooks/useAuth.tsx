import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoginRequest, AuthState, User, UserProfile } from '@/types/auth';
import api from '../src/lib/api';
import { saveToken, getToken as getStoredToken, removeToken } from '../src/lib/storage';

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          try {
            // Intentamos obtener el perfil del usuario
            const response = await api.get<UserProfile>('/auth/profile');
            
            // Si llegamos aquí, el token es válido pero puede que no haya datos de usuario
            setState({
              user: response.data || null, // Aceptamos null como usuario válido
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            // Si el error es 204, el token es válido pero no hay datos de usuario
            if (error.response?.status === 204) {
              setState({
                user: null,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              throw error;
            }
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        await removeToken();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Iniciando sesión con credenciales:', credentials);
      const response = await api.post<{ access_token: string; user: UserProfile }>('/auth/login', credentials);
      
      if (!response.data || !response.data.access_token) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      console.log('Token recibido, guardando...');
      await saveToken(response.data.access_token);
      
      console.log('Actualizando estado de autenticación...');
      // Crear un nuevo objeto de estado para forzar la actualización
      const newState = {
        user: response.data.user,
        token: response.data.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
      
      console.log('Nuevo estado de autenticación:', newState);
      setState(newState);
      
      return response.data.user;
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    console.log('Iniciando proceso de cierre de sesión...');
    
    try {
      // Limpiar el token de autenticación
      console.log('Eliminando token de autenticación...');
      await removeToken();
      
      // Actualizar el estado
      console.log('Actualizando estado de autenticación...');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.log('Cierre de sesión completado con éxito');
      return true;
      
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      
      // Intentar limpiar el estado de todos modos
      try {
        await removeToken();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error al cerrar sesión',
        });
      } catch (cleanupError) {
        console.error('Error al limpiar el estado después de un error:', cleanupError);
      }
      
      return false;
    }
  }, []);

  return {
    ...state,
    login,
    logout,
  };
};