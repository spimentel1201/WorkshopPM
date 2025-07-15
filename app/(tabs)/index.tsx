import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, Filter, ClipboardList } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { RepairOrder, RepairStatus } from '@/types/repair';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { UserRole } from '@/types/auth';
import type { ColorScheme } from '@/constants/colors';

// Mock data for repair orders
const mockRepairOrders: RepairOrder[] = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    customerPhone: '987654321',
    customerEmail: 'juan@example.com',
    devices: [
      {
        id: '1',
        brand: 'Samsung',
        model: 'Galaxy S21',
        serialNumber: 'SN12345678',
        type: 'SMARTPHONE' as any,
        reviewCost: 25,
        reportedIssue: 'Pantalla rota',
        accessories: [
          { id: '1', name: 'Cargador', included: true },
          { id: '2', name: 'Auriculares', included: false },
        ],
      },
    ],
    status: RepairStatus.PENDING,
    technicianId: '2',
    technicianName: 'Tech User',
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-10T10:00:00Z',
  },
  {
    id: '2',
    customerName: 'María López',
    customerPhone: '987123456',
    customerEmail: 'maria@example.com',
    devices: [
      {
        id: '2',
        brand: 'HP',
        model: 'Pavilion',
        serialNumber: 'HP98765432',
        type: 'LAPTOP' as any,
        reviewCost: 35,
        reportedIssue: 'No enciende',
        accessories: [
          { id: '3', name: 'Cargador', included: true },
        ],
      },
    ],
    status: RepairStatus.IN_PROGRESS,
    technicianId: '2',
    technicianName: 'Tech User',
    createdAt: '2025-07-09T14:30:00Z',
    updatedAt: '2025-07-11T09:15:00Z',
  },
  {
    id: '3',
    customerName: 'Carlos Rodríguez',
    customerPhone: '912345678',
    customerEmail: 'carlos@example.com',
    devices: [
      {
        id: '3',
        brand: 'LG',
        model: 'Smart TV 55"',
        serialNumber: 'LG87654321',
        type: 'TV' as any,
        reviewCost: 40,
        reportedIssue: 'Sin imagen',
        accessories: [
          { id: '4', name: 'Control remoto', included: true },
          { id: '5', name: 'Base', included: true },
        ],
      },
    ],
    status: RepairStatus.COMPLETED,
    technicianId: '2',
    technicianName: 'Tech User',
    createdAt: '2025-07-08T11:45:00Z',
    updatedAt: '2025-07-12T16:20:00Z',
    completedAt: '2025-07-12T16:20:00Z',
    totalCost: 120,
  },
];

export default function RepairOrdersScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'ALL'>('ALL');

  const styles = getStyles(theme);

  // Fetch repair orders
  const { data: repairOrders, isLoading } = useQuery({
    queryKey: ['repairOrders'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter orders for technicians to only show their assigned orders
      if (user?.role === UserRole.TECHNICIAN) {
        return mockRepairOrders.filter(order => order.technicianId === user.id);
      }
      
      return mockRepairOrders;
    },
  });

  // Filter orders based on search query and status filter
  const filteredOrders = repairOrders?.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.devices.some(device => 
        device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'ALL' ? true : order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    // Navigate to create order screen
    router.push('/orders/create');
  };

  const handleOrderPress = (orderId: string) => {
    // Navigate to order details screen
    router.push(`/orders/${orderId}`);
  };

  const renderOrderItem = ({ item }: { item: RepairOrder }) => {
    const device = item.devices[0]; // Show first device info
    
    return (
      <Pressable onPress={() => handleOrderPress(item.id)}>
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <StatusBadge status={item.status} />
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceBrand}>
              {device.brand} {device.model}
            </Text>
            <Text style={styles.deviceType}>
              {device.type?.replace('_', ' ') || ''}
            </Text>
          </View>
          
          <Text style={styles.issueText} numberOfLines={2}>
            {device.reportedIssue}
          </Text>
          
          <View style={styles.orderFooter}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.devices.length > 1 && (
              <Text style={[styles.multipleDevices, { color: theme.primary[600] }]}>
                +{item.devices.length - 1} dispositivos más
              </Text>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={<ClipboardList size={48} color={theme.text.tertiary} />}
      title="No hay órdenes de reparación"
      description="Crea una nueva orden para comenzar a gestionar las reparaciones."
      actionLabel="Crear Orden"
      onAction={handleCreateOrder}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes de Reparación</Text>
        {user?.role === UserRole.ADMIN && (
          <Button
            onPress={() => router.push('/orders/create')}
            size="sm"
            leftIcon={<Plus size={16} color={theme.white} />}
          >
            Nueva Orden
          </Button>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.input.text }]}
            placeholder="Buscar órdenes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.text.tertiary}
          />
        </View>
        <Button 
          onPress={() => {}} 
          variant="outline" 
          size="sm"
        >
          <Filter size={16} color={theme.primary[500]} />
        </Button>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterButton, 
            statusFilter === 'ALL' && {
              ...styles.activeFilter,
              backgroundColor: theme.primary[500]
            }
          ]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text style={[
            styles.filterText, 
            { color: theme.text.primary },
            statusFilter === 'ALL' && {
              ...styles.activeFilterText,
              color: theme.white
            }
          ]}>
            Todas
          </Text>
        </Pressable>
        {Object.values(RepairStatus).map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterButton, 
              statusFilter === status && {
                ...styles.activeFilter,
                backgroundColor: theme.primary[500]
              }
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[
              styles.filterText, 
              { color: theme.text.primary },
              statusFilter === status && {
                ...styles.activeFilterText,
                color: theme.white
              }
            ]}>
              {status === 'PENDING' ? 'Pendientes' : 
               status === 'IN_PROGRESS' ? 'En Progreso' :
               status === 'COMPLETED' ? 'Completadas' :
               status === 'DELIVERED' ? 'Entregadas' : 'Canceladas'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const getStyles = (theme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: theme.surface,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
    borderWidth: 1,
    borderColor: theme.input.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 16,
    color: theme.input.text,
    backgroundColor: 'transparent',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    backgroundColor: theme.surface,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: theme.input.background,
  },
  activeFilter: {
    backgroundColor: theme.primary[500],
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: theme.white,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    marginBottom: 12,
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 16,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceInfo: {
    marginBottom: 4,
  },
  deviceBrand: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: theme.text.primary,
  },
  deviceType: {
    fontSize: 13,
    color: theme.text.secondary,
    marginTop: 2,
  },
  issueText: {
    fontSize: 14,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  multipleDevices: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: theme.text.secondary,
  },
});