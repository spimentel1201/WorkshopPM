import { useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle, Clock, Edit, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { useState, useMemo } from 'react';
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
  const { data: orderItems, isLoading, error } = getOrder(id!);

  // Transformar los datos al formato esperado
  const order = useMemo(() => {
    if (!orderItems) {
      return null;
    }

    // Extraer los items del pedido
    const items = orderItems.items || [];
    
    // Mapear los items a dispositivos con validación
    const devices = items.map((item: any) => ({
      id: item.id || `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brand: item.brand || 'Sin marca',
      model: item.model || 'Sin modelo',
      serialNumber: item.serialNumber || 'N/A',
      type: item.deviceType || 'OTRO',
      reviewCost: Number(item.price) || 0,
      reportedIssue: item.problemDescription || 'Sin descripción del problema',
      accessories: Array.isArray(item.accessories)
        ? item.accessories
            .filter((name: any): name is string => typeof name === 'string')
            .map((name: string) => ({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              included: true
            }))
        : []
    }));
    
    // Extraer información del cliente y técnico
    const customer = orderItems.customer || {};
    const technician = orderItems.technician || {};
    
    return {
      id: orderItems.id,
      customerName: customer.name || 'Cliente',
      customerPhone: customer.phone || 'Sin teléfono',
      customerEmail: customer.email || 'sin@email.com',
      customerId: customer.id,
      technicianId: technician.id,
      technicianName: technician.firstName ? `${technician.firstName} ${technician.lastName || ''}`.trim() : 'Técnico no asignado',
      status: (orderItems.status as RepairOrderStatus) || 'RECEIVED',
      description: orderItems.description || orderItems.problemDescription || 'Sin descripción',
      notes: orderItems.notes || '',
      initialReviewCost: orderItems.initialReviewCost || 0,
      totalCost: orderItems.totalCost || 0,
      startDate: orderItems.startDate || null,
      endDate: orderItems.endDate || null,
      devices,
      createdAt: orderItems.createdAt || new Date().toISOString(),
      updatedAt: orderItems.updatedAt || new Date().toISOString(),
    };
  }, [orderItems]);

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

  const getStatusLabel = (status: RepairOrderStatus): string => {
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

  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <Text>Cargando orden...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyState}>
        <AlertCircle size={48} color={colors.neutral[400]} />
        <Text style={styles.emptyText}>No se encontró la orden</Text>
      </View>
    );
  }

  const nextStatus = getNextStatus(order.status as RepairOrderStatus);
  const device = order.devices?.[0]; // Safe access to first device or undefined

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Orden #${order?.id?.substring(0, 8) || ''}`,
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] },
        }} 
      />

      {/* Order Status */}
      <View style={[styles.card, styles.section]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Estado de la Orden</Text>
          <StatusBadge status={order.status} />
        </View>
        
        {nextStatus && (
          <Button 
            onPress={() => handleStatusUpdate(nextStatus)} 
            style={styles.actionButton}
          >
            Marcar como {getStatusLabel(nextStatus).toLowerCase()}
          </Button>
        )}
      </View>

      {/* Customer Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{order.customerName}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{order.customerPhone}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.customerEmail}</Text>
        </View>
      </View>

      {/* Technician Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información del Técnico</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{order.technicianName}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{order.technicianId}</Text>
        </View>
      </View>

      {/* Device Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dispositivo</Text>
        
        {order.devices?.map((device, index) => (
          <View key={device.id} style={[styles.deviceInfo, index > 0 && { marginTop: 16 }]}>
            <Text style={styles.deviceName}>{[device.brand, device.model].filter(Boolean).join(' ')}</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Número de serie:</Text>
              <Text style={styles.value}>{device.serialNumber}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{device.type}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Costo de revisión:</Text>
              <Text style={[styles.value, { fontWeight: '600' }]}>${device.reviewCost}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={[styles.label, { marginBottom: 8 }]}>Problema reportado:</Text>
            <Text style={styles.value}>{device.reportedIssue}</Text>
            
            {device.accessories?.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.label, { marginBottom: 8 }]}>Accesorios:</Text>
                {device.accessories.map((accessory: any) => (
                  <View key={accessory.id} style={[styles.row, { marginBottom: 4 }]}>
                    <Text style={styles.value}>{accessory.name}</Text>
                    <Text style={[
                      styles.label,
                      { 
                        color: accessory.included ? colors.success : colors.error,
                        marginLeft: 8
                      }
                    ]}>
                      {accessory.included ? '✓ Incluido' : '✗ No incluido'}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        ))}
      </View>

      {/* Order Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial de la Orden</Text>
        
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot}>
            <CheckCircle size={16} color={colors.white} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={{ fontWeight: '600' }}>Orden creada</Text>
            <Text style={styles.timelineDate}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        
        {order.status === 'COMPLETED' && (
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.success }]}>
              <CheckCircle size={16} color={colors.white} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={{ fontWeight: '600' }}>Orden completada</Text>
              <Text style={styles.timelineDate}>
                {new Date(order.updatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.neutral[600],
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'right',
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  deviceDetail: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButton: {
    marginTop: 8,
    color: colors.white,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.neutral[200],
    paddingLeft: 16,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 8,
  },
});