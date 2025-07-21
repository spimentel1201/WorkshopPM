import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Alert, Pressable } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';
import { User, UserProfile, UserRole } from '@/types/auth';
import api from '@/src/lib/api';

interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Helper function to map API user to our User type
const mapApiUser = (user: ApiUser): UserProfile => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName
});

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch users from the backend
  const { data: users = [], isLoading, error } = useQuery<ApiUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<ApiUser[]>('/users');
      return response.data;
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
      return userId;
    },
    onSuccess: (deletedUserId) => {
      // Invalidate and refetch users
      queryClient.setQueryData<ApiUser[]>(['users'], (oldUsers = []) => 
        oldUsers.filter(user => user.id !== deletedUserId)
      );
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'No se pudo eliminar el usuario';
      Alert.alert('Error', errorMessage);
    },
  });

  // Filter users based on search query
  const filteredUsers = users
    .map(mapApiUser)
    .filter(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateUser = () => {
    router.push('/users/create');
  };

  const handleEditUser = (userId: string) => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Estás seguro que deseas eliminar a ${userName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: () => deleteUserMutation.mutate(userId),
          style: "destructive"
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <Card style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.firstName.charAt(0)}</Text>
        </View>
        <View style={styles.userData}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[
            styles.roleBadge,
            item.role === UserRole.ADMIN ? styles.adminBadge : styles.techBadge
          ]}>
            <Text style={styles.roleText}>
              {item.role === UserRole.ADMIN ? 'Administrador' : 'Técnico'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => handleEditUser(item.id)}
          leftIcon={<Edit size={16} color={colors.primary[500]} />}
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => handleDeleteUser(item.id, item.firstName)}
          leftIcon={<Trash2 size={16} color={colors.danger[500]} />}
          style={styles.deleteButton}
        >
          Eliminar
        </Button>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando usuarios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error al cargar los usuarios. Por favor, inténtalo de nuevo más tarde.
        </Text>
        <Button onPress={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios</Text>
        <Button
          onPress={handleCreateUser}
          leftIcon={<Plus size={18} color={colors.white} />}
        >
          Nuevo Usuario
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.neutral[500]}
        />
      </View>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users size={48} color={colors.neutral[400]} />}
          title="No se encontraron usuarios"
          description={searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay usuarios registrados'}
        />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.danger[500],
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text.primary,
  },
  listContent: {
    paddingBottom: 24,
  },
  userCard: {
    marginBottom: 12,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  userData: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadge: {
    backgroundColor: colors.primary[100],
  },
  techBadge: {
    backgroundColor: colors.secondary[100],
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  deleteButton: {
    marginLeft: 8,
  },
});