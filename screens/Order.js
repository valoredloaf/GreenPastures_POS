import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  
} from 'react-native';

import PaymentScreen from './PaymentScreen';
import { doc, writeBatch, collection, getDoc, runTransaction } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { confirmDialog } from '../services/dialog';

import { db } from '../services/firebase';

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function OrderScreen({
  cashierName,
  products,
  ingredients,
  setIngredients,
  setSalesHistory,
  menuCategories = {},
  onLogout,
}) {

  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPayment, setShowPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const loadOrderNumber = async () => {
    try {
      const snap = await getDoc(doc(db, 'counters', 'orders'));
      const data = snap.exists() ? snap.data() : null;
      const lastToday = data && data.date === getTodayString() ? data.last : 0;
      setOrderNumber(lastToday + 1);
    } catch (e) {
      console.log('Order number error:', e.message);
    }
  };
console.log('handleLogout was called');
    const handleLogout = () => {
    const message = orders.length > 0
      ? 'You have an unfinished order. If you log out, it will be lost. Log out anyway?'
      : 'Are you sure you want to log out?';

    confirmDialog('Log Out', message, 'Log Out', () => onLogout?.());
  };

  useEffect(() => {
    loadOrderNumber();
  }, []);

  const categories = ['All', ...Object.keys(menuCategories)];
  const colorFor = (category) => menuCategories[category] || '#B99F96';

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

  const deductIngredientsForOrder = (cartItems) => {
    const updated = ingredients.map(ing => ({ ...ing }));

    cartItems.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product || !product.recipe) return;

      product.recipe.forEach(entry => {
        const ingredient = updated.find(ing => ing.name === entry.ingredient);
        if (ingredient) {
          ingredient.quantity = Math.max(
            0,
            ingredient.quantity - entry.amount * cartItem.quantity
          );
        }
      });
    });

    setIngredients(updated);

    const batch = writeBatch(db);
    updated.forEach((ing, i) => {
      if (ing.quantity !== ingredients[i].quantity) {
        batch.update(doc(db, 'ingredients', String(ing.id)), { quantity: ing.quantity });
      }
    });
    batch.commit().catch(e => console.log('Stock save error:', e.message));
  };

  const lowStockItems = ingredients.filter(ing => ing.quantity <= ing.threshold);

  const totalPrice = orders.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const normalize = (text) => String(text || '').trim().toLowerCase();

  const categoryNames = Object.keys(menuCategories).map(normalize);

  const sortedProducts = [...products].sort((a, b) => {
    const positionA = categoryNames.indexOf(normalize(a.category));
    const positionB = categoryNames.indexOf(normalize(b.category));
    const rankA = positionA === -1 ? categoryNames.length : positionA;
    const rankB = positionB === -1 ? categoryNames.length : positionB;
    return rankA - rankB;
  });

  const filteredProducts =
    selectedCategory === 'All'
      ? sortedProducts
      : products.filter(product => normalize(product.category) === normalize(selectedCategory));

  console.log('Menu categories:', Object.keys(menuCategories));
  console.log('Product categories:', products.map(p => `${p.name} -> "${p.category}"`));
  // Reads the captured photo and turns it into a data URI, stored directly
  // in the sale document (no Firebase Storage — that path isn't reliable on RN).
  const uploadProof = async (uri) => {
    try {
      const resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64 = await FileSystem.readAsStringAsync(resized.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;

    } catch (e) {
      console.log('Proof read error:', e.message);
      Alert.alert('Photo processing failed', e.message);
      return null;
    }
  };

  if (showPayment) {
    return (
      <PaymentScreen
        orders={orders}
        totalPrice={totalPrice}
        cashierName={cashierName}
        orderNumber={orderNumber}
        onBack={() => setShowPayment(false)}
        onVoid={() => {
          setOrders([]);
          setShowPayment(false);
        }}
        onPaymentComplete={async ({ paymentMode, amountPaid, change, proofUri }) => {
          const now = new Date();
          const items = orders.map(o => ({
            id: o.id,
            name: o.name,
            price: o.price,
            quantity: o.quantity,
          }));

          let proofUrl = null;
          if (proofUri) {
            proofUrl = await uploadProof(proofUri);
          }

          let number = null;
          try {
            const counterRef = doc(db, 'counters', 'orders');
            const todayString = getTodayString();
            number = await runTransaction(db, async (tx) => {
              const snap = await tx.get(counterRef);
              const data = snap.exists() ? snap.data() : null;
              const lastToday = data && data.date === todayString ? data.last : 0;
              const next = lastToday + 1;
              tx.set(counterRef, { last: next, date: todayString });
              tx.set(doc(collection(db, 'sales')), {
                orderNumber: next,
                date: now.toISOString(),
                cashier: cashierName || 'Unknown',
                paymentMode,
                amountPaid: amountPaid ?? totalPrice,
                change: change ?? 0,
                total: totalPrice,
                items,
                proofUrl,
              });
              return next;
            });
          } catch (e) {
            console.log('Sale save error:', e.message);
          }

          deductIngredientsForOrder(orders);

          setSalesHistory(prev => [
            ...prev,
            {
              id: number ?? Date.now(),
              orderNumber: number,
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
              proofUrl,
            },
          ]);

          // The receipt screen takes over from here; onDone closes it
          return { orderNumber: number, date: now };
        }}
        onDone={() => {
          setOrders([]);
          setShowPayment(false);
          loadOrderNumber();
        }}
      />
    );
  }

  const ProductButton = ({ product }) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.product, { backgroundColor: colorFor(product.category) }]}
      onPress={() => addToOrder(product)}
    >
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₱ {product.price}.00</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {lowStockItems.length > 0 && (
        <View style={styles.lowStockBanner}>
          <Text style={styles.lowStockText}>
            ⚠ Low stock: {lowStockItems.map(i => i.name).join(', ')}
          </Text>
        </View>
      )}

      <View style={styles.orderContainer}>

        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Order: #{orderNumber ?? '...'}</Text>
          <TouchableOpacity
            onPress={() =>
              confirmDialog(
                'Log Out',
                'Are you sure you want to log out?',
                'Log Out',
                () => onLogout?.()
              )
            }
          >
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

      <View style={styles.menuContainer}>

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
                { backgroundColor: category === 'All' ? '#D9D9D9' : colorFor(category) },
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={true}>
          <View style={styles.filteredProducts}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.filteredProductWrapper}>
                <ProductButton product={product} />
              </View>
            ))}
          </View>
        </ScrollView>

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
    marginHorizontal: -4,
    paddingBottom: 10,
  },
  filteredProductWrapper: { width: '33.333%', padding: 4 },
  product: {
    width: '100%',
    height: 78,
    borderRadius: 5,
    padding: 6,
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