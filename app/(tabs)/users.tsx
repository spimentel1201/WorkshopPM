import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Alert, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';
import { User, UserRole } from '@/types/auth';

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Tech User',
    email: 'tech@example.com',
    role: UserRole.TECHNICIAN,
    createdAt: '2025-06-02T11:30:00Z',
    updatedAt: '2025-06-02T11:30:00Z',
  },
  {
    id: '3',
    name: 'Juan Técnico',
    email: 'juan@example.com',
    role: UserRole.TECHNICIAN,
    createdAt: '2025-06-03T09:15:00Z',
    updatedAt: '2025-06-03T09:15:00Z',
  },
];

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockUsers;
    },
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          onPress: () => {
            // Delete user logic would go here
            console.log(`Deleting user ${userId}`);
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userData}>
          <Text style={styles.userName}>{item.name}</Text>
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
        <Pressable onPress={() => handleEditUser(item.id)} style={styles.editButton}>
          <Edit size={16} color={colors.primary[500]} />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => handleDeleteUser(item.id, item.name)} style={styles.deleteButton}>
          <Trash2 size={16} color={colors.error} />
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Users size={48} color={colors.neutral[400]} />}
      title="No hay usuarios"
      description="Crea un nuevo usuario para comenzar a gestionar el acceso a la aplicación."
      actionLabel="Crear Usuario"
      onAction={handleCreateUser}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <Button
          onPress={handleCreateUser}
          leftIcon={<Plus size={18} color={colors.white} />}
        >
          Nuevo Usuario
        </Button>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    marginRight: 8,
    height: 40,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  userCard: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.white,
  },
  userData: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: colors.primary[100],
  },
  techBadge: {
    backgroundColor: colors.secondary[100],
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.neutral[800],
  },
  userActions: {
    flexDirection: 'row',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: 6,
    marginRight: 8,
  },
  editText: {
    color: colors.primary[500],
    marginLeft: 4,
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 6,
  },
  deleteText: {
    color: colors.error,
    marginLeft: 4,
    fontSize: 14,
  },
});