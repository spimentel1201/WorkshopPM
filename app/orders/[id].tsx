import { useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle, Clock, Edit, Mail, MessageCircle, Phone, UserPlus } from 'lucide-react-native';
import { useState, useMemo, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Platform, TouchableOpacity, Modal } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { UserRole } from '@/types/auth';
import { RepairOrderStatus } from '@/types/repair';
import { getToken } from '@/src/lib/storage';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { user } = useAuth();
  const { getOrder, updateOrderStatus, updateOrder } = useOrders();
  const queryClient = useQueryClient();
  
  // Estados locales
  const [diagnosis, setDiagnosis] = useState('');
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);
  const [isAssigningTech, setIsAssigningTech] = useState(false);
  const [showWebMenu, setShowWebMenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RepairOrderStatus | null>(null);

  // Obtener datos de la orden
  const { data: orderItems, isLoading, error, refetch } = getOrder(id!);

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

  // Función para manejar la asignación del técnico
  const handleAssignTechnician = async () => {
    if (!user?.id) return;
    
    setIsAssigningTech(true);
    try {
      await updateOrder.mutateAsync({
        id: id!,
        data: {
          technicianId: user.id
        }
      });
      
      Alert.alert(
        '¡Asignación exitosa!',
        'Has sido asignado como técnico de esta orden',
        [
          { 
            text: 'Aceptar',
            onPress: () => refetch()
          }
        ]
      );
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      Alert.alert('Error', 'No se pudo asignar el técnico. Intente nuevamente.');
    } finally {
      setIsAssigningTech(false);
    }
  };

  // Common function to handle status selection
  const handleStatusSelect = (status: RepairOrderStatus) => {
    console.log('1. Estado seleccionado:', status);
    
    // Cerrar el menú web primero si estamos en web
    if (Platform.OS === 'web') {
      setShowWebMenu(false);
    }

    // Mostrar el modal de confirmación
    setSelectedStatus(status);
    setShowConfirmation(true);
  };

  // Función para manejar la confirmación
  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) return;
    
    console.log('3. Usuario confirmó el cambio a:', selectedStatus);
    setShowConfirmation(false);
    
    try {
      console.log('4. Iniciando actualización de estado...');
      await handleStatusUpdate(selectedStatus);
      console.log('5. Actualización de estado completada');
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  // Función para manejar la selección de estado
  const handleStatusUpdate = async (newStatus: RepairOrderStatus) => {
    if (!id) return;
    console.log('Preparando petición a:', `${process.env.EXPO_PUBLIC_API_URL}/repair-orders/${id}/status`);
    try {
      console.log('Iniciando actualización de estado a:', newStatus);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/repair-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      console.log('Respuesta recibida, status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

      // Actualizar la caché local
      queryClient.setQueryData(['order', id], (oldData: any) => ({
        ...oldData,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }));

      console.log('Estado actualizado exitosamente a:', newStatus);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        '¡Éxito!',
        `El estado se ha actualizado a: ${getStatusText(newStatus)}`,
        [{ text: 'Aceptar' }]
      );

      // Recargar los datos
      await refetch();

    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo actualizar el estado de la orden. Intente nuevamente.'
      );
    }
  };

  // Show mobile ActionSheet or web menu
  const showStatusMenu = () => {
    console.log('showStatusMenu llamado');
    
    if (!order) {
      console.log('No hay orden cargada');
      return;
    }

    if (Platform.OS === 'web') {
      // Show web menu
      setShowWebMenu(true);
    } else {
      // Show mobile ActionSheet
      const { showActionSheetWithOptions } = useActionSheet();
      const options = [
        ...Object.values(RepairOrderStatus)
          .filter(status => status !== order.status)
          .map(status => getStatusText(status)),
        'Cancelar'
      ];

      const cancelButtonIndex = options.length - 1;

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Seleccionar Estado',
          message: `Estado actual: ${getStatusText(order.status as RepairOrderStatus)}`,
          cancelButtonTintColor: colors.error,
        },
        (selectedIndex) => {
          if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) {
            console.log('Selección cancelada');
            return;
          }
          
          const selectedStatus = Object.values(RepairOrderStatus)
            .filter(status => status !== order.status)
            [selectedIndex];
          
          if (selectedStatus) {
            handleStatusSelect(selectedStatus);
          }
        }
      );
    }
  };

  // Update diagnosis mutation
  const updateDiagnosisMutation = updateOrder;

  // Función para manejar la actualización del diagnóstico
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

  // Función para contactar al cliente
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

  // Función para obtener el texto del estado
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

  // Función para obtener el siguiente estado
  const getNextStatus = (currentStatus: RepairOrderStatus): RepairOrderStatus | null => {
    switch (currentStatus) {
      case RepairOrderStatus.RECEIVED: return RepairOrderStatus.DIAGNOSED;
      case RepairOrderStatus.DIAGNOSED: return RepairOrderStatus.IN_PROGRESS;
      case RepairOrderStatus.IN_PROGRESS: return RepairOrderStatus.COMPLETED;
      case RepairOrderStatus.COMPLETED: return RepairOrderStatus.DELIVERED;
      default: return null;
    }
  };

  // Función para obtener el texto del estado
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

  const availableStatuses = order ? Object.values(RepairOrderStatus)
    .filter(status => status !== order.status)
    .map(status => ({
      value: status,
      label: getStatusText(status)
    })) : [];

  return (
    <View style={{ flex: 1 }}>
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
          
          {/* Botón para cambiar estado */}
          <Button 
            onPress={showStatusMenu}
            style={[styles.actionButton, { marginBottom: 12 }]}
            variant="outline"
          >
            Cambiar Estado
          </Button>

          {/* Botón para asignarse como técnico */}
          {user?.role === 'TECHNICIAN' && (
            <Button 
              onPress={handleAssignTechnician}
              style={styles.actionButton}
              loading={isAssigningTech}
              leftIcon={<UserPlus size={16} />}
            >
              Asignarme a esta orden
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
      
      {/* Web Dropdown Menu */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showWebMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWebMenu(false)}
        >
          <TouchableOpacity 
            style={styles.webMenuBackdrop}
            activeOpacity={1}
            onPress={(e) => {
              e.stopPropagation();
              setShowWebMenu(false);
            }}
          >
            <View style={styles.webMenuContainer}>
              <Text style={styles.webMenuTitle}>Seleccionar Estado</Text>
              <Text style={styles.webMenuSubtitle}>
                Estado actual: {order ? getStatusText(order.status as RepairOrderStatus) : ''}
              </Text>
              
              {availableStatuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={styles.webMenuItem}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent modal close
                    handleStatusSelect(status.value);
                  }}
                >
                  <Text style={styles.webMenuText}>{status.label}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.webMenuItem, styles.webMenuCancel]}
                onPress={(e) => {
                  e.stopPropagation();
                  setShowWebMenu(false);
                }}
              >
                <Text style={[styles.webMenuText, { color: colors.error }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      
      {/* Modal de confirmación */}
      {Platform.OS === 'web' && showConfirmation && (
        <Modal
          transparent
          visible={showConfirmation}
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Cambio</Text>
              <Text style={styles.modalText}>
                ¿Cambiar estado a "{selectedStatus ? getStatusText(selectedStatus) : ''}"?
              </Text>
              <View style={styles.modalButtons}>
                <Button 
                  variant="outline" 
                  onPress={() => setShowConfirmation(false)}
                  style={{ marginRight: 10 }}
                >
                  Cancelar
                </Button>
                <Button onPress={handleConfirmStatusChange}>
                  Confirmar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
    width: '100%',
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
  statusOption: {
    marginVertical: 4,
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  subtitle: {
    color: colors.neutral[600],
    marginBottom: 16,
    fontSize: 14,
  },
  webMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMenuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  webMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  webMenuSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 16,
    textAlign: 'center',
  },
  webMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  webMenuText: {
    fontSize: 16,
  },
  webMenuCancel: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});