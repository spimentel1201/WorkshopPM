import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Image, Pressable, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';
import { Product, SaleItem } from '@/types/inventory';

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
];

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

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    router.push({
      pathname: '/pos/checkout',
      params: { cartItems: JSON.stringify(cartItems) }
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <Card style={[styles.productCard, isTablet && styles.productCardTablet]}>
      <View style={styles.productContent}>
        <Image 
          source={{ uri: item.imageUrl || 'https://placehold.co/100x100/0072ff/FFFFFF.png?text=IMG' }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={[
              styles.stockText, 
              item.stock > 5 ? styles.inStock : styles.lowStock
            ]}>
              {item.stock > 0 ? `Stock: ${item.stock}` : 'Sin stock'}
            </Text>
          </View>
        </View>
      </View>
      <Button 
        onPress={() => addToCart(item)} 
        disabled={item.stock <= 0}
        size="sm"
        fullWidth
      >
        Agregar
      </Button>
    </Card>
  );

  const renderCartItem = ({ item }: { item: SaleItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.cartItemPrice}>${item.unitPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <Pressable onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
          <Minus size={16} color={colors.primary[500]} />
        </Pressable>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <Pressable onPress={() => increaseQuantity(item.id)} style={styles.quantityButton}>
          <Plus size={16} color={colors.primary[500]} />
        </Pressable>
        <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
          <Trash2 size={16} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <EmptyState
      icon={<ShoppingCart size={48} color={colors.neutral[400]} />}
      title="Carrito vacío"
      description="Agrega productos al carrito para realizar una venta."
    />
  );

  // Responsive layout
  if (isTablet) {
    return (
      <View style={styles.container}>
        <View style={styles.leftPanel}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.productList}
          />
        </View>
        
        <View style={styles.rightPanel}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Carrito de Compra</Text>
            {cartItems.length > 0 && (
              <Text style={styles.cartCount}>{cartItems.length} productos</Text>
            )}
          </View>
          
          {cartItems.length > 0 ? (
            <>
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.cartList}
              />
              
              <View style={styles.cartSummary}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
                </View>
                
                <Button 
                  onPress={handleCheckout} 
                  fullWidth
                  size="lg"
                >
                  Proceder al Pago
                </Button>
              </View>
            </>
          ) : (
            renderEmptyCart()
          )}
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.neutral[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {cartItems.length > 0 && (
          <Pressable 
            onPress={handleCheckout}
            style={styles.cartButton}
          >
            <ShoppingCart size={20} color={colors.white} />
            <Text style={styles.cartButtonText}>{cartItems.length}</Text>
          </Pressable>
        )}
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
      />
      
      {cartItems.length > 0 && (
        <View style={styles.mobileCartSummary}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total: ${calculateTotal().toFixed(2)}</Text>
            <Button onPress={handleCheckout}>
              Pagar ({cartItems.length})
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
    backgroundColor: colors.background,
  },
  leftPanel: {
    flex: 3,
    padding: 16,
    borderRightWidth: isTablet ? 1 : 0,
    borderRightColor: colors.neutral[200],
  },
  rightPanel: {
    flex: 2,
    padding: 16,
    backgroundColor: colors.white,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    height: 40,
    marginRight: isTablet ? 0 : 8,
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
  cartButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartButtonText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  productList: {
    paddingBottom: 16,
  },
  productCard: {
    marginBottom: 12,
    padding: 12,
  },
  productCardTablet: {
    flex: 1,
    margin: 8,
  },
  productContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  inStock: {
    color: colors.success,
  },
  lowStock: {
    color: colors.warning,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.neutral[800],
  },
  cartCount: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  cartList: {
    flexGrow: 1,
  },
  cartItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  cartItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.neutral[800],
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.primary[700],
    marginLeft: 8,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: 4,
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.neutral[800],
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  cartSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  mobileCartSummary: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.neutral[800],
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary[700],
  },
});