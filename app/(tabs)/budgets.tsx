import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, FileText, DollarSign, CheckCircle, XCircle } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/EmptyState';
import colors from '../../constants/colors';
import { Budget } from '@/types/repair';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// Mock budgets data
const mockBudgets: Budget[] = [
  {
    id: '1',
    repairOrderId: '1',
    laborCost: 50,
    partsCost: 80,
    additionalCosts: 10,
    additionalCostsDescription: 'Limpieza especial',
    totalCost: 140,
    approved: false,
    createdAt: '2025-07-10T15:30:00Z',
    updatedAt: '2025-07-10T15:30:00Z',
  },
  {
    id: '2',
    repairOrderId: '2',
    laborCost: 75,
    partsCost: 120,
    additionalCosts: 0,
    totalCost: 195,
    approved: true,
    createdAt: '2025-07-09T11:20:00Z',
    updatedAt: '2025-07-11T14:45:00Z',
  },
  {
    id: '3',
    repairOrderId: '3',
    laborCost: 60,
    partsCost: 45,
    additionalCosts: 15,
    additionalCostsDescription: 'Transporte',
    totalCost: 120,
    approved: true,
    createdAt: '2025-07-08T09:15:00Z',
    updatedAt: '2025-07-12T10:30:00Z',
  },
];

// Mock repair orders for reference
const mockOrdersRef = {
  '1': { customerName: 'Juan Pérez', deviceInfo: 'Samsung Galaxy S21' },
  '2': { customerName: 'María López', deviceInfo: 'HP Pavilion' },
  '3': { customerName: 'Carlos Rodríguez', deviceInfo: 'LG Smart TV 55"' },
};

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch budgets
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBudgets;
    },
  });

  // Filter budgets based on search query
  const filteredBudgets = budgets?.filter(budget => {
    const orderRef = mockOrdersRef[budget.repairOrderId as keyof typeof mockOrdersRef];
    return orderRef?.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           orderRef?.deviceInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
           budget.id.includes(searchQuery);
  });

  const handleCreateBudget = () => {
    router.push('/budgets/create');
  };

  const handleBudgetPress = (budgetId: string) => {
    router.push(`/budgets/${budgetId}`);
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const orderRef = mockOrdersRef[item.repairOrderId as keyof typeof mockOrdersRef];
    
    return (
      <Pressable onPress={() => handleBudgetPress(item.id)}>
        <Card style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetInfo}>
              <Text style={styles.customerName}>{orderRef?.customerName || 'Cliente'}</Text>
              <Text style={styles.deviceInfo}>{orderRef?.deviceInfo || 'Dispositivo'}</Text>
            </View>
            <Badge 
              variant={item.approved ? 'success' : 'warning'} 
              text={item.approved ? 'Aprobado' : 'Pendiente'} 
            />
          </View>
          
          <View style={styles.costBreakdown}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Mano de obra:</Text>
              <Text style={styles.costValue}>${item.laborCost.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Repuestos:</Text>
              <Text style={styles.costValue}>${item.partsCost.toFixed(2)}</Text>
            </View>
            {item.additionalCosts > 0 && (
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Adicionales:</Text>
                <Text style={styles.costValue}>${item.additionalCosts.toFixed(2)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.budgetFooter}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${item.totalCost.toFixed(2)}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={<FileText size={48} color={colors.neutral[400]} />}
      title="No hay presupuestos"
      description="Crea un nuevo presupuesto para una orden de reparación."
      actionLabel={user?.role === UserRole.ADMIN ? "Crear Presupuesto" : undefined}
      onAction={user?.role === UserRole.ADMIN ? handleCreateBudget : undefined}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, dispositivo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {user?.role === UserRole.ADMIN && (
        <View style={styles.actionContainer}>
          <Button
            onPress={handleCreateBudget}
            leftIcon={<Plus size={18} color={colors.white} />}
          >
            Nuevo Presupuesto
          </Button>
        </View>
      )}

      <FlatList
        data={filteredBudgets}
        renderItem={renderBudgetItem}
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
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
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  deviceInfo: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  costBreakdown: {
    marginBottom: 12,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  costLabel: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  costValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[900],
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[800],
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
});