import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Dimensions, Alert, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Edit, Package, Calendar, DollarSign, Hash, Tag, Building, Smartphone, AlertTriangle, ArrowLeft } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Mock product data (same as inventory screen)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pantalla LCD Samsung Galaxy S21',
    description: 'Pantalla de repuesto original para Samsung Galaxy S21. Compatible con modelos SM-G991B, SM-G991B/DS, SM-G991U, SM-G991U1. Incluye digitalizador táctil y marco. Resolución Full HD+ 2400x1080 píxeles. Tecnología Dynamic AMOLED 2X con soporte HDR10+.',
    sku: 'SCR-SAM-S21',
    price: 120,
    stock: 15,
    category: 'Pantallas',
    brand: 'Samsung',
    model: 'Galaxy S21',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Batería HP Pavilion',
    description: 'Batería de repuesto para laptops HP Pavilion. Compatible con modelos 14-ce, 15-cs, 17-by. Capacidad 3950mAh, 11.55V. Tecnología Li-ion con protección contra sobrecarga y cortocircuito.',
    sku: 'BAT-HP-PAV',
    price: 85,
    stock: 8,
    category: 'Baterías',
    brand: 'HP',
    model: 'Pavilion',
    imageUrl: 'https://images.unsplash.com/photo-1609592806596-b43bada2d7b5?w=400&h=400&fit=crop',
    createdAt: '2025-06-02T11:30:00Z',
    updatedAt: '2025-06-02T11:30:00Z',
  },
  {
    id: '3',
    name: 'Placa madre ASUS ROG',
    description: 'Placa madre para computadoras gaming ASUS ROG. Socket AM4, chipset B550. Soporte para procesadores AMD Ryzen. 4 slots DDR4, PCIe 4.0, WiFi 6, Bluetooth 5.0.',
    sku: 'MB-ASUS-ROG',
    price: 250,
    stock: 5,
    category: 'Placas madre',
    brand: 'ASUS',
    model: 'ROG',
    imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    createdAt: '2025-06-03T09:15:00Z',
    updatedAt: '2025-06-03T09:15:00Z',
  },
  {
    id: '4',
    name: 'Cargador MacBook Pro',
    description: 'Cargador original para MacBook Pro. Potencia 61W USB-C. Compatible con MacBook Pro 13" (2016-2022). Incluye cable USB-C de 2 metros. Protección contra sobrevoltaje.',
    sku: 'CHG-MAC-PRO',
    price: 75,
    stock: 12,
    category: 'Cargadores',
    brand: 'Apple',
    model: 'MacBook Pro',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    createdAt: '2025-06-04T14:45:00Z',
    updatedAt: '2025-06-04T14:45:00Z',
  },
  {
    id: '5',
    name: 'Memoria RAM DDR4 8GB',
    description: 'Memoria RAM DDR4 8GB 2400MHz. Latencia CL17. Compatible con la mayoría de placas madre modernas. Ideal para gaming y aplicaciones profesionales.',
    sku: 'RAM-DDR4-8GB',
    price: 45,
    stock: 2,
    category: 'Memoria',
    brand: 'Kingston',
    model: 'ValueRAM',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop',
    createdAt: '2025-06-05T16:10:00Z',
    updatedAt: '2025-06-05T16:10:00Z',
  },
  {
    id: '6',
    name: 'Disco SSD 256GB',
    description: 'Disco de estado sólido 256GB SATA III. Velocidad de lectura hasta 560 MB/s. Ideal para mejorar el rendimiento de laptops y computadoras de escritorio.',
    sku: 'SSD-256GB',
    price: 65,
    stock: 0,
    category: 'Almacenamiento',
    brand: 'Crucial',
    model: 'MX500',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',
    createdAt: '2025-06-06T12:25:00Z',
    updatedAt: '2025-06-06T12:25:00Z',
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundProduct = mockProducts.find(p => p.id === id);
      if (!foundProduct) {
        throw new Error('Producto no encontrado');
      }
      return foundProduct;
    },
  });

  const handleEdit = () => {
    router.push(`/inventory/${id}/edit`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Simulate delete
            Alert.alert('Éxito', 'Producto eliminado exitosamente', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: 'error' as const, text: 'Sin stock', icon: <AlertTriangle size={14} color={theme.error} /> };
    if (stock <= 5) return { variant: 'warning' as const, text: 'Stock bajo', icon: <AlertTriangle size={14} color={theme.warning} /> };
    return { variant: 'success' as const, text: 'En stock', icon: <Package size={14} color={theme.success} /> };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Cargando producto...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
          <Package size={48} color={theme.text.tertiary} />
          <Text style={[styles.errorTitle, { color: theme.text.primary }]}>Producto no encontrado</Text>
          <Text style={[styles.errorDescription, { color: theme.text.secondary }]}>
            El producto que buscas no existe o ha sido eliminado.
          </Text>
          <Button onPress={() => router.back()}>
            Volver al inventario
          </Button>
        </View>
      </View>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: product.name,
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.text.primary },
          headerTintColor: theme.text.primary,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.text.primary} />
            </Pressable>
          ),
          headerRight: () => user?.role === UserRole.ADMIN ? (
            <Pressable onPress={handleEdit} style={styles.editButton}>
              <Edit size={20} color={theme.primary[500]} />
            </Pressable>
          ) : undefined
        }} 
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Product Image */}
        <Card style={[styles.imageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {product.imageUrl && !imageError ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.neutral[100] }]}>
              <Package size={64} color={theme.text.tertiary} />
            </View>
          )}
        </Card>

        {/* Product Info */}
        <Card style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={[styles.productName, { color: theme.text.primary }]}>{product.name}</Text>
              <View style={styles.skuContainer}>
                <Hash size={14} color={theme.text.tertiary} />
                <Text style={[styles.sku, { color: theme.text.tertiary }]}>{product.sku}</Text>
              </View>
            </View>
            <Badge variant={stockStatus.variant} text={stockStatus.text} />
          </View>

          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: theme.primary[600] }]}>${product.price.toFixed(2)}</Text>
            <View style={styles.stockInfo}>
              {stockStatus.icon}
              <Text style={[styles.stockText, { color: theme.text.secondary }]}>
                {product.stock} unidades disponibles
              </Text>
            </View>
          </View>
        </Card>

        {/* Product Details */}
        <Card style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Detalles del Producto</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Tag size={16} color={theme.text.tertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Categoría</Text>
              <Text style={[styles.detailValue, { color: theme.text.primary }]}>{product.category}</Text>
            </View>
          </View>

          {product.brand && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Building size={16} color={theme.text.tertiary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Marca</Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>{product.brand}</Text>
              </View>
            </View>
          )}

          {product.model && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Smartphone size={16} color={theme.text.tertiary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Modelo</Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>{product.model}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={16} color={theme.text.tertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Fecha de creación</Text>
              <Text style={[styles.detailValue, { color: theme.text.primary }]}>{formatDate(product.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={16} color={theme.text.tertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>Última actualización</Text>
              <Text style={[styles.detailValue, { color: theme.text.primary }]}>{formatDate(product.updatedAt)}</Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={[styles.descriptionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Descripción</Text>
          <Text style={[styles.description, { color: theme.text.secondary }]}>{product.description}</Text>
        </Card>

        {/* Admin Actions */}
        {user?.role === UserRole.ADMIN && (
          <Card style={[styles.actionsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Acciones</Text>
            <View style={styles.actionButtons}>
              <Button
                onPress={handleEdit}
                variant="outline"
                leftIcon={<Edit size={16} color={theme.primary[500]} />}
                style={styles.actionButton}
              >
                Editar Producto
              </Button>
              <Button
                onPress={handleDelete}
                variant="outline"
                leftIcon={<AlertTriangle size={16} color={theme.error} />}
                style={[styles.actionButton, { borderColor: theme.error }]}
              >
                <Text style={{ color: theme.error }}>Eliminar</Text>
              </Button>
            </View>
          </Card>
        )}
      </ScrollView>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 32,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 32,
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  imageCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: isTablet ? 300 : 200,
  },
  placeholderImage: {
    width: '100%',
    height: isTablet ? 300 : 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    lineHeight: 30,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sku: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    marginLeft: 6,
  },
  detailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});