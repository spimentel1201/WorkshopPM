import { StyleSheet, Text, View, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useState } from 'react';
import { LogOut, User, Bell, Moon, Sun, Smartphone, HelpCircle, Info } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Cerrar Sesión", 
          onPress: () => logout(),
          style: "destructive"
        }
      ]
    );
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return <Sun size={20} color={theme.text.secondary} />;
      case 'dark': return <Moon size={20} color={theme.text.secondary} />;
      case 'system': return <Smartphone size={20} color={theme.text.secondary} />;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'system': return 'Sistema';
    }
  };

  const handleThemeChange = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Cuenta</Text>
        <Card>
          <View style={styles.profileSection}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.primary[500] }]}>
              <Text style={[styles.profileInitial, { color: theme.white }]}>{user?.name.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text.primary }]}>{user?.name || 'Usuario'}</Text>
              <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>{user?.email || 'correo@ejemplo.com'}</Text>
              <Text style={[styles.profileRole, { color: theme.primary[600] }]}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Técnico'}
              </Text>
            </View>
          </View>
          <Button
            onPress={() => {/* Navigate to profile edit */}}
            variant="outline"
            leftIcon={<User size={18} color={theme.primary[500]} />}
          >
            Editar Perfil
          </Button>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Preferencias</Text>
        <Card>
          <View style={[styles.preferenceItem, { borderBottomColor: theme.border }]}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={theme.text.secondary} />
              <Text style={[styles.preferenceText, { color: theme.text.primary }]}>Notificaciones</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.neutral[300], true: theme.primary[300] }}
              thumbColor={notificationsEnabled ? theme.primary[500] : theme.neutral[100]}
            />
          </View>
          
          <Pressable onPress={handleThemeChange} style={[styles.preferenceItem, { borderBottomColor: theme.border }]}>
            <View style={styles.preferenceInfo}>
              {getThemeIcon()}
              <Text style={[styles.preferenceText, { color: theme.text.primary }]}>Tema</Text>
            </View>
            <Text style={[styles.themeValue, { color: theme.text.secondary }]}>{getThemeLabel()}</Text>
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Soporte</Text>
        <Card>
          <Pressable style={[styles.supportItem, { borderBottomColor: theme.border }]}>
            <HelpCircle size={20} color={theme.text.secondary} />
            <Text style={[styles.supportText, { color: theme.text.primary }]}>Centro de Ayuda</Text>
          </Pressable>
          
          <Pressable style={[styles.supportItem, { borderBottomColor: 'transparent' }]}>
            <Info size={20} color={theme.text.secondary} />
            <Text style={[styles.supportText, { color: theme.text.primary }]}>Acerca de la Aplicación</Text>
          </Pressable>
        </Card>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          onPress={handleLogout}
          variant="outline"
          leftIcon={<LogOut size={18} color={theme.error} />}
        >
          <Text style={{ color: theme.error }}>Cerrar Sesión</Text>
        </Button>
      </View>

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.text.tertiary }]}>Versión 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    marginLeft: 12,
  },
  themeValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  supportText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
  },
});