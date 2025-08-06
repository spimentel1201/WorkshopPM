import { EmptyState } from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/inventory';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

  const getDeleteLabel = (name: string) => `Eliminar producto: ${name}`;

  export default function InventoryScreen() {
    // Hooks at the top level - no conditions
    const router = useRouter();
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const searchBarRef = useRef<any>(null);
    
    // State for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
  
    // Initialize queries - simplified approach like pos.tsx
    const { 
      getProducts: productsQuery, 
      getCategories, 
      deleteProduct 
    } = useProducts();
  
    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
      try {
        setRefreshing(true);
        await Promise.allSettled([
          productsQuery.refetch(),
          getCategories.refetch()
        ]);
      } finally {
        setRefreshing(false);
      }
    }, [productsQuery, getCategories]);
  
    // Handle product deletion
    const handleDeleteProduct = useCallback((productId: string) => {
      Alert.alert(
        'Eliminar producto',
        '¿Estás seguro de que quieres eliminar este producto?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              deleteProduct.mutate(productId, {
                onSuccess: () => {
                  Alert.alert('Éxito', 'Producto eliminado correctamente');
                },
                onError: () => {
                  Alert.alert('Error', 'No se pudo eliminar el producto');
                }
              });
            },
          },
        ]
      );
    }, [deleteProduct]);
  
    // Handle edit navigation
    const handleEditProduct = useCallback((productId: string) => {
      router.push(`/inventory/${productId}/edit`);
    }, [router]);
  
    // Filter products locally like pos.tsx - much simpler and more efficient
    const filteredProducts = useMemo(() => {
      if (!productsQuery.data) return [];
      
      let products = productsQuery.data;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        products = products.filter((product: Product) => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        );
      }
      
      // Filter by category if selected
      if (selectedCategory) {
        products = products.filter(product => product.category === selectedCategory);
      }
      
      return products;
    }, [productsQuery.data, searchQuery, selectedCategory]);
  
    // Loading and error states - simplified
    const isLoading = productsQuery.isLoading || getCategories.isLoading;
    const error = productsQuery.error || getCategories.error;
  
    // Render product item
    const renderProductItem: ListRenderItem<Product> = useCallback(({ item }) => (
      <Card 
        style={styles.productCard}
        accessibilityLabel={`Producto: ${item.name}, Precio: S/ ${item.price.toFixed(2)}, Stock: ${item.stock},`}
      >
        <View style={styles.productHeader}>
          <Text 
            style={[
              styles.productName,
              isDark && styles.productNameDark
            ]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
            testID="product-name"
            accessibilityRole="text"
            accessibilityLabel={`Producto: ${item.name}`}
          >
            {item.name}
          </Text>
          <Text 
            style={styles.productPrice}
            testID="product-price"
          >
            S/ {Number(item.price).toFixed(2)}
          </Text>
        </View>
        
        {item.category && (
          <Text 
            style={styles.productCategory} 
            numberOfLines={1}
            testID="product-category"
          >
            {item.category}
          </Text>
        )}
        
        <View style={styles.productFooter}>
          <Text 
            style={[
              styles.productStock, 
              { color: item.stock > 0 ? '#4CAF50' : '#F44336' }
            ]}
            accessibilityLabel={`${item.stock} unidades en stock`}
            testID="product-stock"
          >
            {item.stock} en stock
          </Text>
          
          {user?.role === 'ADMIN' && (
            <View 
              style={styles.productActions} 
              accessibilityElementsHidden={user?.role !== 'ADMIN'}
              importantForAccessibility={user?.role === 'ADMIN' ? 'yes' : 'no-hide-descendants'}
            >
              <Button 
                variant="ghost" 
                size="sm"
                onPress={() => handleEditProduct(item.id)}
                accessibilityLabel={`Editar ${item.name}`}
              >
                <MaterialIcons name="edit" size={20} color="#007AFF" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onPress={() => handleDeleteProduct(item.id)}
                accessibilityLabel={getDeleteLabel(item.name)}
              >
                <MaterialIcons name="delete" size={20} color="#FF3B30" />
              </Button>
            </View>
          )}
        </View>
      </Card>
    ), [handleDeleteProduct, handleEditProduct, isDark, user?.role]);

    // Early returns for loading and error states
    if (isLoading && !refreshing) {
      return <LoadingState message="Cargando productos..." />;
    }
  
    if (error) {
      return (
        <ErrorState 
          message="Error al cargar los productos" 
          onRetry={() => {
            productsQuery.refetch();
            getCategories.refetch();
          }} 
        />
      );
    }
  
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
          />
          
          {user?.role === 'ADMIN' && (
            <Button 
              onPress={() => router.push('/inventory/create')}
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Nuevo Producto</Text>
            </Button>
          )}
        </View>
  
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <EmptyState 
              title="No hay productos"
              description={searchQuery
                ? "No se encontraron productos que coincidan con tu búsqueda."
                : "No hay productos disponibles. Agrega uno nuevo para comenzar."} 
              icon={undefined} 
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  productCard: {
    padding: 16,
    borderRadius: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  productNameDark: {
    color: '#FFFFFF',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  productCategory: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStock: {
    fontSize: 14,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});