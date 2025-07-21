import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ListRenderItem } from 'react-native';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/inventory';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '@/components/ui/SearchBar';
import {EmptyState} from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import {Card} from '@/components/ui/Card';
import { useQueryClient } from '@tanstack/react-query';

  // Eliminar el useMemo para getDeleteLabel y definirlo como una función normal
  // fuera del componente para evitar recreaciones

  // Antes de la definición del componente InventoryScreen
  const getDeleteLabel = (name: string) => `Eliminar producto: ${name}`;

  export default function InventoryScreen() {
    // Hooks at the top level - no conditions
    const router = useRouter();
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const queryClient = useQueryClient();
    const searchBarRef = useRef<any>(null);
    
    // State for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
  
    // Initialize all queries at the top level
    const { 
      getProducts: productsQuery, 
      searchProducts,
      getCategories, 
      deleteProduct 
    } = useProducts({ query: searchQuery });
  
    // Handle search query changes
    useEffect(() => {
      if (searchQuery) {
        setIsSearching(true);
        const timer = setTimeout(() => {
          searchProducts.refetch().finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setIsSearching(false);
      }
    }, [searchQuery, searchProducts]);
  
    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
      try {
        setRefreshing(true);
        const promises = [
          productsQuery.refetch(),
          getCategories.refetch()
        ];
        
        if (searchQuery) {
          promises.push(searchProducts.refetch());
        }
        
        await Promise.allSettled(promises);
      } finally {
        setRefreshing(false);
      }
    }, [productsQuery, getCategories, searchProducts, searchQuery]);
  
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
                  queryClient.invalidateQueries({ queryKey: ['products'] });
                },
                onError: () => {
                  Alert.alert('Error', 'No se pudo eliminar el producto');
                }
              });
            },
          },
        ]
      );
    }, [deleteProduct, queryClient]);
  
    // Handle edit navigation
    const handleEditProduct = useCallback((productId: string) => {
      router.push(`/inventory/${productId}/edit`);
    }, [router]);
  
    // Filter products by category
    const filteredProducts = useMemo(() => {
      if (searchQuery && searchProducts.data) {
        return searchProducts.data;
      }
      return (productsQuery.data || []).filter(
        (product: Product) => !selectedCategory || product.category === selectedCategory
      );
    }, [searchQuery, searchProducts.data, productsQuery.data, selectedCategory]);
  
    // Loading and error states
    const isLoading = productsQuery.isLoading || getCategories.isLoading || isSearching;
    const error = productsQuery.error || getCategories.error || searchProducts.error;
  
    // Render product item
    const renderProductItem: ListRenderItem<Product> = useCallback(({ item }) => (
      <Card 
        style={styles.productCard}
        accessibilityLabel={`Producto: ${item.name}, Precio: S/ ${item.price.toFixed(2)}, Stock: ${item.stock}`}
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
    ), [handleDeleteProduct, handleEditProduct, isDark, user?.role]); // Eliminar getDeleteLabel de las dependencias

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
            if (searchQuery) {
              searchProducts.refetch();
            }
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
              onPress={() => router.push('/inventory/new')}
              style={styles.addButton}
            >
              <MaterialIcons name="add" size={24} color="white" />
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
                : "No hay productos disponibles. Agrega uno nuevo para comenzar."} icon={undefined} />
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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