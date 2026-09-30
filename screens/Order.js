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
import AddProductsScreen from './AddProducts';
import ReportsScreen from './Reports';
import InventoryScreen from './Inventory';

const initialIngredientCategories = [
  'Dairy',
  'Coffee',
  'Flavoring',
  'Powder',
  'Topping',
  'Soda & Juice',
];

const initialIngredients = [
  { id: 1, name: 'Milk', unit: 'ml', quantity: 5000, threshold: 500, category: 'Dairy' },
  { id: 2, name: 'Brewed Coffee / Espresso', unit: 'ml', quantity: 2000, threshold: 300, category: 'Coffee' },
  { id: 3, name: 'Glucose', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 4, name: 'Condensed Milk', unit: 'ml', quantity: 1500, threshold: 150, category: 'Dairy' },
  { id: 5, name: 'Caramel Sauce', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 6, name: 'Salt', unit: 'g', quantity: 500, threshold: 50, category: 'Flavoring' },
  { id: 7, name: 'Vanilla', unit: 'ml', quantity: 500, threshold: 50, category: 'Flavoring' },
  { id: 8, name: 'Hazelnut Syrup', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 9, name: 'Fructose', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 10, name: 'Dark Chocolate Powder', unit: 'g', quantity: 1000, threshold: 100, category: 'Powder' },
  { id: 11, name: 'Strawberry Jam', unit: 'g', quantity: 1000, threshold: 100, category: 'Topping' },
  { id: 12, name: 'Strawberry Syrup', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 13, name: 'Strawberry Powder', unit: 'g', quantity: 500, threshold: 50, category: 'Powder' },
  { id: 14, name: 'Blueberry Jam', unit: 'g', quantity: 1000, threshold: 100, category: 'Topping' },
  { id: 15, name: 'Blueberry Syrup', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 16, name: 'Crushed Oreo', unit: 'g', quantity: 1000, threshold: 100, category: 'Topping' },
  { id: 17, name: 'Fruit Syrup (Green Apple / Lychee)', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 18, name: 'Jelly', unit: 'g', quantity: 1000, threshold: 100, category: 'Topping' },
  { id: 19, name: 'Blue Lemonade Powder', unit: 'g', quantity: 500, threshold: 50, category: 'Powder' },
  { id: 20, name: 'Lemon', unit: 'ml', quantity: 1000, threshold: 100, category: 'Flavoring' },
  { id: 21, name: 'Soda', unit: 'ml', quantity: 5000, threshold: 500, category: 'Soda & Juice' },
  { id: 22, name: 'Yakult', unit: 'ml', quantity: 1000, threshold: 100, category: 'Soda & Juice' },
  { id: 23, name: 'Cucumber Powder', unit: 'g', quantity: 500, threshold: 50, category: 'Powder' },
  { id: 24, name: 'Raspberry Powder', unit: 'g', quantity: 500, threshold: 50, category: 'Powder' },
  { id: 25, name: 'Matcha Powder', unit: 'g', quantity: 1000, threshold: 100, category: 'Powder' },
];

