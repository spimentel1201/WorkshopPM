import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Pressable, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, Package, Edit, Trash2, AlertTriangle } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/inventory';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Mock products data
const mockProducts: Product[] = [
  {
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
  },
  {
    id: '2',
    name: 'Batería HP Pavilion',
    description: 'Batería de repuesto para laptops HP Pavilion',
    sku: 'BAT-HP-PAV',
    price: 85,
    stock: 8,
    category: 'Baterías',
    brand: 'HP',
    model: 'Pavilion',
    imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=BAT',
    createdAt: '2025-06-02T11:30:00Z',
    updatedAt: '2025-06-02T11:30:00Z',
  },
  {
    id: '3',
    name: 'Placa madre ASUS ROG',
    description: 'Placa madre para computadoras gaming ASUS ROG',
    sku: 'MB-ASUS-ROG',
    price: 250,
    stock: 5,
    category: 'Placas madre',
    brand: 'ASUS',
    model: 'ROG',
    imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=MB',
    createdAt: '2025-06-03T09:15:00Z',
    updatedAt: '2025-06-03T09:15:00Z',
  },
  {
    id: '4',
    name: 'Cargador MacBook Pro',
    description: 'Cargador original para MacBook Pro',
    sku: 'CHG-MAC-PRO',
    price: 75,
    stock: 12,
    category: 'Cargadores',
    brand: 'Apple',
    model: 'MacBook Pro',
    imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=CHG',
    createdAt: '2025-06-04T14:45:00Z',
    updatedAt: '2025-06-04T14:45:00Z',
  },
  {
    id: '5',
    name: 'Memoria RAM DDR4 8GB',
    description: 'Memoria RAM DDR4 8GB 2400MHz',
    sku: 'RAM-DDR4-8GB',
    price: 45,
    stock: 2,
    category: 'Memoria',
    brand: 'Kingston',
    model: 'ValueRAM',
    imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=RAM',
    createdAt: '2025-06-05T16:10:00Z',
    updatedAt: '2025-06-05T16:10:00Z',
  },
  {
    id: '6',
    name: 'Disco SSD 256GB',
    description: 'Disco de estado sólido 256GB SATA',
    sku: 'SSD-256GB',
    price: 65,
    stock: 0,
    category: 'Almacenamiento',
    brand: 'Crucial',
    model: 'MX500',
    imageUrl: 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=SSD',
    createdAt: '2025-06-06T12:25:00Z',
    updatedAt: '2025-06-06T12:25:00Z',
  },
];

export default function InventoryScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockProducts;
    },
  });

  // Get unique categories
  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
    router.push('/inventory/create');
  };

  const handleProductPress = (productId: string) => {
    router.push(`/inventory/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/inventory/${productId}/edit`);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: 'error' as const, text: 'Sin stock' };
    if (stock <= 5) return { variant: 'warning' as const, text: 'Stock bajo' };
    return { variant: 'success' as const, text: 'En stock' };
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stock);
    
    return (
      <Pressable onPress={() => handleProductPress(item.id)}>
        <Card style={[styles.productCard, isTablet && styles.productCardTablet]}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productSku}>SKU: {item.sku}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
            </View>
            <Badge variant={stockStatus.variant} text={stockStatus.text} />
          </View>
          
          <View style={styles.productDetails}>
            <Text style={styles.productBrand}>
              {item.brand} {item.model && `- ${item.model}`}
            </Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          
          <View style={styles.productFooter}>
            <View style={styles.priceSection}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              <Text style={styles.stockText}>Stock: {item.stock}</Text>
            </View>
            
            {user?.role === UserRole.ADMIN && (
              <View style={styles.productActions}>
                <Pressable
                  onPress={() => handleEditProduct(item.id)}
                  style={styles.actionButton}
                >
                  <Edit size={16} color={colors.primary[500]} />
                </Pressable>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <Pressable
        onPress={() => setSelectedCategory('')}
        style={[
          styles.categoryButton,
          !selectedCategory && styles.categoryButtonActive
        ]}
      >
        <Text style={[
          styles.categoryButtonText,
          !selectedCategory && styles.categoryButtonTextActive
        ]}>
          Todas
        </Text>
      </Pressable>
      
      {categories.map(category => (
        <Pressable
          key={category}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive
          ]}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === category && styles.categoryButtonTextActive
          ]}>
            {category}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Package size={48} color={colors.neutral[400]} />}
      title="No hay productos"
      description="Agrega productos al inventario para comenzar a gestionar el stock."
      actionLabel={user?.role === UserRole.ADMIN ? "Agregar Producto" : undefined}
      onAction={user?.role === UserRole.ADMIN ? handleCreateProduct : undefined}
    />
  );

  // Calculate grid columns based on screen size
  const numColumns = isTablet ? 3 : 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Buscar productos..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {user?.role === UserRole.ADMIN && (
          <Button
            onPress={handleCreateProduct}
            leftIcon={<Plus size={18} color={theme.white} />}
            size={isTablet ? "md" : "sm"}
          >
            {isTablet ? "Nuevo Producto" : "Nuevo"}
          </Button>
        )}
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    height: 40,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  categoryButtonTextActive: {
    color: colors.white,
    fontWeight: '500' as const,
  },
  listContainer: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    marginBottom: 12,
  },
  productCardTablet: {
    flex: 1,
    marginHorizontal: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '500' as const,
  },
  productDetails: {
    marginBottom: 12,
  },
  productBrand: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
    marginBottom: 2,
  },
  stockText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});