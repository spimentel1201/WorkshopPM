import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, User } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { User as UserType, UserRole } from '@/types/auth';

// Mock user data
const mockUser: UserType = {
  id: '2',
  name: 'Tech User',
  email: 'tech@example.com',
  role: UserRole.TECHNICIAN,
  createdAt: '2025-06-02T11:30:00Z',
  updatedAt: '2025-06-02T11:30:00Z',
};

interface EditUser {
  name: string;
  email: string;
  role: UserRole;
  changePassword: boolean;
  newPassword: string;
  confirmPassword: string;
}

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.TECHNICIAN, label: 'Técnico' },
];

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState<EditUser>({
    name: '',
    email: '',
    role: UserRole.TECHNICIAN,
    changePassword: false,
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<EditUser>>({});

  // Fetch user details
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockUser;
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setUser(prev => ({
        ...prev,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }));
    }
  }, [userData]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: EditUser) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { ...userData!, ...updatedUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      Alert.alert(
        'Éxito',
        'Usuario actualizado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EditUser> = {};

    if (!user.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!user.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (user.changePassword) {
      if (!user.newPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida';
      } else if (user.newPassword.length < 6) {
        newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!user.confirmPassword) {
        newErrors.confirmPassword = 'Confirme la nueva contraseña';
      } else if (user.newPassword !== user.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    updateUserMutation.mutate(user);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Usuario no encontrado</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Editar Usuario',
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
            <Text style={styles.title}>Editar Usuario</Text>
            <Text style={styles.subtitle}>
              Modifique la información del usuario
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
          <Text style={styles.sectionTitle}>Permisos</Text>
          
          <Select
            label="Rol del Usuario"
            placeholder="Seleccione el rol"
            value={user.role}
            onValueChange={(value) => setUser(prev => ({ ...prev, role: value as UserRole }))}
            options={roleOptions}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          
          <View style={styles.checkboxContainer}>
            <Button
              onPress={() => setUser(prev => ({ 
                ...prev, 
                changePassword: !prev.changePassword,
                newPassword: '',
                confirmPassword: ''
              }))}
              variant={user.changePassword ? 'primary' : 'outline'}
              size="sm"
            >
              {user.changePassword ? 'Cancelar cambio' : 'Cambiar contraseña'}
            </Button>
          </View>

          {user.changePassword && (
            <>
              <Input
                label="Nueva Contraseña"
                placeholder="Ingrese la nueva contraseña"
                value={user.newPassword}
                onChangeText={(value) => setUser(prev => ({ ...prev, newPassword: value }))}
                secureTextEntry
                error={errors.newPassword}
              />
              
              <Input
                label="Confirmar Nueva Contraseña"
                placeholder="Confirme la nueva contraseña"
                value={user.confirmPassword}
                onChangeText={(value) => setUser(prev => ({ ...prev, confirmPassword: value }))}
                secureTextEntry
                error={errors.confirmPassword}
              />
            </>
          )}
        </Card>

        <View style={styles.submitContainer}>
          <Button
            onPress={handleSubmit}
            loading={updateUserMutation.isPending}
            disabled={updateUserMutation.isPending}
            fullWidth
            leftIcon={<Save size={18} color={colors.white} />}
          >
            Actualizar Usuario
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  checkboxContainer: {
    marginBottom: 16,
  },
  submitContainer: {
    marginTop: 24,
  },
});