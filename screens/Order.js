import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import PaymentScreen from './PaymentScreen';

export default function OrderScreen({
  cashierName,
  products,
  ingredients,
  setIngredients,
  setSalesHistory,
  onLogout,
}) {

  const menuCategoryColors = products.reduce((acc, p) => {
    if (!acc[p.category]) {
      // fallback color if not otherwise defined — App.js's menuCategories is the real source
      acc[p.category] = '#B99F96';
    }
    return acc;
  }, {});

  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPayment, setShowPayment] = useState(false);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // ADD TO ORDER
  const addToOrder = (product) => {
    const existingOrder = orders.find(item => item.id === product.id);
    if (existingOrder) {
      setOrders(
        orders.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrders([...orders, { ...product, quantity: 1 }]);
    }
  };

  // CHANGE QUANTITY
  const changeQuantity = (productId, amount) => {
    setOrders(
      orders
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // DEDUCT INGREDIENTS (based on recipes)
  const deductIngredientsForOrder = (cartItems) => {
    setIngredients(prevIngredients => {
      const updated = prevIngredients.map(ing => ({ ...ing }));

      cartItems.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product || !product.recipe) return;

        product.recipe.forEach(entry => {
          const ingredient = updated.find(ing => ing.name === entry.ingredient);
          if (ingredient) {
            const usedAmount = entry.amount * cartItem.quantity;
            ingredient.quantity = Math.max(0, ingredient.quantity - usedAmount);
          }
        });
      });

      return updated;
    });
  };

  // LOW STOCK CHECK
  const lowStockItems = ingredients.filter(ing => ing.quantity <= ing.threshold);

  // TOTAL PRICE
  const totalPrice = orders.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // FILTERED PRODUCTS
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter(product => product.category === selectedCategory);

  // PAYMENT SCREEN
  if (showPayment) {
    return (
      <PaymentScreen
        orders={orders}
        totalPrice={totalPrice}
        onBack={() => setShowPayment(false)}
        onVoid={() => {
          setOrders([]);
          setShowPayment(false);
        }}
        onPaymentComplete={({ paymentMode }) => {
          const now = new Date();
          deductIngredientsForOrder(orders);

          setSalesHistory(prev => [
            ...prev,
            {
              id: prev.length + 1,
              date: now.toLocaleString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              items: orders,
              total: totalPrice,
              paymentMode,
            },
          ]);

          setOrders([]);
          setShowPayment(false);
        }}
      />
    );
  }

  // PRODUCT BUTTON
  const ProductButton = ({ product }) => (
    <TouchableOpacity
      key={product.id}
      style={styles.product}
      onPress={() => addToOrder(product)}
    >
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₱ {product.price}.00</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* LOW STOCK NOTIFICATION */}
      {lowStockItems.length > 0 && (
        <View style={styles.lowStockBanner}>
          <Text style={styles.lowStockText}>
            ⚠ Low stock: {lowStockItems.map(i => i.name).join(', ')}
          </Text>
        </View>
      )}

      {/* ORDER SECTION */}
      <View style={styles.orderContainer}>

        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Order: #110</Text>
          <TouchableOpacity onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.orderList} showsVerticalScrollIndicator={false}>
          {orders.length === 0 ? (
            <Text style={styles.emptyOrder}>No items ordered yet.</Text>
          ) : (
            orders.map(item => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.quantityText}>{item.quantity}x</Text>
                <Text style={styles.orderItemPrice}>₱ {item.price * item.quantity}.00</Text>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => changeQuantity(item.id, -1)}
                >
                  <Text style={styles.smallButtonText}>−</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => changeQuantity(item.id, 1)}
                >
                  <Text style={styles.smallButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Price:</Text>
          <Text style={styles.totalAmount}>₱ {totalPrice}.00</Text>
        </View>

        <Text style={styles.cashier}>On Duty: {cashierName || 'Unknown'}</Text>

      </View>

      {/* MENU SECTION */}
      <View style={styles.menuContainer}>

        {/* CATEGORY FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PRODUCT LIST */}
        <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={true}>
          <View style={styles.filteredProducts}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.filteredProductWrapper}>
                <ProductButton product={product} />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* PAYMENT */}
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => setShowPayment(true)}
        >
          <Text style={styles.paymentText}>Payment</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#555555', padding: 10 },
  lowStockBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  lowStockText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  orderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    height: 260,
    borderTopWidth: 4,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderTitle: { fontSize: 15, fontWeight: 'bold' },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  orderList: { flex: 1 },
  emptyOrder: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 14 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderItemName: { flex: 1, fontSize: 13, fontWeight: 'bold' },
  quantityText: { width: 35, fontSize: 13, fontWeight: 'bold' },
  orderItemPrice: { width: 60, fontSize: 13, fontWeight: 'bold' },
  smallButton: {
    width: 28,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  smallButtonText: { fontSize: 18, fontWeight: 'bold' },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 8,
    marginTop: 5,
  },
  totalText: { fontSize: 14, fontWeight: 'bold' },
  totalAmount: { fontSize: 14, fontWeight: 'bold' },
  cashier: { fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  menuContainer: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
  },
  categoryScroll: { marginBottom: 8, marginTop: 4, flexGrow: 0 },
  categoryContainer: { flexDirection: 'row', gap: 6, paddingRight: 10 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
    backgroundColor: '#B99F96',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#999999',
  },
  selectedCategory: { borderWidth: 2, borderColor: '#333333' },
  categoryText: { fontSize: 12, fontWeight: 'bold' },
  productsScroll: { flex: 1 },
  filteredProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  filteredProductWrapper: { width: '31.5%' },
  product: {
    width: '100%',
    minHeight: 65,
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#777777',
    backgroundColor: '#B99F96',
  },
  productName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  productPrice: { fontSize: 12, marginTop: 5, fontWeight: 'bold', textAlign: 'center' },
  paymentButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#BBBBBB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#888888',
  },
  paymentText: { fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize' },
});