import { useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle, Clock, Edit, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { UserRole } from '@/types/auth';
import { RepairOrderStatus } from '@/types/repair';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getOrder, updateOrderStatus, updateOrder } = useOrders();
  const queryClient = useQueryClient();
  const [diagnosis, setDiagnosis] = useState('');
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);

  // Fetch order details usando el hook
  const { data: order, isLoading } = getOrder(id!);

  // Update diagnosis mutation
  const updateDiagnosisMutation = updateOrder;

  // Update order status usando el hook
  const handleStatusUpdate = (newStatus: RepairOrderStatus) => {
    Alert.alert(
      'Actualizar Estado',
      `¿Confirma cambiar el estado a ${getStatusText(newStatus)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => updateOrderStatus.mutate({ 
            id: id!, 
            status: { status: newStatus } 
          })
        }
      ]
    );
  };

  const handleDiagnosisUpdate = () => {
    if (!diagnosis.trim()) {
      Alert.alert('Error', 'El diagnóstico no puede estar vacío');
      return;
    }
    updateDiagnosisMutation.mutate({
      id: id!,
      data: {
        // Aquí deberías incluir los campos necesarios para actualizar el diagnóstico
        description: diagnosis
      }
    });
  };

  const handleContactCustomer = (method: 'phone' | 'whatsapp' | 'email') => {
    if (!order) return;
    
    switch (method) {
      case 'phone':
        Alert.alert('Llamar', `¿Desea llamar a ${order.customerPhone}?`);
        break;
      case 'whatsapp':
        Alert.alert('WhatsApp', `¿Desea enviar mensaje por WhatsApp a ${order.customerPhone}?`);
        break;
      case 'email':
        if (order.customerEmail) {
          Alert.alert('Email', `¿Desea enviar correo a ${order.customerEmail}?`);
        } else {
          Alert.alert('Error', 'El cliente no tiene correo registrado');
        }
        break;
    }
  };

  const getStatusText = (status: RepairOrderStatus): string => {
    switch (status) {
      case RepairOrderStatus.RECEIVED: return 'Recibido';
      case RepairOrderStatus.DIAGNOSED: return 'Diagnosticado';
      case RepairOrderStatus.IN_PROGRESS: return 'En Progreso';
      case RepairOrderStatus.WAITING_FOR_PARTS: return 'Esperando Repuestos';
      case RepairOrderStatus.COMPLETED: return 'Completado';
      case RepairOrderStatus.DELIVERED: return 'Entregado';
      case RepairOrderStatus.CANCELLED: return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getNextStatus = (currentStatus: RepairOrderStatus): RepairOrderStatus | null => {
    switch (currentStatus) {
      case RepairOrderStatus.RECEIVED: return RepairOrderStatus.DIAGNOSED;
      case RepairOrderStatus.DIAGNOSED: return RepairOrderStatus.IN_PROGRESS;
      case RepairOrderStatus.IN_PROGRESS: return RepairOrderStatus.COMPLETED;
      case RepairOrderStatus.COMPLETED: return RepairOrderStatus.DELIVERED;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando orden...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>Orden no encontrada</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const nextStatus = getNextStatus(order.status);
  const device = order.devices[0]; // For simplicity, showing first device

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Orden #${order.id}`,
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Order Status */}
        <Card>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Estado de la Orden</Text>
            <StatusBadge status={order.status} />
          </View>
          
          {nextStatus && (
            <Button
              onPress={() => handleStatusUpdate(nextStatus)}
              loading={updateOrderStatus.isPending}
              leftIcon={<CheckCircle size={18} color={colors.white} />}
            >
              Marcar como {getStatusText(nextStatus)}
            </Button>
          )}
        </Card>

        {/* Customer Information */}
        <Card>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.customerDetail}>📞 {order.customerPhone}</Text>
            {order.customerEmail && (
              <Text style={styles.customerDetail}>✉️ {order.customerEmail}</Text>
            )}
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
            {order.customerEmail && (
              <Button
                onPress={() => handleContactCustomer('email')}
                variant="outline"
                size="sm"
                leftIcon={<Mail size={16} color={colors.primary[500]} />}
              >
                Email
              </Button>
            )}
          </View>
        </Card>

        {/* Device Information */}
        <Card>
          <Text style={styles.sectionTitle}>Información del Dispositivo</Text>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.brand} {device.model}</Text>
            <Text style={styles.deviceDetail}>Tipo: {device.type.replace('_', ' ')}</Text>
            <Text style={styles.deviceDetail}>Serie: {device.serialNumber}</Text>
            <Text style={styles.deviceDetail}>Costo revisión: ${device.reviewCost}</Text>
          </View>
          
          <View style={styles.issueSection}>
            <Text style={styles.issueTitle}>Problema Reportado:</Text>
            <Text style={styles.issueText}>{device.reportedIssue}</Text>
          </View>

          {device.accessories.length > 0 && (
            <View style={styles.accessoriesSection}>
              <Text style={styles.accessoriesTitle}>Accesorios:</Text>
              {device.accessories.map((accessory) => (
                <View key={accessory.id} style={styles.accessoryItem}>
                  <Text style={styles.accessoryName}>{accessory.name}</Text>
                  <Text style={[
                    styles.accessoryStatus,
                    accessory.included ? styles.included : styles.notIncluded
                  ]}>
                    {accessory.included ? '✓ Incluido' : '✗ No incluido'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Diagnosis Section */}
        {user?.role === UserRole.TECHNICIAN && (
          <Card>
            <View style={styles.diagnosisHeader}>
              <Text style={styles.sectionTitle}>Diagnóstico</Text>
              {!isEditingDiagnosis && (
                <Button
                  onPress={() => {
                    setDiagnosis(device.diagnosis || '');
                    setIsEditingDiagnosis(true);
                  }}
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit size={16} color={colors.primary[500]} />}
                >
                  Editar
                </Button>
              )}
            </View>

            {isEditingDiagnosis ? (
              <View>
                <Input
                  placeholder="Ingrese el diagnóstico..."
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.diagnosisActions}>
                  <Button
                    onPress={() => setIsEditingDiagnosis(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onPress={handleDiagnosisUpdate}
                    loading={updateDiagnosisMutation.isPending}
                    size="sm"
                  >
                    Guardar
                  </Button>
                </View>
              </View>
            ) : (
              <Text style={styles.diagnosisText}>
                {device.diagnosis || 'No hay diagnóstico registrado'}
              </Text>
            )}
          </Card>
        )}

        {/* Order Timeline */}
        <Card>
          <Text style={styles.sectionTitle}>Historial</Text>
          <View style={styles.timelineItem}>
            <Clock size={16} color={colors.neutral[500]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Orden creada</Text>
              <Text style={styles.timelineDate}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
          
          {order.status !== RepairOrderStatus.RECEIVED && (
            <View style={styles.timelineItem}>
              <AlertCircle size={16} color={colors.info} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineText}>Reparación iniciada</Text>
                <Text style={styles.timelineDate}>
                  {new Date(order.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          
          {order.completedAt && (
            <View style={styles.timelineItem}>
              <CheckCircle size={16} color={colors.success} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineText}>Reparación completada</Text>
                <Text style={styles.timelineDate}>
                  {new Date(order.completedAt).toLocaleString()}
                </Text>
              </View>
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
  deviceInfo: {
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  deviceDetail: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  issueSection: {
    marginBottom: 16,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[800],
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  accessoriesSection: {
    marginTop: 16,
  },
  accessoriesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.neutral[800],
    marginBottom: 8,
  },
  accessoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 6,
    marginBottom: 4,
  },
  accessoryName: {
    fontSize: 14,
    color: colors.neutral[800],
  },
  accessoryStatus: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  included: {
    color: colors.success,
  },
  notIncluded: {
    color: colors.error,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosisText: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 20,
    fontStyle: 'italic',
  },
  diagnosisActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.neutral[500],
  },
});