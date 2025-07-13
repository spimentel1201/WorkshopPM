import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { CreditCard, Smartphone, DollarSign, Receipt } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import colors from '@/constants/colors';
import { PaymentMethod, PaymentDetails, SaleItem } from '@/types/inventory';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const cartItems: SaleItem[] = params.cartItems ? JSON.parse(params.cartItems as string) : [];
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Cash payment fields
  const [receivedAmount, setReceivedAmount] = useState('');
  
  // Yape payment fields
  const [yapePhone, setYapePhone] = useState('');
  const [yapeReference, setYapeReference] = useState('');
  
  // Card payment fields
  const [cardReference, setCardReference] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18; // 18% IGV
  const total = subtotal + tax;

  const calculateChange = (): number => {
    if (paymentMethod === PaymentMethod.CASH && receivedAmount) {
      const received = parseFloat(receivedAmount);
      return Math.max(0, received - total);
    }
    return 0;
  };

  const validatePayment = (): boolean => {
    switch (paymentMethod) {
      case PaymentMethod.CASH:
        const received = parseFloat(receivedAmount);
        if (!receivedAmount || isNaN(received)) {
          Alert.alert('Error', 'Ingrese el monto recibido');
          return false;
        }
        if (received < total) {
          Alert.alert('Error', 'El monto recibido es insuficiente');
          return false;
        }
        return true;
        
      case PaymentMethod.YAPE:
        if (!yapePhone.trim()) {
          Alert.alert('Error', 'Ingrese el número de teléfono Yape');
          return false;
        }
        if (!yapeReference.trim()) {
          Alert.alert('Error', 'Ingrese el código de operación Yape');
          return false;
        }
        return true;
        
      case PaymentMethod.CARD:
        if (!cardReference.trim()) {
          Alert.alert('Error', 'Ingrese la referencia de la tarjeta');
          return false;
        }
        return true;
        
      default:
        return false;
    }
  };

  const handleProcessPayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentDetails: PaymentDetails = {
        method: paymentMethod,
        amount: total,
      };

      switch (paymentMethod) {
        case PaymentMethod.CASH:
          paymentDetails.receivedAmount = parseFloat(receivedAmount);
          paymentDetails.change = calculateChange();
          break;
        case PaymentMethod.YAPE:
          paymentDetails.phoneNumber = yapePhone;
          paymentDetails.reference = yapeReference;
          break;
        case PaymentMethod.CARD:
          paymentDetails.reference = cardReference;
          break;
      }

      // Here you would create the sale record
      console.log('Sale completed:', {
        items: cartItems,
        subtotal,
        tax,
        total,
        payment: paymentDetails,
        customer: {
          name: customerName || undefined,
          phone: customerPhone || undefined,
          email: customerEmail || undefined,
        }
      });

      Alert.alert(
        'Venta Completada',
        'La venta se ha procesado exitosamente',
        [
          {
            text: 'Imprimir Boleta',
            onPress: () => {
              // Handle receipt printing
              router.replace('/(tabs)/pos');
            }
          },
          {
            text: 'Finalizar',
            onPress: () => router.replace('/(tabs)/pos')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <DollarSign size={20} color={colors.white} />;
      case PaymentMethod.YAPE:
        return <Smartphone size={20} color={colors.white} />;
      case PaymentMethod.CARD:
        return <CreditCard size={20} color={colors.white} />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Efectivo';
      case PaymentMethod.YAPE:
        return 'Yape';
      case PaymentMethod.CARD:
        return 'Tarjeta';
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Procesar Pago',
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Order Summary */}
        <Card>
          <Text style={styles.sectionTitle}>Resumen de la Venta</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGV (18%):</Text>
              <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Customer Information */}
        <Card>
          <Text style={styles.sectionTitle}>Información del Cliente (Opcional)</Text>
          
          <Input
            label="Nombre"
            placeholder="Nombre del cliente"
            value={customerName}
            onChangeText={setCustomerName}
          />
          
          <Input
            label="Teléfono"
            placeholder="Número de teléfono"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
          
          <Input
            label="Correo Electrónico"
            placeholder="correo@ejemplo.com"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          
          <View style={styles.paymentMethods}>
            {Object.values(PaymentMethod).map((method) => (
              <Button
                key={method}
                onPress={() => setPaymentMethod(method)}
                variant={paymentMethod === method ? 'primary' : 'outline'}
                leftIcon={getPaymentMethodIcon(method)}
                style={styles.paymentMethodButton}
              >
                {getPaymentMethodLabel(method)}
              </Button>
            ))}
          </View>

          {/* Payment Method Specific Fields */}
          {paymentMethod === PaymentMethod.CASH && (
            <View style={styles.paymentFields}>
              <Input
                label="Monto Recibido"
                placeholder="0.00"
                value={receivedAmount}
                onChangeText={setReceivedAmount}
                keyboardType="numeric"
              />
              {receivedAmount && (
                <View style={styles.changeSection}>
                  <Text style={styles.changeLabel}>Cambio:</Text>
                  <Text style={styles.changeAmount}>${calculateChange().toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          {paymentMethod === PaymentMethod.YAPE && (
            <View style={styles.paymentFields}>
              <Input
                label="Número de Teléfono"
                placeholder="987654321"
                value={yapePhone}
                onChangeText={setYapePhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Código de Operación"
                placeholder="Código Yape"
                value={yapeReference}
                onChangeText={setYapeReference}
              />
            </View>
          )}

          {paymentMethod === PaymentMethod.CARD && (
            <View style={styles.paymentFields}>
              <Input
                label="Referencia de Tarjeta"
                placeholder="Últimos 4 dígitos o referencia"
                value={cardReference}
                onChangeText={setCardReference}
              />
            </View>
          )}
        </Card>

        <View style={styles.actionButtons}>
          <Button
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          
          <Button
            onPress={handleProcessPayment}
            loading={isProcessing}
            disabled={isProcessing}
            leftIcon={<Receipt size={18} color={colors.white} />}
            style={styles.processButton}
          >
            Procesar Pago
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[800],
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.neutral[600],
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[900],
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[900],
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[300],
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentMethodButton: {
    flex: 1,
  },
  paymentFields: {
    marginTop: 16,
  },
  changeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
  },
  changeLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.success,
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.success,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  processButton: {
    flex: 2,
  },
});