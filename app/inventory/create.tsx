import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Save, Package } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';

interface NewProduct {
  name: string;
  description: string;
  sku: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
  model: string;
}

const categoryOptions = [
  { value: 'Pantallas', label: 'Pantallas' },
  { value: 'Baterías', label: 'Baterías' },
  { value: 'Placas madre', label: 'Placas madre' },
  { value: 'Cargadores', label: 'Cargadores' },
  { value: 'Memoria', label: 'Memoria' },
  { value: 'Almacenamiento', label: 'Almacenamiento' },
  { value: 'Procesadores', label: 'Procesadores' },
  { value: 'Otros', label: 'Otros' },
];

export default function CreateProductScreen() {
  const [product, setProduct] = useState<NewProduct>({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    model: '',
  });

  const [errors, setErrors] = useState<Partial<NewProduct>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSKU = () => {
    const categoryCode = product.category.substring(0, 3).toUpperCase();
    const brandCode = product.brand.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-${brandCode}-${randomNum}`;
  };

  const handleGenerateSKU = () => {
    if (product.category && product.brand) {
      const newSKU = generateSKU();
      setProduct(prev => ({ ...prev, sku: newSKU }));
    } else {
      Alert.alert('Información requerida', 'Seleccione una categoría e ingrese una marca para generar el SKU');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewProduct> = {};

    if (!product.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!product.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!product.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
    }

    if (!product.price) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
      newErrors.price = 'Ingrese un precio válido';
    }

    if (!product.stock) {
      newErrors.stock = 'El stock inicial es requerido';
    } else if (isNaN(Number(product.stock)) || Number(product.stock) < 0) {
      newErrors.stock = 'Ingrese un stock válido';
    }

    if (!product.category) {
      newErrors.category = 'Seleccione una categoría';
    }

    if (!product.brand.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito',
        'Producto creado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Nuevo Producto',
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.neutral[900] }
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Package size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.title}>Agregar Nuevo Producto</Text>
            <Text style={styles.subtitle}>
              Complete la información del producto para agregarlo al inventario
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Input
            label="Nombre del Producto"
            placeholder="Ej: Pantalla LCD Samsung Galaxy S21"
            value={product.name}
            onChangeText={(value) => setProduct(prev => ({ ...prev, name: value }))}
            error={errors.name}
          />
          
          <Input
            label="Descripción"
            placeholder="Describa el producto..."
            value={product.description}
            onChangeText={(value) => setProduct(prev => ({ ...prev, description: value }))}
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <Select
            label="Categoría"
            placeholder="Seleccione una categoría"
            value={product.category}
            onValueChange={(value) => setProduct(prev => ({ ...prev, category: value }))}
            options={categoryOptions}
            error={errors.category}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Identificación</Text>
          
          <View style={styles.skuContainer}>
            <Input
              label="SKU (Código del Producto)"
              placeholder="Ej: PAN-SAM-001"
              value={product.sku}
              onChangeText={(value) => setProduct(prev => ({ ...prev, sku: value }))}
              error={errors.sku}
              style={styles.skuInput}
            />
            <Button
              onPress={handleGenerateSKU}
              variant="outline"
              size="sm"
              style={styles.generateButton}
            >
              Generar
            </Button>
          </View>

          <Input
            label="Marca"
            placeholder="Ej: Samsung, HP, Apple"
            value={product.brand}
            onChangeText={(value) => setProduct(prev => ({ ...prev, brand: value }))}
            error={errors.brand}
          />
          
          <Input
            label="Modelo (Opcional)"
            placeholder="Ej: Galaxy S21, Pavilion"
            value={product.model}
            onChangeText={(value) => setProduct(prev => ({ ...prev, model: value }))}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Precio e Inventario</Text>
          
          <Input
            label="Precio de Venta"
            placeholder="0.00"
            value={product.price}
            onChangeText={(value) => setProduct(prev => ({ ...prev, price: value }))}
            keyboardType="numeric"
            error={errors.price}
          />
          
          <Input
            label="Stock Inicial"
            placeholder="0"
            value={product.stock}
            onChangeText={(value) => setProduct(prev => ({ ...prev, stock: value }))}
            keyboardType="numeric"
            error={errors.stock}
          />
        </Card>

        <View style={styles.submitContainer}>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            leftIcon={<Save size={18} color={colors.white} />}
          >
            Crear Producto
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
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 16,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  skuInput: {
    flex: 1,
    marginBottom: 0,
  },
  generateButton: {
    marginBottom: 16,
  },
  submitContainer: {
    marginTop: 24,
  },
});