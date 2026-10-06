import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './services/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrderScreen from './screens/Order';
import AdminScreen from './screens/AdminScreen';
   import { logout } from './services/authApi';
   import { fetchSales } from './services/dataApi';
// =====================================================
// INITIAL MENU CATEGORIES (color map — 'All' reserved for the cashier filter)
// =====================================================
const initialMenuCategories = {
  Coffee: '#B99F96',
  'Chocolate Series': '#A9A34F',
  'Milky Series': '#FFC080',
  'Fruit Soda': '#F28B96',
  'Matcha Series': '#69C276',
  'Juice Refreshments': '#63B9AE',
};

// =====================================================
// INITIAL INGREDIENT CATEGORIES
// =====================================================
const initialIngredientCategories = [
  'Dairy',
  'Coffee',
  'Flavoring',
  'Powder',
  'Topping',
  'Soda & Juice',
];

// =====================================================
// INITIAL INGREDIENTS
// =====================================================
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


export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'home'
  const [user, setUser] = useState(null);

  // SHARED STATE — used by both Cashier (Order) and Admin screens
const [products, setProducts] = useState([]);
const [ingredients, setIngredients] = useState([]);
const [ingredientCategories, setIngredientCategories] = useState([]);
const [menuCategories, setMenuCategories] = useState({});
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!user) return;
  setLoading(true);

  async function loadData() {
    try {
      const [ingSnap, prodSnap, menuSnap, catSnap] = await Promise.all([
        getDocs(collection(db, 'ingredients')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'menuCategories')),
        getDocs(collection(db, 'ingredientCategories')),
      ]);
      setIngredients(ingSnap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id));
      setProducts(prodSnap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id));
      const menuObj = {};
      menuSnap.docs.forEach((d) => { menuObj[d.data().name] = d.data().color; });
      setMenuCategories(menuObj);
      setIngredientCategories(catSnap.docs.map((d) => d.data().name));

      if (user.role === 'admin') {
        const sales = await fetchSales();
        setSalesHistory(sales);
      }
    } catch (e) {
      console.log('Load error:', e.message);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, [user]);
  const [salesHistory, setSalesHistory] = useState([]);

  if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#5d4738" />
    </View>
  );
}

  if (screen === 'signup') {
    return (
      <>
        <SignupScreen onBackToLogin={() => setScreen('login')} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (screen === 'home' && user) {
const handleLogout = () => {
  logout();
  setUser(null);
  setScreen('login');
};
    if (user.role === 'admin') {
      return (
        <>
          <AdminScreen
            adminName={user.name}
            products={products}
            setProducts={setProducts}
            ingredients={ingredients}
            setIngredients={setIngredients}
            ingredientCategories={ingredientCategories}
            setIngredientCategories={setIngredientCategories}
            menuCategories={menuCategories}
            setMenuCategories={setMenuCategories}
            salesHistory={salesHistory}
            onLogout={handleLogout}
          />
          <StatusBar style="auto" />
        </>
      );
    }

    return (
      <>
        <OrderScreen
          cashierName={user.name}
          products={products}
          menuCategories={menuCategories}
          ingredients={ingredients}
          setIngredients={setIngredients}
          setSalesHistory={setSalesHistory}
          onLogout={handleLogout}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <LoginScreen
        onLoginSuccess={(profile) => {
          setUser(profile);
          setScreen('home');
        }}
        onGoToSignup={() => setScreen('signup')}
      />
      <StatusBar style="auto" />
    </>
  );
}