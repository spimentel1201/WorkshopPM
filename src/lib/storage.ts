import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

// Función segura para guardar el token
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
    // En desarrollo, usamos AsyncStorage como respaldo
    if (__DEV__) {
      console.warn('Usando AsyncStorage como respaldo en desarrollo');
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      throw error;
    }
  }
};

// Función segura para obtener el token
export const getToken = async (): Promise<string | null> => {
  try {
    // Primero intentamos con SecureStore
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) return token;
    
    // Si no hay token en SecureStore, verificamos en AsyncStorage (solo en desarrollo)
    if (__DEV__) {
      const devToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (devToken) {
        // Migramos el token a SecureStore
        await SecureStore.setItemAsync(TOKEN_KEY, devToken);
        await AsyncStorage.removeItem(TOKEN_KEY);
        return devToken;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    if (__DEV__) {
      return AsyncStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
};

// Función segura para eliminar el token
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    // También eliminamos de AsyncStorage por si acaso
    if (__DEV__) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error al eliminar el token:', error);
    if (__DEV__) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      throw error;
    }
  }
};
