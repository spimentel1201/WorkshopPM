import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Trash2, Save, X } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClientSearch } from '@/components/ClientSearch';
import { useTheme } from '@/hooks/useTheme';
import { DeviceType, Client } from '@/types/repair';

interface NewAccessory {
  id: string;
  name: string;
  included: boolean;
}

interface NewDevice {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: DeviceType;
  reviewCost: string;
  reportedIssue: string;
  accessories: NewAccessory[];
}

interface NewOrder {
  clientId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerDni?: string;
  customerAddress?: string;
  devices: NewDevice[];
}

const deviceTypes = [
  { value: DeviceType.REFRIGERATOR, label: 'Refrigeradora' },
  { value: DeviceType.WASHING_MACHINE, label: 'Lavadora' },
  { value: DeviceType.DRYER, label: 'Secadora' },
  { value: DeviceType.STOVE, label: 'Cocina' },
  { value: DeviceType.MICROWAVE, label: 'Microondas' },
  { value: DeviceType.TV, label: 'Televisor' },
  { value: DeviceType.LAPTOP, label: 'Laptop' },
  { value: DeviceType.DESKTOP, label: 'Computadora' },
  { value: DeviceType.TABLET, label: 'Tablet' },
  { value: DeviceType.SMARTPHONE, label: 'Smartphone' },
  { value: DeviceType.OTHER, label: 'Otro' },
];

