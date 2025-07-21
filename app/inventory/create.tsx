import { Stack, router } from 'expo-router';
import { Package, Save } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { useProducts } from '@/hooks/useProducts';

interface NewProduct {
  name: string;
  description: string;
  price: string;
  stock: string;
  cost: string; // Nuevo camp
  category: string;
}

const categoryOptions = [
  { value: 'Cables y Conectores', label: 'Cables y Conectores' },
  { value: 'Adaptadores y Fuentes de Poder', label: 'Adaptadores y Fuentes de Poder' },
  { value: 'Baterías', label: 'Baterías' },
  { value: 'Cargadores', label: 'Cargadores' },
  { value: 'Arduino', label: 'Arduino' },
  { value: 'Interruptores ', label: 'Interruptores ' },
  { value: 'Repuestos de Licuadora', label: 'Repuestos de Licuadora' },
  { value: 'Repuestos de Microonda', label: 'Repuestos de Microonda' },
];

export default function CreateProductScreen() {
  const { createProduct } = useProducts();
  const [product, setProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: '',
    cost: '', // Nuevo camp
    stock: '',
    category: '',
  });

  const [errors, setErrors] = useState<Partial<NewProduct>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSKU = () => {
    const categoryCode = product.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-XAN-${randomNum}`;
  };

  const handleGenerateSKU = () => {
    if (product.category) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await createProduct.mutateAsync({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        category: product.category,
        cost: parseFloat(product.cost),
      });
      
      Alert.alert('Éxito', 'Producto creado correctamente');
      router.back();
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
            <Button
              onPress={handleGenerateSKU}
              variant="outline"
              size="sm"
              style={styles.generateButton}
            >
              Generar
            </Button>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Precio e Inventario</Text>
          
          <Input
            label="Precio de Compra"
            placeholder="0.00"
            value={product.cost}
            onChangeText={(value) => setProduct(prev => ({ ...prev, cost: value }))}
            keyboardType="numeric"
            error={errors.cost}
          />
          
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