import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, Filter, ClipboardList } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';
import { RepairOrder, RepairStatus } from '@/types/repair';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | null>(null);

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
    
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    
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
            <Text style={styles.deviceName}>
              {device.brand} {device.model}
            </Text>
            <Text style={styles.deviceType}>
              {device.type.replace('_', ' ')}
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
              <Text style={styles.multipleDevices}>
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
      icon={<ClipboardList size={48} color={colors.neutral['400']} />}
      title="No hay órdenes de reparación"
      description="Crea una nueva orden para comenzar a gestionar las reparaciones."
      actionLabel="Crear Orden"
      onAction={handleCreateOrder}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.neutral['500']} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, teléfono..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <Button
          onPress={() => {/* Toggle filter modal */}}
          variant="outline"
          size="sm"
          leftIcon={<Filter size={18} color={colors.primary['500']} />}
        >
          Filtrar
        </Button>
      </View>

      {user?.role === UserRole.ADMIN && (
        <View style={styles.actionContainer}>
          <Button
            onPress={handleCreateOrder}
            leftIcon={<Plus size={18} color={colors.white} />}
          >
            Nueva Orden
          </Button>
        </View>
      )}

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
    borderColor: colors.neutral['300'],
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
  actionContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  listContainer: {
    flexGrow: 1,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.neutral['900'],
  },
  deviceInfo: {
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.neutral['800'],
  },
  deviceType: {
    fontSize: 14,
    color: colors.neutral['600'],
    marginBottom: 4,
  },
  issueText: {
    fontSize: 14,
    color: colors.neutral['700'],
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral['500'],
  },
  multipleDevices: {
    fontSize: 12,
    color: colors.primary['600'],
    fontWeight: '500' as const,
  },
});