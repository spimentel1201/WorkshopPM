import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Package } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import colors from '@/constants/colors';
import { Product } from '@/types/inventory';

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Pantalla LCD Samsung Galaxy S21',
  description: 'Pantalla de repuesto original para Samsung Galaxy S21',
  sku: 'SCR-SAM-S21',
  price: 120,
  stock: 15,
  category: 'Pantallas',
  brand: 'Samsung',
  model: 'Galaxy S21',
  imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=LCD',
  createdAt: '2025-06-01T10:00:00Z',
  updatedAt: '2025-06-01T10:00:00Z',
};

interface EditProduct {
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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [product, setProduct] = useState<EditProduct>({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    model: '',
  });

  const [errors, setErrors] = useState<Partial<EditProduct>>({});

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockProduct;
    },
  });

  // Initialize form with product data
  useEffect(() => {
    if (productData) {
      setProduct({
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        category: productData.category,
        brand: productData.brand || '',
        model: productData.model || '',
      });
    }
  }, [productData]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: EditProduct) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { 
        ...productData!, 
        ...updatedProduct,
        price: Number(updatedProduct.price),
        stock: Number(updatedProduct.stock),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      Alert.alert(
        'Éxito',
        'Producto actualizado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProduct> = {};

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
      newErrors.stock = 'El stock es requerido';
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
    updateProductMutation.mutate(product);
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
          <Text style={styles.sectionTitle}>Identificación</Text>
          
          <Input
            label="SKU (Código del Producto)"
            placeholder="Ej: PAN-SAM-001"
            value={product.sku}
            onChangeText={(value) => setProduct(prev => ({ ...prev, sku: value }))}
            error={errors.sku}
          />

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
            loading={updateProductMutation.isPending}
            disabled={updateProductMutation.isPending}
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