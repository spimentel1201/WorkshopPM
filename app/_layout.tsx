import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [initialPath, setInitialPath] = useState(pathname);

  useEffect(() => {
    // Solo procesar redirecciones una vez que el estado de autenticación esté listo
    if (isLoading) {
      console.log('Cargando estado de autenticación...');
      return;
    }

    // Si ya estamos listos, manejar la navegación
    if (isReady) {
      // Si estamos en la ruta raíz, redirigir según autenticación
      if (pathname === '/') {
        console.log('Redirigiendo desde ruta raíz...');
        router.replace(isAuthenticated ? '/(tabs)' : '/login');
        return;
      }

      // Si el usuario no está autenticado y no está en la pantalla de login, redirigir a login
      if (!isAuthenticated && pathname !== '/login') {
        console.log('Redirigiendo a login...');
        router.replace('/login');
        return;
      }

      // Si el usuario está autenticado y está en la pantalla de login, redirigir a tabs
      if (isAuthenticated && pathname === '/login') {
        console.log('Redirigiendo a la aplicación...');
        router.replace('/(tabs)');
        return;
      }
    } else {
      // Marcar como listo después del primer render
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, pathname, router, isReady]);
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading || !isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade'
        }}
        initialRouteName={initialPath === '/login' ? 'login' : isAuthenticated ? '(tabs)' : 'login'}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}