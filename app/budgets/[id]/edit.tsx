import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Save, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useQuotes } from '@/hooks/useQuotes';

type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export default function EditBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { getQuoteById, updateQuote, updateQuoteStatus } = useQuotes();
  const { getOrders } = useOrders();

  const { data: quote, isLoading } = getQuoteById(id || '');
  const { data: orders = [] } = getOrders();

  const [orderId, setOrderId] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with quote data
  useEffect(() => {
    if (quote) {
      setOrderId(quote.repairOrderId);
      setItems(quote.items.map(item => ({
        id: item.id || Date.now().toString(),
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      })));
    }
  }, [quote]);

  const selectedOrder = orders.find(order => order.id === orderId);

  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!orderId) {
      newErrors.orderId = 'Seleccione una orden';
    }

    items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item-${index}-description`] = 'La descripción es requerida';
      }
      if (item.quantity <= 0) {
        newErrors[`item-${index}-quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.price < 0) {
        newErrors[`item-${index}-price`] = 'El precio no puede ser negativo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      // Reset the only item instead of removing it
      setItems([{ id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
    }
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    );
  };

  const handleSubmit = async () => {
    if (!validateForm() || !quote) return;

    try {
      setIsSubmitting(true);
      console.log('Starting quote update...');

      // Recalculate total amount based on current items
      const recalculatedTotal = items.reduce(
        (sum, item) => sum + (item.quantity * item.price),
        0
      );

      // Prepare the data in the exact format expected by the API
      const updatePayload = {
        repairOrderId: quote.repairOrderId,
        customerId: quote.customerId,
        technicianId: quote.technicianId,
        status: quote.status,
        totalAmount: recalculatedTotal, // Use the recalculated total
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      console.log('Sending update payload:', JSON.stringify(updatePayload, null, 2));
      
      const response = await updateQuote.mutateAsync({
        id: quote.id,
        data: updatePayload
      });

      console.log('Update response:', response);

      Alert.alert(
        'Éxito',
        'El presupuesto ha sido actualizado correctamente',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              // Invalidate queries to refresh the data
              // queryClient.invalidateQueries({ queryKey: ['quotes'] });
              // queryClient.invalidateQueries({ queryKey: ['quotes', quote.id] });
              router.back();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error updating quote:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      Alert.alert(
        'Error',
        `No se pudo actualizar el presupuesto: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando presupuesto...</Text>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.errorContainer}>
        <Text>No se pudo cargar el presupuesto</Text>
        <Button onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Volver
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Editar Presupuesto',
          headerBackTitle: 'Cancelar',
        }}
      />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Orden</Text>

        <View style={styles.formGroup}>
          <Text style={styles.infoLabel}>Orden #</Text>
          <Text style={styles.infoValue}>{quote.repairOrderId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>
            {quote.customer?.name || 'No especificado'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dispositivo:</Text>
          <Text style={styles.infoValue}>
            {quote.repairOrder?.devices?.[0]
              ? `${quote.repairOrder.devices[0].brand} ${quote.repairOrder.devices[0].model}`
              : quote.repairOrder?.device || 'No especificado'
            }
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ítems del Presupuesto</Text>
          <Button 
            onPress={handleAddItem}
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            Agregar Ítem
          </Button>
        </View>

        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Ítem {index + 1}</Text>
                {items.length > 1 && (
                  <Button 
                    onPress={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    size="sm"
                    style={styles.removeButton}
                  >
                    <X size={16} color={colors.red[500]} />
                  </Button>
                )}
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Descripción"
                  placeholder="Descripción del servicio o repuesto"
                  value={item.description}
                  onChangeText={(value) => handleItemChange(item.id, 'description', value)}
                  error={errors[`item-${index}-description`]}
                />
              </View>

              <View style={styles.itemRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                  <Input
                    label="Cantidad"
                    placeholder="1"
                    value={item.quantity.toString()}
                    onChangeText={(value) => {
                      const num = parseInt(value) || 0;
                      handleItemChange(item.id, 'quantity', num > 0 ? num : 0);
                    }}
                    keyboardType="numeric"
                    error={errors[`item-${index}-quantity`]}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Input
                    label="Precio Unitario"
                    placeholder="0.00"
                    value={item.price.toString()}
                    onChangeText={(value) => {
                      const num = parseFloat(value) || 0;
                      handleItemChange(item.id, 'price', num >= 0 ? num : 0);
                    }}
                    keyboardType="numeric"
                    error={errors[`item-${index}-price`]}
                  />
                </View>
              </View>

              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalLabel}>Subtotal:</Text>
                <Text style={styles.itemTotalAmount}>
                  S/{(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total del Presupuesto:</Text>
          <Text style={styles.totalAmount}>S/{totalAmount.toFixed(2)}</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Button 
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          leftIcon={<Save size={20} />}
        >
          Guardar Cambios
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[900],
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: colors.primary[600],
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.primary[900],
  },
  itemsList: {
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[900],
  },
  removeButton: {
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
  },
  itemTotalLabel: {
    fontSize: 14,
    color: colors.primary[600],
    marginRight: 8,
  },
  itemTotalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[900],
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary[200],
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[900],
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  footer: {
    margin: 16,
    marginTop: 24,
    marginBottom: 32,
  },
});
