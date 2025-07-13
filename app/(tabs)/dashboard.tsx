import { StyleSheet, Text, View, ScrollView, Dimensions, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { 
  ClipboardList, 
  Package, 
  Users, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface DashboardStats {
  pendingOrders: number;
  todaysSales: number;
  revenue: number;
  expenses: number;
  repairsCompleted: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  deviceType: string;
  customerName: string;
}

const mockStats: DashboardStats = {
  pendingOrders: 15,
  todaysSales: 2500,
  revenue: 12000,
  expenses: 3000,
  repairsCompleted: 12,
};

const mockRecentOrders: RecentOrder[] = [
  { id: '123', orderNumber: '#123', deviceType: 'Phone', customerName: 'Juan Pérez' },
  { id: '124', orderNumber: '#124', deviceType: 'Tablet', customerName: 'María López' },
  { id: '125', orderNumber: '#125', deviceType: 'Laptop', customerName: 'Carlos Rodríguez' },
  { id: '126', orderNumber: '#126', deviceType: 'Phone', customerName: 'Ana García' },
  { id: '127', orderNumber: '#127', deviceType: 'Tablet', customerName: 'Luis Martín' },
];

const salesData = [40, 65, 45, 80, 35]; // Mock weekly sales data
const repairsData = [8, 12, 9, 15, 6]; // Mock weekly repairs data

export default function DashboardScreen() {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockStats;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockRecentOrders;
    },
  });

  const StatCard = ({ title, value, icon, color = colors.primary[500] }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card style={[styles.statCard, isTablet && styles.statCardTablet]}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    </Card>
  );

  const QuickActionButton = ({ title, icon, onPress }: {
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} style={[styles.quickAction, isTablet && styles.quickActionTablet]}>
      <View style={styles.quickActionIcon}>
        {icon}
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );

  const BarChart = ({ data, color = colors.primary[500] }: { data: number[]; color?: string }) => {
    const maxValue = Math.max(...data);
    return (
      <View style={styles.chartContainer}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: (value / maxValue) * 60,
                  backgroundColor: color,
                }
              ]}
            />
            <Text style={styles.barLabel}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const LineChart = ({ data, color = colors.info }: { data: number[]; color?: string }) => {
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 200,
      y: 60 - (value / maxValue) * 60,
    }));

    const pathData = points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');

    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChart}>
          {/* Simple line representation using View components */}
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.linePoint,
                {
                  left: point.x,
                  top: point.y,
                  backgroundColor: color,
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.lineChartLabels}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label, index) => (
            <Text key={index} style={styles.chartLabel}>{label}</Text>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido, {user?.name}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>

      {/* Stats Cards */}
      <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<ClipboardList size={24} color={colors.warning} />}
          color={colors.warning}
        />
        <StatCard
          title="Today's Sales"
          value={`$${stats?.todaysSales?.toLocaleString() || 0}`}
          icon={<DollarSign size={24} color={colors.success} />}
          color={colors.success}
        />
        <StatCard
          title="Revenue"
          value={`$${stats?.revenue?.toLocaleString() || 0}`}
          icon={<TrendingUp size={24} color={colors.primary[500]} />}
          color={colors.primary[500]}
        />
        <StatCard
          title="Expenses"
          value={`$${stats?.expenses?.toLocaleString() || 0}`}
          icon={<TrendingUp size={24} color={colors.error} />}
          color={colors.error}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={[styles.quickActionsGrid, isTablet && styles.quickActionsGridTablet]}>
          <QuickActionButton
            title="Orders"
            icon={<ClipboardList size={24} color={colors.neutral[700]} />}
            onPress={() => router.push('/(tabs)')}
          />
          <QuickActionButton
            title="Inventory"
            icon={<Package size={24} color={colors.neutral[700]} />}
            onPress={() => router.push('/(tabs)/inventory')}
          />
          <QuickActionButton
            title="Clients"
            icon={<Users size={24} color={colors.neutral[700]} />}
            onPress={() => router.push('/(tabs)/users')}
          />
          <QuickActionButton
            title="Settings"
            icon={<Settings size={24} color={colors.neutral[700]} />}
            onPress={() => router.push('/(tabs)/settings')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Sales</Text>
            <Text style={styles.activityValue}>$2,500</Text>
            <Text style={styles.activityPeriod}>Today</Text>
          </View>
          <BarChart data={salesData} color={colors.primary[500]} />
        </Card>

        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Repairs Completed</Text>
            <Text style={styles.activityValue}>12</Text>
            <Text style={styles.activityPeriod}>This Week</Text>
          </View>
          <LineChart data={repairsData} color={colors.info} />
        </Card>
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <Card style={styles.alertCard}>
          <View style={styles.alertItem}>
            <Package size={20} color={colors.warning} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Inventory</Text>
              <Text style={styles.alertDescription}>Low stock on component X</Text>
            </View>
          </View>
        </Card>
        <Card style={styles.alertCard}>
          <View style={styles.alertItem}>
            <ClipboardList size={20} color={colors.error} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Urgent Orders</Text>
              <Text style={styles.alertDescription}>Order #123 is due tomorrow</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Last Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Orders</Text>
        {recentOrders?.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => router.push(`/orders/${order.id}`)}
            style={styles.orderItem}
          >
            <ClipboardList size={20} color={colors.neutral[600]} />
            <View style={styles.orderContent}>
              <Text style={styles.orderTitle}>
                Order {order.orderNumber} - Device: {order.deviceType}
              </Text>
              <Text style={styles.orderCustomer}>{order.customerName}</Text>
            </View>
            <ChevronRight size={16} color={colors.neutral[400]} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statsGridTablet: {
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    padding: 16,
  },
  statCardTablet: {
    width: '23%',
    marginHorizontal: '1%',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionsGridTablet: {
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionTablet: {
    width: '23%',
    marginHorizontal: '1%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
  },
  activityCard: {
    marginBottom: 16,
  },
  activityHeader: {
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  activityPeriod: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: colors.neutral[500],
  },
  lineChartContainer: {
    height: 80,
  },
  lineChart: {
    height: 60,
    position: 'relative',
    marginHorizontal: 8,
  },
  linePoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  lineChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: colors.neutral[500],
  },
  alertCard: {
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderContent: {
    marginLeft: 12,
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 12,
    color: colors.neutral[600],
  },
});