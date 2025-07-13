import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Save, Calculator } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { RepairOrder, RepairStatus } from '@/types/repair';

// Mock repair orders for selection
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
        accessories: [],
      },
    ],
    status: RepairStatus.IN_PROGRESS,
    technicianId: '2',
    technicianName: 'Tech User',
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-10T10:00:00Z',
  },
  {
    id: '4',
    customerName: 'Ana García',
    customerPhone: '987111222',
    customerEmail: 'ana@example.com',
    devices: [
      {
        id: '4',
        brand: 'Dell',
        model: 'Inspiron',
        serialNumber: 'DL98765432',
        type: 'LAPTOP' as any,
        reviewCost: 30,
        reportedIssue: 'Teclado no funciona',
        accessories: [],
      },
    ],
    status: RepairStatus.IN_PROGRESS,
    technicianId: '2',
    technicianName: 'Tech User',
    createdAt: '2025-07-11T14:20:00Z',
    updatedAt: '2025-07-11T14:20:00Z',
  },
];

interface NewBudget {
  repairOrderId: string;
  laborCost: string;
  partsCost: string;
  additionalCosts: string;
  additionalCostsDescription: string;
}

export default function CreateBudgetScreen() {
  const [budget, setBudget] = useState<NewBudget>({
    repairOrderId: '',
    laborCost: '',
    partsCost: '',
    additionalCosts: '0',
    additionalCostsDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available repair orders
  const { data: repairOrders } = useQuery({
    queryKey: ['repairOrdersForBudget'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Only return orders that are in progress and don't have budgets yet
      return mockRepairOrders.filter(order => order.status === RepairStatus.IN_PROGRESS);
    },
  });

  const orderOptions = repairOrders?.map(order => ({
    value: order.id,
    label: `${order.customerName} - ${order.devices[0]?.brand} ${order.devices[0]?.model}`,
  })) || [];

  const selectedOrder = repairOrders?.find(order => order.id === budget.repairOrderId);

  const calculateTotal = (): number => {
    const labor = parseFloat(budget.laborCost) || 0;
    const parts = parseFloat(budget.partsCost) || 0;
    const additional = parseFloat(budget.additionalCosts) || 0;
    return labor + parts + additional;
  };

  const validateForm = (): boolean => {
    if (!budget.repairOrderId) {
      Alert.alert('Error', 'Debe seleccionar una orden de reparación');
      return false;
    }
    if (!budget.laborCost || isNaN(Number(budget.laborCost))) {
      Alert.alert('Error', 'El costo de mano de obra debe ser un número válido');
      return false;
    }
    if (!budget.partsCost || isNaN(Number(budget.partsCost))) {
      Alert.alert('Error', 'El costo de repuestos debe ser un número válido');
      return false;
    }
    if (budget.additionalCosts && isNaN(Number(budget.additionalCosts))) {
      Alert.alert('Error', 'Los costos adicionales deben ser un número válido');
      return false;
    }
    if (parseFloat(budget.additionalCosts) > 0 && !budget.additionalCostsDescription.trim()) {
      Alert.alert('Error', 'Debe describir los costos adicionales');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito',
        'Presupuesto creado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el presupuesto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Nuevo Presupuesto',
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <Text style={styles.sectionTitle}>Seleccionar Orden</Text>
          
          <Select
            label="Orden de Reparación"
            placeholder="Seleccione una orden"
            value={budget.repairOrderId}
            onValueChange={(value) => setBudget(prev => ({ ...prev, repairOrderId: value }))}
            options={orderOptions}
          />

          {selectedOrder && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderInfoTitle}>Información de la Orden:</Text>
              <Text style={styles.orderInfoText}>Cliente: {selectedOrder.customerName}</Text>
              <Text style={styles.orderInfoText}>
                Dispositivo: {selectedOrder.devices[0]?.brand} {selectedOrder.devices[0]?.model}
              </Text>
              <Text style={styles.orderInfoText}>
                Problema: {selectedOrder.devices[0]?.reportedIssue}
              </Text>
              <Text style={styles.orderInfoText}>
                Costo de revisión: ${selectedOrder.devices[0]?.reviewCost}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Desglose de Costos</Text>
          
          <Input
            label="Costo de Mano de Obra"
            placeholder="0.00"
            value={budget.laborCost}
            onChangeText={(value) => setBudget(prev => ({ ...prev, laborCost: value }))}
            keyboardType="numeric"
          />
          
          <Input
            label="Costo de Repuestos"
            placeholder="0.00"
            value={budget.partsCost}
            onChangeText={(value) => setBudget(prev => ({ ...prev, partsCost: value }))}
            keyboardType="numeric"
          />
          
          <Input
            label="Costos Adicionales"
            placeholder="0.00"
            value={budget.additionalCosts}
            onChangeText={(value) => setBudget(prev => ({ ...prev, additionalCosts: value }))}
            keyboardType="numeric"
          />
          
          {parseFloat(budget.additionalCosts) > 0 && (
            <Input
              label="Descripción de Costos Adicionales"
              placeholder="Describa los costos adicionales..."
              value={budget.additionalCostsDescription}
              onChangeText={(value) => setBudget(prev => ({ ...prev, additionalCostsDescription: value }))}
              multiline
              numberOfLines={2}
            />
          )}
        </Card>

        <Card style={styles.totalCard}>
          <View style={styles.totalSection}>
            <Calculator size={24} color={colors.primary[500]} />
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Total del Presupuesto</Text>
              <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.submitContainer}>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !budget.repairOrderId}
            fullWidth
            leftIcon={<Save size={18} color={colors.white} />}
          >
            Crear Presupuesto
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 16,
  },
  orderInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  orderInfoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary[700],
    marginBottom: 8,
  },
  orderInfoText: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  totalCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalInfo: {
    marginLeft: 16,
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
  submitContainer: {
    marginTop: 24,
  },
});