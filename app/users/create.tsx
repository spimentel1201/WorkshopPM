import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Save, User } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { UserRole } from '@/types/auth';

interface NewUser {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.TECHNICIAN, label: 'Técnico' },
];

export default function CreateUserScreen() {
  const [user, setUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.TECHNICIAN,
  });

  const [errors, setErrors] = useState<Partial<NewUser>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<NewUser> = {};

    if (!user.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!user.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!user.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (user.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!user.confirmPassword) {
      newErrors.confirmPassword = 'Confirme la contraseña';
    } else if (user.password !== user.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito',
        'Usuario creado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Nuevo Usuario',
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <User size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.title}>Crear Nuevo Usuario</Text>
            <Text style={styles.subtitle}>
              Complete la información para crear una nueva cuenta de usuario
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <Input
            label="Nombre Completo"
            placeholder="Ingrese el nombre completo"
            value={user.name}
            onChangeText={(value) => setUser(prev => ({ ...prev, name: value }))}
            error={errors.name}
          />
          
          <Input
            label="Correo Electrónico"
            placeholder="correo@ejemplo.com"
            value={user.email}
            onChangeText={(value) => setUser(prev => ({ ...prev, email: value }))}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
          
          <Input
            label="Contraseña"
            placeholder="Ingrese la contraseña"
            value={user.password}
            onChangeText={(value) => setUser(prev => ({ ...prev, password: value }))}
            secureTextEntry
            error={errors.password}
          />
          
          <Input
            label="Confirmar Contraseña"
            placeholder="Confirme la contraseña"
            value={user.confirmPassword}
            onChangeText={(value) => setUser(prev => ({ ...prev, confirmPassword: value }))}
            secureTextEntry
            error={errors.confirmPassword}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Permisos</Text>
          
          <Select
            label="Rol del Usuario"
            placeholder="Seleccione el rol"
            value={user.role}
            onValueChange={(value) => setUser(prev => ({ ...prev, role: value as UserRole }))}
            options={roleOptions}
          />

          <View style={styles.roleDescription}>
            <Text style={styles.roleDescriptionTitle}>Descripción del Rol:</Text>
            {user.role === UserRole.ADMIN ? (
              <Text style={styles.roleDescriptionText}>
                • Acceso completo al sistema{'\n'}
                • Gestión de usuarios{'\n'}
                • Configuración del sistema{'\n'}
                • Reportes y estadísticas
              </Text>
            ) : (
              <Text style={styles.roleDescriptionText}>
                • Gestión de órdenes de reparación{'\n'}
                • Actualización de estados{'\n'}
                • Creación de presupuestos{'\n'}
                • Acceso limitado a configuraciones
              </Text>
            )}
          </View>
        </Card>

        <View style={styles.submitContainer}>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            leftIcon={<Save size={18} color={colors.white} />}
          >
            Crear Usuario
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 16,
  },
  roleDescription: {
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  roleDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[800],
    marginBottom: 8,
  },
  roleDescriptionText: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  submitContainer: {
    marginTop: 24,
  },
});