import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

// Determinar si estamos en web o móvil
const isWeb = Platform.OS === 'web';

// Función segura para guardar el token
export const saveToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      // En web, usamos localStorage
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // En móvil, usamos SecureStore con fallback a AsyncStorage
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } catch (error) {
        console.warn('Error con SecureStore, usando AsyncStorage:', error);
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    }
  } catch (error) {
    console.error('Error al guardar el token:', error);
    throw error;
  }
};

// Función segura para obtener el token
export const getToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      // En web, usamos localStorage
      return localStorage.getItem(TOKEN_KEY);
    }
    
    // En móvil, intentamos primero con SecureStore
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
    } catch (error) {
      console.warn('Error con SecureStore, intentando con AsyncStorage:', error);
    }
    
    // Si llegamos aquí, SecureStore falló o no hay token
    return AsyncStorage.getItem(TOKEN_KEY);
    
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

// Función segura para eliminar el token
export const removeToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      // En web, eliminamos de localStorage
      localStorage.removeItem(TOKEN_KEY);
    } else {
      // En móvil, eliminamos de ambos lugares por si acaso
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch (error) {
        console.warn('Error al eliminar de SecureStore:', error);
      }
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar el token:', error);
    throw error;
  }
};