export default function CreateOrderScreen() {
  const { theme } = useTheme();
  const [order, setOrder] = useState<NewOrder>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerDni: '',
    customerAddress: '',
    devices: [],
  });
  const [selectedClient, setSelectedClient] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addDevice = () => {
    const newDevice: NewDevice = {
      id: Date.now().toString(),
      brand: '',
      model: '',
      serialNumber: '',
      type: DeviceType.OTHER,
      reviewCost: '',
      reportedIssue: '',
      accessories: [],
    };

    setOrder(prev => ({
      ...prev,
      devices: [...prev.devices, newDevice],
    }));
  };

  const removeDevice = (deviceId: string) => {
    setOrder(prev => ({
      ...prev,
      devices: prev.devices.filter(device => device.id !== deviceId),
    }));
  };

  const updateDevice = (deviceId: string, field: keyof NewDevice, value: any) => {
    setOrder(prev => ({
      ...prev,
      devices: prev.devices.map(device =>
        device.id === deviceId ? { ...device, [field]: value } : device
      ),
    }));
  };

  const addAccessory = (deviceId: string, accessoryName: string) => {
    const newAccessory: NewAccessory = {
      id: Date.now().toString(),
      name: accessoryName,
      included: true,
    };

    const device = order.devices.find(d => d.id === deviceId);
    if (device) {
      updateDevice(deviceId, 'accessories', [...device.accessories, newAccessory]);
    }
  };

  const removeAccessory = (deviceId: string, accessoryId: string) => {
    const device = order.devices.find(d => d.id === deviceId);
    if (device) {
      updateDevice(deviceId, 'accessories', 
        device.accessories.filter(acc => acc.id !== accessoryId)
      );
    }
  };

  const toggleAccessoryIncluded = (deviceId: string, accessoryId: string) => {
    const device = order.devices.find(d => d.id === deviceId);
    if (device) {
      updateDevice(deviceId, 'accessories', 
        device.accessories.map(acc => 
          acc.id === accessoryId ? { ...acc, included: !acc.included } : acc
        )
      );
    }
  };

  const getAccessoryStyle = (included: boolean, theme: any) => {
    return {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: included 
        ? theme.success + '33' 
        : theme.error + '33',
      borderColor: included 
        ? theme.success 
        : theme.error,
    };
  };
  

  const handleClientSelect = (client: Partial<Client>) => {
    setSelectedClient(client);
    setOrder(prev => ({
      ...prev,
      clientId: client.id,
      customerName: client.name || '',
      customerPhone: client.phone || '',
      customerEmail: client.email || '',
      customerDni: client.dni || '',
      customerAddress: client.address || '',
    }));
  };

  const handleSubmit = async () => {
    console.log('Iniciando envío del formulario...');
    
    try {
      // Validación manual para pruebas
      console.log('Validando formulario manualmente...');
      if (!order.customerName.trim()) {
        console.log('Error: Nombre del cliente requerido');
        Alert.alert('Error', 'El nombre del cliente es requerido');
        return;
      }

      if (!order.customerPhone.trim()) {
        Alert.alert('Error', 'El teléfono del cliente es requerido');
        return;
      }

      if (order.devices.length === 0) {
        Alert.alert('Error', 'Debe agregar al menos un dispositivo');
        return;
      }

      setIsSubmitting(true);
      console.log('Formulario validado, simulando envío...');
      
      // Simulamos un retraso más corto para pruebas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Mostrando alerta de éxito...');
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      console.log('Finalizando handleSubmit...');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        console.log('Navegando de regreso...');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const AccessoryInput = ({ deviceId }: { deviceId: string }) => {
    const [accessoryName, setAccessoryName] = useState('');

    const handleAdd = () => {
      if (accessoryName.trim()) {
        addAccessory(deviceId, accessoryName.trim());
        setAccessoryName('');
      }
    };

    return (
      <View style={styles.accessoryInput}>
        <Input
          placeholder="Nombre del accesorio"
          value={accessoryName}
          onChangeText={setAccessoryName}
          style={styles.accessoryInputField}
        />
        <Button
          onPress={handleAdd}
          size="sm"
          disabled={!accessoryName.trim()}
        >
          Agregar
        </Button>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nueva Orden' }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <Card style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Información del Cliente</Text>
          
          <ClientSearch
            onClientSelect={handleClientSelect}
            selectedClient={selectedClient}
          />
          
          <Input
            label="Nombre del Cliente"
            placeholder="Ingrese el nombre completo"
            value={order.customerName}
            onChangeText={(value) => setOrder(prev => ({ ...prev, customerName: value }))}
          />
          
          <Input
            label="Teléfono"
            placeholder="Ingrese el número de teléfono"
            value={order.customerPhone}
            onChangeText={(value) => setOrder(prev => ({ ...prev, customerPhone: value }))}
            keyboardType="phone-pad"
          />
          
          <Input
            label="DNI / Documento"
            placeholder="Ingrese el número de documento"
            value={order.customerDni}
            onChangeText={(value) => setOrder(prev => ({ ...prev, customerDni: value }))}
            keyboardType="numeric"
          />
          
          <Input
            label="Correo Electrónico (Opcional)"
            placeholder="correo@ejemplo.com"
            value={order.customerEmail}
            onChangeText={(value) => setOrder(prev => ({ ...prev, customerEmail: value }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Dirección"
            placeholder="Ingrese la dirección completa"
            value={order.customerAddress}
            onChangeText={(value) => setOrder(prev => ({ ...prev, customerAddress: value }))}
            multiline
            numberOfLines={2}
          />
        </Card>

        <View style={styles.devicesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Dispositivos</Text>
          <Button
            onPress={addDevice}
            size="sm"
            leftIcon={<Plus size={16} color={theme.white} />}
          >
            Agregar Dispositivo
          </Button>
        </View>

        {order.devices.map((device, index) => (
          <Card key={device.id} style={[styles.deviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.deviceHeader}>
              <Text style={[styles.deviceTitle, { color: theme.text.primary }]}>Dispositivo {index + 1}</Text>
              <Button
                onPress={() => removeDevice(device.id)}
                variant="outline"
                size="sm"
                leftIcon={<Trash2 size={14} color={theme.error} />}
              >
                Eliminar
              </Button>
            </View>

            <Input
              label="Marca"
              placeholder="Ej: Samsung, LG, HP"
              value={device.brand}
              onChangeText={(value) => updateDevice(device.id, 'brand', value)}
            />

            <Input
              label="Modelo"
              placeholder="Ej: Galaxy S21, Pavilion"
              value={device.model}
              onChangeText={(value) => updateDevice(device.id, 'model', value)}
            />

            <Select
              label="Tipo de Dispositivo"
              placeholder="Seleccione el tipo"
              value={device.type}
              onValueChange={(value) => updateDevice(device.id, 'type', value as DeviceType)}
              options={deviceTypes}
            />

            <Input
              label="Número de Serie"
              placeholder="Ingrese el número de serie"
              value={device.serialNumber}
              onChangeText={(value) => updateDevice(device.id, 'serialNumber', value)}
            />

            <Input
              label="Costo de Revisión"
              placeholder="0.00"
              value={device.reviewCost}
              onChangeText={(value) => updateDevice(device.id, 'reviewCost', value)}
              keyboardType="numeric"
            />

            <Input
              label="Problema Reportado"
              placeholder="Describa el problema..."
              value={device.reportedIssue}
              onChangeText={(value) => updateDevice(device.id, 'reportedIssue', value)}
              multiline
              numberOfLines={3}
            />

            <View style={styles.accessoriesSection}>
              <Text style={[styles.accessoriesTitle, { color: theme.text.secondary }]}>Accesorios</Text>
              
              <AccessoryInput deviceId={device.id} />

              {device.accessories.map((accessory) => (
                <View key={accessory.id} style={[styles.accessoryItem, { backgroundColor: theme.neutral[50] }]}>
                  <View style={styles.accessoryInfo}>
                    <Text style={[styles.accessoryName, { color: theme.text.primary }]}>{accessory.name}</Text>
                    <Pressable
                      onPress={() => toggleAccessoryIncluded(device.id, accessory.id)}
                      style={({ pressed }) => [
                        styles.accessoryToggle,
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor: accessory.included 
                            ? theme.success + '33' 
                            : theme.error + '33',
                          borderColor: accessory.included 
                            ? theme.success 
                            : theme.error,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.accessoryToggleText,
                        { 
                          color: accessory.included ? theme.success : theme.error 
                        }
                      ]}>
                        {accessory.included ? 'Incluido' : 'No incluido'}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => removeAccessory(device.id, accessory.id)}
                    style={styles.removeAccessoryButton}
                  >
                    <X size={16} color={theme.error} />
                  </Pressable>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {order.devices.length === 0 && (
          <Card style={[styles.emptyDevices, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              No hay dispositivos agregados. Presiona "Agregar Dispositivo" para comenzar.
            </Text>
          </Card>
        )}

        <View style={styles.submitContainer}>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            leftIcon={<Save size={18} color={theme.white} />}
          >
            {isSubmitting ? 'Creando...' : 'Crear Orden de Reparación'}
          </Button>
        </View>
      </ScrollView>

      {/* Notificación de éxito personalizada */}
      {showSuccess && (
        <View style={[styles.successOverlay, { backgroundColor: theme.primary[500] }]}>
          <Text style={styles.successText}>¡Orden creada exitosamente!</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  deviceCard: {
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  accessoriesSection: {
    marginTop: 16,
  },
  accessoriesTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  accessoryInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  accessoryInputField: {
    flex: 1,
    marginBottom: 0,
  },
  accessoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  accessoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accessoryName: {
    fontSize: 14,
    flex: 1,
  },
  accessoryToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },

  accessoryToggleText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },

  removeAccessoryButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyDevices: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  submitContainer: {
    marginTop: 24,
  },
  successOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});