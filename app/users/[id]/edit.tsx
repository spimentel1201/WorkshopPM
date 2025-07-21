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
import { UserRole, UserProfile } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import api from '@/src/lib/api';

interface EditUser {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  changePassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const roleOptions = [
  { value: UserRole.ADMIN.toString(), label: 'Administrador' },
  { value: UserRole.TECHNICIAN.toString(), label: 'Técnico' },
];

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<EditUser>({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.TECHNICIAN,
    changePassword: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<EditUser>>({});
  const isCurrentUser = currentUser?.id === id;

  // Fetch user details
  const { data: userData, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/auth/profile');
      return response.data;
    },
    enabled: !!id,
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        email: userData.email,
        role: userData.role,
      }));
    }
  }, [userData]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: Partial<EditUser>) => {
      const updateData: any = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role as UserRole,
      };

      // Solo incluir campos de contraseña si se está cambiando
      if (updatedUser.changePassword) {
        updateData.currentPassword = updatedUser.currentPassword;
        updateData.newPassword = updatedUser.newPassword;
      }

      const response = await api.patch<UserProfile>('/users/' + id, updateData);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Actualizar el usuario en el contexto de autenticación
      updateAuthUser(updatedUser);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      
      Alert.alert(
        'Éxito',
        'Perfil actualizado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'No se pudo actualizar el perfil';
      Alert.alert('Error', errorMessage);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EditUser> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (formData.changePassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'La contraseña actual es requerida';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      updateUserMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof EditUser, value: string | boolean | UserRole) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar errores al editar
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Editar Perfil',
          headerRight: () => (
            <Button
              onPress={handleSubmit}
              variant="ghost"
              leftIcon={<Save size={20} color={colors.primary[500]} />}
              loading={updateUserMutation.isPending}
            >
              Guardar
            </Button>
          ),
        }}
      />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre</Text>
          <Input
            value={formData.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            placeholder="Nombre"
            error={errors.firstName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Apellido</Text>
          <Input
            value={formData.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            placeholder="Apellido"
            error={errors.lastName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <Input
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
        </View>

        {!isCurrentUser && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rol</Text>
            <Select
              value={formData.role.toString()}
              onValueChange={(value) => handleChange('role', value as UserRole)}
              options={roleOptions}
            />
          </View>
        )}

        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          <Button
            variant="ghost"
            onPress={() => handleChange('changePassword', !formData.changePassword)}
          >
            {formData.changePassword ? 'Ocultar' : 'Cambiar Contraseña'}
          </Button>
        </View>

        {formData.changePassword && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña Actual</Text>
              <Input
                value={formData.currentPassword}
                onChangeText={(text) => handleChange('currentPassword', text)}
                placeholder="••••••••"
                secureTextEntry
                error={errors.currentPassword}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <Input
                value={formData.newPassword}
                onChangeText={(text) => handleChange('newPassword', text)}
                placeholder="••••••••"
                secureTextEntry
                error={errors.newPassword}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
              <Input
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                placeholder="••••••••"
                secureTextEntry
                error={errors.confirmPassword}
              />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            loading={updateUserMutation.isPending}
            disabled={updateUserMutation.isPending}
            leftIcon={<Save size={18} />}
          >
            Guardar Cambios
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text.primary,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.text.secondary,
  },
  sectionDivider: {
    marginTop: 24,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
});