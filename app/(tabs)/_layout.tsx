import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Home, ClipboardList, ShoppingCart, Settings, Users, Package, FileText } from "lucide-react-native";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [isRouterReady, setIsRouterReady] = useState(false);

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

  useEffect(() => {
    if (isRouterReady && !isAuthenticated) {
      try {
        router.replace('/login');
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    }
  }, [isAuthenticated, isRouterReady]);

  if (!isAuthenticated || !isRouterReady) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary[500],
        tabBarInactiveTintColor: theme.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.text.primary,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerTintColor: theme.text.primary,
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
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Presupuestos",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: "Ventas",
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventario",
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      {user?.role === UserRole.ADMIN && (
        <Tabs.Screen
          name="users"
          options={{
            title: "Usuarios",
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
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