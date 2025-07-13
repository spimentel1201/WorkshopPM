import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, CheckCircle, XCircle, MessageCircle, Phone, Mail } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';
import { Budget } from '@/types/repair';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// Mock budget data
const mockBudget: Budget = {
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
};

const mockOrderInfo = {
  customerName: 'Juan Pérez',
  customerPhone: '987654321',
  customerEmail: 'juan@example.com',
  deviceInfo: 'Samsung Galaxy S21',
  reportedIssue: 'Pantalla rota',
};

export default function BudgetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch budget details
  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBudget;
    },
  });

  // Approve budget mutation
  const approveBudgetMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...budget!, approved: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      Alert.alert('Éxito', 'Presupuesto aprobado exitosamente');
    },
  });

  // Reject budget mutation
  const rejectBudgetMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...budget!, approved: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      Alert.alert('Presupuesto rechazado');
    },
  });

  const handleApprove = () => {
    Alert.alert(
      'Aprobar Presupuesto',
      '¿Está seguro que desea aprobar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprobar', onPress: () => approveBudgetMutation.mutate() }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Rechazar Presupuesto',
      '¿Está seguro que desea rechazar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', onPress: () => rejectBudgetMutation.mutate(), style: 'destructive' }
      ]
    );
  };

  const handleContactCustomer = (method: 'phone' | 'whatsapp' | 'email') => {
    switch (method) {
      case 'phone':
        Alert.alert('Llamar', `¿Desea llamar a ${mockOrderInfo.customerPhone}?`);
        break;
      case 'whatsapp':
        Alert.alert('WhatsApp', `¿Desea enviar mensaje por WhatsApp a ${mockOrderInfo.customerPhone}?`);
        break;
      case 'email':
        Alert.alert('Email', `¿Desea enviar correo a ${mockOrderInfo.customerEmail}?`);
        break;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando presupuesto...</Text>
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.errorContainer}>
        <Text>Presupuesto no encontrado</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Presupuesto #${budget.id}`,
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Budget Status */}
        <Card>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Estado del Presupuesto</Text>
            <Badge 
              variant={budget.approved ? 'success' : 'warning'} 
              text={budget.approved ? 'Aprobado' : 'Pendiente'} 
            />
          </View>
          
          {user?.role === UserRole.ADMIN && !budget.approved && (
            <View style={styles.approvalActions}>
              <Button
                onPress={handleApprove}
                loading={approveBudgetMutation.isPending}
                leftIcon={<CheckCircle size={18} color={colors.white} />}
                style={styles.approveButton}
              >
                Aprobar
              </Button>
              <Button
                onPress={handleReject}
                loading={rejectBudgetMutation.isPending}
                variant="outline"
                leftIcon={<XCircle size={18} color={colors.error} />}
              >
                Rechazar
              </Button>
            </View>
          )}
        </Card>

        {/* Customer Information */}
        <Card>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{mockOrderInfo.customerName}</Text>
            <Text style={styles.customerDetail}>📞 {mockOrderInfo.customerPhone}</Text>
            <Text style={styles.customerDetail}>✉️ {mockOrderInfo.customerEmail}</Text>
          </View>
          
          <View style={styles.contactButtons}>
            <Button
              onPress={() => handleContactCustomer('phone')}
              variant="outline"
              size="sm"
              leftIcon={<Phone size={16} color={colors.primary[500]} />}
            >
              Llamar
            </Button>
            <Button
              onPress={() => handleContactCustomer('whatsapp')}
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle size={16} color={colors.primary[500]} />}
            >
              WhatsApp
            </Button>
            <Button
              onPress={() => handleContactCustomer('email')}
              variant="outline"
              size="sm"
              leftIcon={<Mail size={16} color={colors.primary[500]} />}
            >
              Email
            </Button>
          </View>
        </Card>

        {/* Device Information */}
        <Card>
          <Text style={styles.sectionTitle}>Información del Dispositivo</Text>
          <Text style={styles.deviceName}>{mockOrderInfo.deviceInfo}</Text>
          <Text style={styles.deviceIssue}>Problema: {mockOrderInfo.reportedIssue}</Text>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <Text style={styles.sectionTitle}>Desglose de Costos</Text>
          
          <View style={styles.costBreakdown}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Mano de obra:</Text>
              <Text style={styles.costValue}>${budget.laborCost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Repuestos:</Text>
              <Text style={styles.costValue}>${budget.partsCost.toFixed(2)}</Text>
            </View>
            
            {budget.additionalCosts > 0 && (
              <>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Costos adicionales:</Text>
                  <Text style={styles.costValue}>${budget.additionalCosts.toFixed(2)}</Text>
                </View>
                
                {budget.additionalCostsDescription && (
                  <View style={styles.additionalDescription}>
                    <Text style={styles.additionalDescriptionLabel}>Descripción:</Text>
                    <Text style={styles.additionalDescriptionText}>
                      {budget.additionalCostsDescription}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
          
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${budget.totalCost.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Budget History */}
        <Card>
          <Text style={styles.sectionTitle}>Historial</Text>
          <View style={styles.historyItem}>
            <Text style={styles.historyText}>Presupuesto creado</Text>
            <Text style={styles.historyDate}>
              {new Date(budget.createdAt).toLocaleString()}
            </Text>
          </View>
          
          {budget.approved && (
            <View style={styles.historyItem}>
              <Text style={styles.historyText}>Presupuesto aprobado</Text>
              <Text style={styles.historyDate}>
                {new Date(budget.updatedAt).toLocaleString()}
              </Text>
            </View>
          )}
        </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 16,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  deviceIssue: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  costBreakdown: {
    marginBottom: 16,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 16,
    color: colors.neutral[700],
  },
  costValue: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.neutral[900],
  },
  additionalDescription: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
  },
  additionalDescriptionLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  additionalDescriptionText: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.neutral[800],
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  historyText: {
    fontSize: 14,
    color: colors.neutral[800],
  },
  historyDate: {
    fontSize: 12,
    color: colors.neutral[500],
  },
});