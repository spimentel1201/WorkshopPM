import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Package, Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { useProductById } from '@/hooks/useProductById';
import useProducts from '@/hooks/useProducts';

interface EditProduct {
  name: string;
  description: string;
  price: string;
  cost: string; // Nuevo campo
  stock: string;
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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<EditProduct>({
    name: '',
    description: '',
    price: '',
    cost: '', // Nuevo campo
    stock: '',
    category: '',
  });

  const [errors, setErrors] = useState<Partial<EditProduct>>({});

  // Fetch product details
  const { data: productData, isLoading, isError, error } = useProductById(Array.isArray(id) ? id[0] : id);


  // Initialize form with product data
  useEffect(() => {
    if (productData) {
      setProduct({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        cost: productData.cost.toString(),
        stock: productData.stock.toString(),
        category: productData.category,
      });
    }
  }, [productData]);

  // Update product mutation
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await updateProduct.mutateAsync({
        id: Array.isArray(id) ? id[0] : id || '',
        data: {
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: parseInt(product.stock),
          category: product.category,
          cost: parseFloat(product.cost),
        }
      });
      
      Alert.alert('Éxito', 'Producto actualizado correctamente');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProduct> = {};

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
      newErrors.stock = 'El stock es requerido';
    } else if (isNaN(Number(product.stock)) || Number(product.stock) < 0) {
      newErrors.stock = 'Ingrese un stock válido';
    }

    if (!product.category) {
      newErrors.category = 'Seleccione una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando producto...</Text>
      </View>
    );
  }

  if (!productData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Producto no encontrado</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Editar Producto',
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
            <Text style={styles.title}>Editar Producto</Text>
            <Text style={styles.subtitle}>
              Modifique la información del producto
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
            label="Stock Actual"
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
            Actualizar Producto
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
  submitContainer: {
    marginTop: 24,
  },
});