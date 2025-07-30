import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Home, ClipboardList, ShoppingCart, Settings, Users, Package, FileText } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { View, ActivityIndicator } from "react-native";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function TabLayout() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const [isRouterReady, setIsRouterReady] = useState(false);
  const router = useRouter();

  // Verificar si el router está listo
  useEffect(() => {
    const checkRouter = () => {
      try {
        if (router.canGoBack !== undefined) {
          setIsRouterReady(true);
        } else {
          setTimeout(checkRouter, 100);
        }
      } catch (error) {
        setTimeout(checkRouter, 100);
      }
    };
    checkRouter();
  }, []);

  // Efecto para manejar la redirección cuando el estado de autenticación cambia
  useEffect(() => {
    if (!isAuthLoading && isRouterReady) {
      if (!isAuthenticated) {router.replace('/login');}
    }
  }, [isAuthenticated, isAuthLoading, isRouterReady]);

  // Mostrar pantalla de carga mientras se verifica la autenticación o el router
  if (!isRouterReady || isAuthLoading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, no renderizar nada (ya que se redirigirá)
  if (!isAuthenticated) {
    return <LoadingScreen />; // Cambiado a LoadingScreen para una mejor UX
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary[500],
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Órdenes",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      
      {/* Páginas ocultas de la barra de pestañas */}
      <Tabs.Screen
        name="budgets"
        options={{
          href: null, // Esto oculta la pestaña pero mantiene la ruta accesible
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          href: null,
        }}
      />
      
      {/* Pestaña de Usuarios - Solo visible para administradores */}
      {user?.role === UserRole.ADMIN ? (
        <Tabs.Screen
          name="users"
          options={{
            title: "Usuarios",
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
      ) : (
        // Para roles no administradores, ocultar completamente la pestaña
        <Tabs.Screen
          name="users"
          options={{
            href: null,
          }}
        />
      )}
      
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}