const initialProducts = [
  // COFFEE
  {
    id: 1, name: 'Salted Caramel\nCoffee', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Caramel Sauce', amount: 20 },
      { ingredient: 'Salt', amount: 2 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 2, name: 'Hazelnut Coffee', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Hazelnut Syrup', amount: 20 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 3, name: 'Cafe Latte', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Milk', amount: 130 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Glucose', amount: 20 },
    ],
  },
  {
    id: 4, name: 'Spanish Latte', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Condensed Milk', amount: 30 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 5, name: 'Caramel Macchiato', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Caramel Sauce', amount: 20 },
      { ingredient: 'Vanilla', amount: 10 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 6, name: 'Mocha', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Dark Chocolate Powder', amount: 20 },
    ],
  },
  {
    id: 7, name: 'Oreo Cream Latte', price: 80, category: 'Coffee',
    recipe: [
      { ingredient: 'Crushed Oreo', amount: 20 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 45 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  // CHOCOLATE SERIES
  {
    id: 11, name: 'Dark Chocolate', price: 60, category: 'Chocolate Series',
    recipe: [
      { ingredient: 'Dark Chocolate Powder', amount: 20 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 12, name: 'Cocoa Caramel', price: 60, category: 'Chocolate Series',
    recipe: [
      { ingredient: 'Dark Chocolate Powder', amount: 20 },
      { ingredient: 'Caramel Sauce', amount: 15 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 13, name: 'Dark Chocolate\nStrawberry', price: 60, category: 'Chocolate Series',
    recipe: [
      { ingredient: 'Dark Chocolate Powder', amount: 20 },
      { ingredient: 'Strawberry Jam', amount: 10 },
      { ingredient: 'Strawberry Syrup', amount: 10 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 14, name: 'Oreo Chocolate', price: 60, category: 'Chocolate Series',
    recipe: [
      { ingredient: 'Dark Chocolate Powder', amount: 20 },
      { ingredient: 'Milk', amount: 130 },
      { ingredient: 'Crushed Oreo', amount: 20 },
    ],
  },
  // MILKY SERIES
  {
    id: 8, name: 'Milky Strawberry', price: 80, category: 'Milky Series',
    recipe: [
      { ingredient: 'Strawberry Powder', amount: 20 },
      { ingredient: 'Strawberry Jam', amount: 15 },
      { ingredient: 'Milk', amount: 130 },
      { ingredient: 'Strawberry Syrup', amount: 5 },
    ],
  },
  {
    id: 9, name: 'Milky Blueberry', price: 60, category: 'Milky Series',
    recipe: [
      { ingredient: 'Blueberry Jam', amount: 20 },
      { ingredient: 'Milk', amount: 130 },
      { ingredient: 'Blueberry Syrup', amount: 10 },
    ],
  },
  {
    id: 10, name: 'Milky Oreo', price: 60, category: 'Milky Series',
    recipe: [
      { ingredient: 'Crushed Oreo', amount: 10 },
      { ingredient: 'Condensed Milk', amount: 20 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  // MATCHA SERIES
  {
    id: 15, name: 'Matcha Latte', price: 80, category: 'Matcha Series',
    recipe: [
      { ingredient: 'Matcha Powder', amount: 30 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 16, name: 'Strawberry Matcha\n(Ichigo)', price: 80, category: 'Matcha Series',
    recipe: [
      { ingredient: 'Matcha Powder', amount: 30 },
      { ingredient: 'Strawberry Jam', amount: 15 },
      { ingredient: 'Strawberry Syrup', amount: 5 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 17, name: 'Blueberry Matcha', price: 80, category: 'Matcha Series',
    recipe: [
      { ingredient: 'Matcha Powder', amount: 30 },
      { ingredient: 'Blueberry Jam', amount: 15 },
      { ingredient: 'Blueberry Syrup', amount: 5 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  {
    id: 18, name: 'Dirty Matcha', price: 80, category: 'Matcha Series',
    recipe: [
      { ingredient: 'Matcha Powder', amount: 30 },
      { ingredient: 'Brewed Coffee / Espresso', amount: 30 },
      { ingredient: 'Milk', amount: 130 },
    ],
  },
  // FRUIT SODA (12oz + 16oz)
  {
    id: 23, name: 'Blue Lemonade\nSoda (16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Blue Lemonade Powder', amount: 20 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Jelly', amount: 10 },
    ],
  },
  {
    id: 29, name: 'Blue Lemonade\nSoda (12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Blue Lemonade Powder', amount: 15 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Jelly', amount: 8 },
    ],
  },
  {
    id: 24, name: 'Green Apple\nSoda (16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 30 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Jelly', amount: 10 },
    ],
  },
  {
    id: 30, name: 'Green Apple\nSoda (12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 22 },
      { ingredient: 'Fructose', amount: 8 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Jelly', amount: 8 },
    ],
  },
  {
    id: 25, name: 'Strawberry Soda\n(16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 30 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Jelly', amount: 10 },
    ],
  },
  {
    id: 31, name: 'Strawberry Soda\n(12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 22 },
      { ingredient: 'Fructose', amount: 8 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Jelly', amount: 8 },
    ],
  },
  {
    id: 32, name: 'Blueberry Soda\n(16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 30 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Jelly', amount: 10 },
    ],
  },
  {
    id: 33, name: 'Blueberry Soda\n(12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 22 },
      { ingredient: 'Fructose', amount: 8 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Jelly', amount: 8 },
    ],
  },
  {
    id: 26, name: 'Lychee Soda\n(16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 30 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Jelly', amount: 10 },
    ],
  },
  {
    id: 34, name: 'Lychee Soda\n(12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Fruit Syrup (Green Apple / Lychee)', amount: 22 },
      { ingredient: 'Fructose', amount: 8 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Jelly', amount: 8 },
    ],
  },
  {
    id: 27, name: 'Lemon Yakult\nSoda (16oz)', price: 60, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Lemon', amount: 30 },
      { ingredient: 'Fructose', amount: 10 },
      { ingredient: 'Soda', amount: 130 },
      { ingredient: 'Yakult', amount: 20 },
    ],
  },
  {
    id: 28, name: 'Lemon Yakult\nSoda (12oz)', price: 50, category: 'Fruit Soda',
    recipe: [
      { ingredient: 'Lemon', amount: 22 },
      { ingredient: 'Fructose', amount: 8 },
      { ingredient: 'Soda', amount: 100 },
      { ingredient: 'Yakult', amount: 15 },
    ],
  },
  // JUICE REFRESHMENTS (12oz + 16oz)
  {
    id: 19, name: 'Cucumber Fresh\n(16oz)', price: 50, category: 'Juice Refreshments',
    recipe: [{ ingredient: 'Cucumber Powder', amount: 20 }],
  },
  {
    id: 21, name: 'Cucumber Fresh\n(12oz)', price: 40, category: 'Juice Refreshments',
    recipe: [{ ingredient: 'Cucumber Powder', amount: 15 }],
  },
  {
    id: 20, name: 'Raspberry Delight\n(16oz)', price: 50, category: 'Juice Refreshments',
    recipe: [{ ingredient: 'Raspberry Powder', amount: 20 }],
  },
  {
    id: 22, name: 'Raspberry Delight\n(12oz)', price: 40, category: 'Juice Refreshments',
    recipe: [{ ingredient: 'Raspberry Powder', amount: 15 }],
  },
];
// =====================================================
// ORDER SCREEN
// =====================================================
export default function OrderScreen({ cashierName, onLogout }) {

  const [products, setProducts] = useState(initialProducts);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [ingredientCategories, setIngredientCategories] = useState(initialIngredientCategories);

  const categoryColors = {
    All: '#D0D0D0',
    Coffee: '#B99F96',
    'Chocolate Series': '#A9A34F',
    'Milky Series': '#FFC080',
    'Fruit Soda': '#F28B96',
    'Matcha Series': '#69C276',
    'Juice Refreshments': '#63B9AE',
  };

  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [controlOpen, setControlOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);

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

  // INVENTORY SCREEN
  if (showInventory) {
    return (
      <InventoryScreen
        ingredients={ingredients}
        categories={ingredientCategories}
        onAddIngredient={(newIngredient) => {
          setIngredients(prev => [
            ...prev,
            { ...newIngredient, id: Math.max(...prev.map(i => i.id), 0) + 1 },
          ]);
        }}
        onUpdateIngredient={(id, updatedFields) => {
          setIngredients(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
          );
        }}
        onDeleteIngredient={(id) => {
          setIngredients(prev => prev.filter(item => item.id !== id));
        }}
        onAddCategory={(name) => {
          setIngredientCategories(prev => [...prev, name]);
        }}
        onRenameCategory={(oldName, newName) => {
          setIngredientCategories(prev =>
            prev.map(cat => (cat === oldName ? newName : cat))
          );
          setIngredients(prev =>
            prev.map(ing => (ing.category === oldName ? { ...ing, category: newName } : ing))
          );
        }}
        onDeleteCategory={(name) => {
          setIngredientCategories(prev => prev.filter(cat => cat !== name));
        }}
        onBack={() => setShowInventory(false)}
      />
    );
  }

  // REPORTS SCREEN
  if (showReports) {
    return (
      <ReportsScreen
        salesHistory={salesHistory}
        onBack={() => setShowReports(false)}
      />
    );
  }

  // ADD PRODUCT SCREEN
  if (showAddProduct) {
    return (
      <AddProductsScreen
        categories={Object.keys(categoryColors).filter(cat => cat !== 'All')}
        categoryColors={categoryColors}
        ingredients={ingredients}
        ingredientCategories={ingredientCategories}
        products={products}
        onAddProduct={(newProduct) => {
          setProducts(prev => [
            ...prev,
            { ...newProduct, id: Math.max(...prev.map(p => p.id), 0) + 1 },
          ]);
        }}
        onDeleteProduct={(id) => {
          setProducts(prev => prev.filter(p => p.id !== id));
        }}
        onBack={() => setShowAddProduct(false)}
      />
    );
  }

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
      style={[styles.product, { backgroundColor: categoryColors[product.category] }]}
      onPress={() => addToOrder(product)}
    >
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₱ {product.price}.00</Text>
    </TouchableOpacity>
  );

  // ALL CATEGORY COLUMN
  const CategoryColumn = ({ categories }) => {
    const columnProducts = products.filter(product =>
      categories.includes(product.category)
    );

    return (
      <View style={styles.categoryColumn}>
        {columnProducts.map(product => (
          <ProductButton key={product.id} product={product} />
        ))}
      </View>
    );
  };

  // SCREEN
  return (
    <View style={styles.container}>

      {/* ORDER SECTION */}
      <View style={styles.orderContainer}>

        <View style={styles.orderHeader}>
          <Text style={styles.date}>
              {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              {'\n'}
              {new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}
          </Text>
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

        <View style={styles.menuHeader}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setControlOpen(!controlOpen)}
          >
            <Text style={styles.controlButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {controlOpen && (
          <View style={styles.controlPanel}>


            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                setControlOpen(false);
                setShowInventory(true);
              }}
            >
              <Text style={styles.controlIcon}>▣</Text>
              <Text style={styles.controlText}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                setControlOpen(false);
                setShowReports(true);
              }}
            >
              <Text style={styles.controlIcon}>▤</Text>
              <Text style={styles.controlText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                setControlOpen(false);
                setShowAddProduct(true);
              }}
            >
              <Text style={styles.controlIcon}>🛒</Text>
              <Text style={styles.controlText}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlItem}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to log out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: () => {
                        setControlOpen(false);
                        onLogout?.();
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.controlIcon}>↪</Text>
              <Text style={styles.controlText}>Logout</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* CATEGORY FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {Object.keys(categoryColors).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { backgroundColor: categoryColors[category] },
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
          {selectedCategory === 'All' ? (
            <View style={styles.categoryColumns}>
              <CategoryColumn categories={['Coffee', 'Chocolate Series']} />
              <CategoryColumn categories={['Milky Series', 'Matcha Series']} />
              <CategoryColumn categories={['Fruit Soda', 'Juice Refreshments']} />
            </View>
          ) : (
            <View style={styles.filteredProducts}>
              {filteredProducts.map(product => (
                <View key={product.id} style={styles.filteredProductWrapper}>
                  <ProductButton product={product} />
                </View>
              ))}
            </View>
          )}
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
  orderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    height: 260,
    borderTopWidth: 4,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderTitle: { fontSize: 12, fontWeight: 'bold' },
  date: { fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  orderList: { flex: 1 },
  emptyOrder: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  orderItemName: { flex: 1, fontSize: 11, fontWeight: 'bold' },
  quantityText: { width: 35, fontSize: 11, fontWeight: 'bold' },
  orderItemPrice: { width: 55, fontSize: 11, fontWeight: 'bold' },
  smallButton: {
    width: 25,
    height: 25,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  smallButtonText: { fontSize: 16, fontWeight: 'bold' },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 8,
    marginTop: 5,
  },
  totalText: { fontSize: 12, fontWeight: 'bold' },
  totalAmount: { fontSize: 12, fontWeight: 'bold' },
  cashier: { fontSize: 10, fontWeight: 'bold', marginTop: 5 },
  menuContainer: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    marginTop: 5,
    borderRadius: 8,
    padding: 10,
  },
  menuHeader: { height: 42, alignItems: 'flex-end', justifyContent: 'center', marginBottom: 5 },
  controlButton: {
    width: 35,
    height: 35,
    backgroundColor: '#BBBBBB',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999999',
  },
  controlButtonText: { fontSize: 22, fontWeight: 'bold' },
  controlPanel: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: 125,
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
    padding: 5,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#555555',
    elevation: 10,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#AAAAAA',
  },
  controlIcon: { width: 25, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  controlText: { fontSize: 10, fontWeight: 'bold', marginLeft: 5 },
  categoryScroll: { marginBottom: 8, flexGrow: 0 },
  categoryContainer: { flexDirection: 'row', gap: 6, paddingRight: 10 },
  categoryButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#999999',
  },
  selectedCategory: { borderWidth: 2, borderColor: '#333333' },
  categoryText: { fontSize: 9, fontWeight: 'bold' },
  productsScroll: { flex: 1 },
  categoryColumns: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 5 },
  categoryColumn: { width: '31.5%' },
  filteredProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  filteredProductWrapper: { width: '31.5%' },
  product: {
    width: '100%',
    minHeight: 60,
    borderRadius: 5,
    padding: 7,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#777777',
  },
  productName: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  productPrice: { fontSize: 9, marginTop: 5, fontWeight: 'bold', textAlign: 'center' },
  paymentButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#BBBBBB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#888888',
  },
  paymentText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
});