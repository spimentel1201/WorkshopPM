import { router } from 'expo-router';
import { ClipboardList, Filter, Plus, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { UserRole } from '@/types/auth';
import { RepairOrder, RepairOrderStatus } from '@/types/repair';

export default function RepairOrdersScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RepairOrderStatus | 'all'>('all');
  
  // Use the useOrders hook to fetch orders
  const { getOrders } = useOrders();
  const { data: orders = [], isLoading, error, refetch } = getOrders();

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm) ||
      order.customerPhone?.toLowerCase().includes(searchTerm) ||
      order.customerEmail?.toLowerCase().includes(searchTerm) ||
      order.id?.toLowerCase().includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    router.push('/orders/create');
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const renderOrderItem = ({ item }: { item: RepairOrder }) => {
    
    return (
      <Pressable onPress={() => handleOrderPress(item.id)}>
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.customerName}>{item.customerName || 'Cliente'}</Text>
            <StatusBadge status={item.status} />
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>
              {item.devices?.[0] ? `${item.devices[0].brand || ''} ${item.devices[0].model || ''}`.trim() : 'Sin dispositivo'}
            </Text>
            <Text style={styles.deviceIssue} numberOfLines={1}>
              {item.devices?.[0]?.reportedIssue || item.problemDescription || 'Sin descripción'}
            </Text>
          </View>
          
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              }) : 'Fecha no disponible'}
            </Text>
            <Text style={styles.orderId}>#{item.id ? item.id.slice(0, 6) : 'N/A'}</Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando órdenes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar las órdenes</Text>
        <Button onPress={() => refetch()} style={styles.retryButton}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes de Reparación</Text>
        {user?.role === UserRole.ADMIN && (
          <Button onPress={handleCreateOrder} style={styles.addButton}>
            <Plus size={20} color="white" />
            <Text style={styles.buttonText}>Nueva Orden</Text>
          </Button>
        )}
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.neutral[600]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar órdenes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.neutral[600]}
          />
        </View>
        
        <Pressable 
          style={styles.filterButton}
          onPress={() => {
            // TODO: Implement filter modal
          }}
        >
          <Filter size={20} color={colors.primary[500]} />
        </Pressable>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      ) : (
        <EmptyState
          icon={<ClipboardList size={48} color={colors.neutral[400]} />}
          title={
            searchQuery || selectedStatus !== 'all'
              ? 'No se encontraron resultados'
              : 'No hay órdenes registradas'
          }
          description={
            searchQuery || selectedStatus !== 'all'
              ? 'No hay órdenes que coincidan con tu búsqueda o filtros actuales.'
              : 'Comienza creando una nueva orden para verla aquí.'
          }
          actionLabel={
            searchQuery || selectedStatus !== 'all'
              ? 'Limpiar filtros'
              : user?.role === UserRole.ADMIN
              ? 'Crear primera orden'
              : undefined
          }
          onAction={
            searchQuery || selectedStatus !== 'all'
              ? () => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }
              : user?.role === UserRole.ADMIN
              ? handleCreateOrder
              : undefined
          }
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
    color: colors.error,
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
    color: colors.neutral[400],
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  ordersList: {
    paddingBottom: 24,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deviceInfo: {
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  deviceIssue: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  orderId: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
});