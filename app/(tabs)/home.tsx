import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  Plus, 
  Package, 
  Wrench, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { RepairStatus } from '@/types/repair';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Mock data for dashboard
const mockStats = {
  totalOrders: 156,
  pendingOrders: 23,
  completedOrders: 98,
  totalRevenue: 15420,
  monthlyGrowth: 12.5,
  lowStockItems: 8,
  activeUsers: 12,
};

const mockRecentOrders = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    deviceType: 'Laptop HP',
    status: RepairStatus.IN_PROGRESS,
    createdAt: '2025-01-13T10:30:00Z',
    estimatedCompletion: '2025-01-15T16:00:00Z',
  },
  {
    id: '2',
    customerName: 'María González',
    deviceType: 'iPhone 12',
    status: RepairStatus.PENDING,
    createdAt: '2025-01-13T09:15:00Z',
    estimatedCompletion: '2025-01-14T14:00:00Z',
  },
  {
    id: '3',
    customerName: 'Carlos Rodriguez',
    deviceType: 'Samsung TV',
    status: RepairStatus.COMPLETED,
    createdAt: '2025-01-12T14:20:00Z',
    estimatedCompletion: '2025-01-13T12:00:00Z',
  },
];

const mockLowStockItems = [
  { id: '1', name: 'Pantalla iPhone 12', stock: 2, minStock: 5 },
  { id: '2', name: 'Batería MacBook Pro', stock: 1, minStock: 3 },
  { id: '3', name: 'Memoria RAM 8GB', stock: 0, minStock: 4 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockRecentOrders;
    },
  });

  const { data: lowStockItems, isLoading: stockLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockLowStockItems;
    },
  });

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.PENDING: return theme.warning;
      case RepairStatus.IN_PROGRESS: return theme.info;
      case RepairStatus.COMPLETED: return theme.success;
      case RepairStatus.DELIVERED: return theme.primary[600];
      case RepairStatus.CANCELLED: return theme.error;
      default: return theme.neutral[500];
    }
  };

  const getStatusText = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.PENDING: return 'Pendiente';
      case RepairStatus.IN_PROGRESS: return 'En Progreso';
      case RepairStatus.COMPLETED: return 'Completado';
      case RepairStatus.DELIVERED: return 'Entregado';
      case RepairStatus.CANCELLED: return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend, 
    onPress 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string; 
    trend?: number; 
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.statHeader}>
          <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            {icon}
          </View>
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <TrendingUp size={12} color={trend >= 0 ? theme.success : theme.error} />
              <Text style={[styles.trendText, { color: trend >= 0 ? theme.success : theme.error }]}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.text.secondary }]}>{title}</Text>
      </Card>
    </Pressable>
  );

  const QuickActionCard = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    color: string; 
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress}>
      <Card style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.actionIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={[styles.actionTitle, { color: theme.text.primary }]}>{title}</Text>
      </Card>
    </Pressable>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.text.secondary }]}>
            {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
          </Text>
          <Text style={[styles.userName, { color: theme.text.primary }]}>
            {user?.name || 'Usuario'}
          </Text>
        </View>
        <View style={[styles.dateContainer, { backgroundColor: theme.primary[500] }]}>
          <Calendar size={16} color={theme.white} />
          <Text style={[styles.dateText, { color: theme.white }]}>
            {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Órdenes Totales"
          value={stats?.totalOrders || 0}
          icon={<Wrench size={20} color={theme.primary[500]} />}
          color={theme.primary[500]}
          onPress={() => router.push('/(tabs)')}
        />
        <StatCard
          title="Pendientes"
          value={stats?.pendingOrders || 0}
          icon={<Clock size={20} color={theme.warning} />}
          color={theme.warning}
          onPress={() => router.push('/(tabs)')}
        />
        <StatCard
          title="Completadas"
          value={stats?.completedOrders || 0}
          icon={<CheckCircle size={20} color={theme.success} />}
          color={theme.success}
          onPress={() => router.push('/(tabs)')}
        />
        <StatCard
          title="Ingresos"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={<DollarSign size={20} color={theme.info} />}
          color={theme.info}
          trend={stats?.monthlyGrowth}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <QuickActionCard
            title="Nueva Orden"
            icon={<Plus size={24} color={theme.white} />}
            color={theme.primary[500]}
            onPress={() => router.push('/orders/create')}
          />
          <QuickActionCard
            title="Inventario"
            icon={<Package size={24} color={theme.white} />}
            color={theme.secondary[500]}
            onPress={() => router.push('/(tabs)/inventory')}
          />
          {user?.role === UserRole.ADMIN && (
            <QuickActionCard
              title="Usuarios"
              icon={<Users size={24} color={theme.white} />}
              color={theme.info}
              onPress={() => router.push('/(tabs)/users')}
            />
          )}
          <QuickActionCard
            title="Reportes"
            icon={<BarChart3 size={24} color={theme.white} />}
            color={theme.warning}
            onPress={() => {/* Navigate to reports */}}
          />
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Órdenes Recientes</Text>
          <Button
            onPress={() => router.push('/(tabs)')}
            variant="outline"
            size="sm"
          >
            Ver todas
          </Button>
        </View>
        
        <Card style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          {recentOrders?.map((order, index) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/orders/${order.id}`)}
              style={[
                styles.orderItem,
                index < recentOrders.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
              ]}
            >
              <View style={styles.orderInfo}>
                <Text style={[styles.orderCustomer, { color: theme.text.primary }]}>
                  {order.customerName}
                </Text>
                <Text style={[styles.orderDevice, { color: theme.text.secondary }]}>
                  {order.deviceType}
                </Text>
                <Text style={[styles.orderDate, { color: theme.text.tertiary }]}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
              <View style={styles.orderStatus}>
                <Badge
                  variant={order.status === RepairStatus.COMPLETED ? 'success' : 
                          order.status === RepairStatus.IN_PROGRESS ? 'info' : 'warning'}
                  text={getStatusText(order.status)}
                />
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color={theme.warning} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary, marginLeft: 8 }]}>
                Stock Bajo
              </Text>
            </View>
            <Button
              onPress={() => router.push('/(tabs)/inventory')}
              variant="outline"
              size="sm"
            >
              Ver inventario
            </Button>
          </View>
          
          <Card style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            {lowStockItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.stockItem,
                  index < lowStockItems.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
                ]}
              >
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockName, { color: theme.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.stockLevel, { color: theme.text.secondary }]}>
                    Stock: {item.stock} / Mín: {item.minStock}
                  </Text>
                </View>
                <Badge
                  variant={item.stock === 0 ? 'error' : 'warning'}
                  text={item.stock === 0 ? 'Sin stock' : 'Bajo'}
                />
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Performance Indicator */}
      <Card style={[styles.performanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.performanceHeader}>
          <Activity size={20} color={theme.primary[500]} />
          <Text style={[styles.performanceTitle, { color: theme.text.primary }]}>
            Rendimiento del Mes
          </Text>
        </View>
        <View style={styles.performanceStats}>
          <View style={styles.performanceStat}>
            <Text style={[styles.performanceValue, { color: theme.success }]}>
              {stats?.completedOrders || 0}
            </Text>
            <Text style={[styles.performanceLabel, { color: theme.text.secondary }]}>
              Completadas
            </Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={[styles.performanceValue, { color: theme.warning }]}>
              {stats?.pendingOrders || 0}
            </Text>
            <Text style={[styles.performanceLabel, { color: theme.text.secondary }]}>
              Pendientes
            </Text>
          </View>
          <View style={styles.performanceStat}>
            <Text style={[styles.performanceValue, { color: theme.primary[500] }]}>
              ${stats?.totalRevenue?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.performanceLabel, { color: theme.text.secondary }]}>
              Ingresos
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.primary[500],
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: theme.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: isTablet ? 200 : (width - 44) / 2,
    padding: 16,
    marginVertical: 0,
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: isTablet ? 150 : (width - 44) / 2,
    alignItems: 'center',
    padding: 20,
    marginVertical: 0,
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.text.primary,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 2,
  },
  orderDevice: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
  orderStatus: {
    marginLeft: 12,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 2,
  },
  stockLevel: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  performanceCard: {
    padding: 20,
    marginVertical: 0,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
  },
});