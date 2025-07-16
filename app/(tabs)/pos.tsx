import { useRef, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Image, Pressable, Dimensions, Animated, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react-native';

import colors from '@/constants/colors';
import { Product, SaleItem } from '@/types/inventory';
import { useTheme } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

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
];

interface CartButtonProps {
  itemCount: number;
  onPress: () => void;
}

const CartButton = ({ itemCount, onPress }: CartButtonProps) => {
  useTheme();
  const animatedScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cartButtonContainer}
      accessibilityRole="button"
      accessibilityLabel={`Carrito de compras con ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
      accessibilityHint="Presiona para ver el carrito"
    >
      <Animated.View 
        style={[
          styles.cartButton,
          { 
            transform: [{ scale: animatedScale }],
            opacity: itemCount === 0 ? 0.8 : 1,
          }
        ]}
      >
        <ShoppingCart 
          size={22} 
          color={colors.white} 
          accessibilityElementsHidden
        />
        {itemCount > 0 && (
          <View 
          style={styles.badge}
          {...Platform.select({
            native: { accessibilityElementsHidden: true },
            default: { 'aria-hidden': true }
          })}
        >
          <Text 
            style={styles.badgeText}
            numberOfLines={1}
            minimumFontScale={0.8}
            adjustsFontSizeToFit
          >
            {itemCount > 9 ? '9+' : itemCount}
          </Text>
        </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function POSScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockProducts;
    },
  });

  // Filter products based on search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.model && product.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCartItems(
        cartItems.map(item => 
          item.productId === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice
              }
            : item
        )
      );
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          id: Date.now().toString(),
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        },
      ]);
    }
  };

  const increaseQuantity = (itemId: string) => {
    setCartItems(
      cartItems.map(item => 
        item.id === itemId
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice
            }
          : item
      )
    );
  };

  const decreaseQuantity = (itemId: string) => {
    setCartItems(
      cartItems.map(item => 
        item.id === itemId && item.quantity > 1
          ? { 
              ...item, 
              quantity: item.quantity - 1,
              totalPrice: (item.quantity - 1) * item.unitPrice
            }
          : item
      )
    );
  };

  const handleCheckout = () => {
    router.push({
      pathname: '/pos/checkout',
      params: { cartItems: JSON.stringify(cartItems) }
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productCardContent}>
          <View style={styles.productImageContainer}>
            <Image 
              source={{ uri: item.imageUrl || 'https://placehold.co/400x400/e5e7eb/6b7280?text=Sin+imagen' }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.priceStockContainer}>
              <Text style={styles.productPrice}>
                ${item.price.toFixed(2)}
              </Text>
              <Text style={[
                styles.productStock,
                item.stock < 5 && styles.lowStock
              ]}>
                {item.stock} en stock
              </Text>
            </View>
            
            <View style={styles.productActions}>
              {quantity > 0 ? (
                <View style={styles.quantitySelector}>
                  <Pressable 
                    onPress={() => decreaseQuantity(item.id)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <Minus size={16} color={colors.primary[600]} />
                  </Pressable>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <Pressable 
                    onPress={() => increaseQuantity(item.id)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    <Plus size={16} color={colors.primary[600]} />
                  </Pressable>
                </View>
              ) : (
                <Button 
                  size="sm"
                  onPress={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  variant={item.stock <= 0 ? 'ghost' : 'primary'}
                  style={styles.addButton}
                >
                  {item.stock > 0 ? 'Agregar' : 'Sin stock'}
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <ShoppingCart size={48} color={colors.neutral[400]} />
      <Text style={styles.emptyText}>No se encontraron productos</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.neutral[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <CartButton itemCount={cartItems.length} onPress={handleCheckout} />
        </View>
      </View>
      <View style={{ flex: 1 }}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={renderEmptyCart}
        numColumns={width > 1024 ? 4 : width > 768 ? 3 : 2}
        key={width > 768 ? 'tablet' : 'mobile'}
      />
</View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
    color: colors.neutral[500],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.neutral[800],
    padding: 0,
    margin: 0,
    fontFamily: 'System',
  },
  cartButtonContainer: {
    marginLeft: 12,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.primary[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'System',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  productList: {
    padding: 8,
    width: '100%',
    flexGrow: 1,
  },
  productCard: {
    flex: 1,
    minWidth: 140,
    maxWidth: width > 1200 ? '20%' : width > 900 ? '25%' : width > 600 ? '33.333%' : '48%',
    padding: 6,
    height: '100%',
  },
  productCardContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: '100%',
    justifyContent: 'space-between',
  },
  productImageContainer: {
    height: 90,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    padding: 6,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  priceStockContainer: {
    marginVertical: 6,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 4,
    minHeight: 32,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary[700],
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  lowStock: {
    color: colors.error,
  },
  productActions: {
    marginTop: 'auto',
    minHeight: 36,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
    marginHorizontal: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  addButton: {
    width: '100%',
    height: 36,
    minHeight: 36,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'System',
  },
});