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
      console.log('Estado de autenticación:', { isAuthenticated, pathname });
      
      // Si estamos en la ruta raíz, redirigir según autenticación
      if (pathname === '/') {
        console.log('Redirigiendo desde ruta raíz...');
        router.replace(isAuthenticated ? '/(tabs)' : '/login');
        return;
      }

      // Si el usuario no está autenticado y no está en la pantalla de login, redirigir a login
      if (!isAuthenticated && pathname !== '/login') {
        console.log('Usuario no autenticado, redirigiendo a login...');
        // Usar replace para evitar que el usuario pueda volver atrás
        router.replace('/login');
        return;
      }

      // Si el usuario está autenticado y está en la pantalla de login, redirigir a tabs
      if (isAuthenticated && pathname === '/login') {
        console.log('Usuario autenticado, redirigiendo a la aplicación...');
        router.replace('/(tabs)');
        return;
      }
    } else {
      // Marcar como listo después del primer render
      console.log('Componente listo, estableciendo isReady a true');
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, pathname, router, isReady]);
  
  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading || !isReady) {
    console.log('Mostrando pantalla de carga...');
    return <LoadingScreen />;
  }

  console.log('Renderizando navegación...');
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false, // Deshabilitar gestos para evitar problemas de navegación
        }}
        screenListeners={{
          state: () => {
            // Forzar una actualización del estado de navegación
            return () => {};
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          redirect={!isAuthenticated}
        />
        <Stack.Screen 
          name="login" 
          redirect={isAuthenticated}
        />
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