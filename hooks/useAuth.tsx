import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { LoginRequest, LoginResponse, User } from '@/types/auth';

// Mock API functions - replace with actual API calls
const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
    return {
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'mock-jwt-token'
    };
  } else if (credentials.email === 'tech@example.com' && credentials.password === 'password') {
    return {
      user: {
        id: '2',
        name: 'Tech User',
        email: 'tech@example.com',
        role: 'TECHNICIAN' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'mock-jwt-token'
    };
  }
  
  throw new Error('Invalid credentials');
};

const logoutApi = async (): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get current user from storage
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userJson = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (!userJson || !token) {
        return null;
      }
      
      return JSON.parse(userJson) as User;
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);
      queryClient.setQueryData(['currentUser'], data.user);
      router.replace('/(tabs)');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      router.replace('/login');
    }
  });

  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loginMutation.isPending || logoutMutation.isPending || isLoading,
    login,
    logout,
    error: loginMutation.error
  };
};