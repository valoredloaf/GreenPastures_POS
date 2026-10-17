import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrderScreen from './screens/Order';
import AdminScreen from './screens/AdminScreen';
import { logout } from './services/authApi';
import { subscribeSales } from './services/dataApi';

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'home'
  const [user, setUser] = useState(null);

  // Shared state used by both the Cashier (Order) and Admin screens, filled live from Firestore
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientCategories, setIngredientCategories] = useState([]);
  const [menuCategories, setMenuCategories] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // The spinner goes away once each of these four has loaded once
    const pending = new Set(['ingredients', 'products', 'menuCategories', 'ingredientCategories']);
    const ready = (name) => {
      pending.delete(name);
      if (!pending.size) setLoading(false);
    };
    const fail = (name) => (e) => {
      console.log(`Listen error (${name}):`, e.message);
      ready(name);
    };

    const stops = [
      onSnapshot(collection(db, 'ingredients'), (snap) => {
        setIngredients(snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id));
        ready('ingredients');
      }, fail('ingredients')),

      onSnapshot(collection(db, 'products'), (snap) => {
        setProducts(snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id));
        ready('products');
      }, fail('products')),

      onSnapshot(collection(db, 'menuCategories'), (snap) => {
        const menuObj = {};
        snap.docs.forEach((d) => { menuObj[d.data().name] = d.data().color; });
        setMenuCategories(menuObj);
        ready('menuCategories');
      }, fail('menuCategories')),

      onSnapshot(collection(db, 'ingredientCategories'), (snap) => {
        setIngredientCategories(snap.docs.map((d) => d.data().name));
        ready('ingredientCategories');
      }, fail('ingredientCategories')),
    ];

    // Only admins can read sales (Firestore rules), so only they listen
    if (user.role === 'admin') {
      stops.push(
        subscribeSales(setSalesHistory, (e) => console.log('Sales listen error:', e.message))
      );
    }

    return () => stops.forEach((stop) => stop());
  }, [user]);

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
      setSalesHistory([]); // don't keep admin sales in memory after logout
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