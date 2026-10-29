import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrderScreen from './screens/Order';
import AdminScreen from './screens/AdminScreen';
import { logout } from './services/authApi';
import { subscribeSales } from './services/dataApi';
import {
  loadCatalogCache,
  saveCatalogPart,
  saveSession,
  loadSession,
  clearSession,
  startSync,
} from './services/offline';

// Keeps every screen out from under the status bar, the camera cutout and the
// bottom navigation bar, whatever phone it runs on. 'color' fills the padded strip.
function Frame({ color = '#FFFFFF', children }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
}

// Change these if a screen's own background is a different color
const ORDER_BG = '#555555';
const ADMIN_BG = '#FFFFFF';
const LOGIN_BG = '#FFFFFF';

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'home'
  const [user, setUser] = useState(null);

  // Shared state used by both the Cashier (Order) and Admin screens, filled live from Firestore
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientCategories, setIngredientCategories] = useState([]);
  const [menuCategories, setMenuCategories] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // On startup: if this phone is still logged in, go straight to the home screen.
  // This works without internet, because Firebase keeps the login on the phone.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await auth.authStateReady();
        const saved = await loadSession();
        if (!cancelled && auth.currentUser && saved && saved.id === auth.currentUser.uid) {
          setUser(saved);
          setScreen('home');
        }
      } catch (e) {
        console.log('Session restore error:', e.message);
      }
      if (!cancelled) setBooting(false);
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let stops = [];
    let spinnerTimer = null;

    (async () => {
      // Show the last known menu and stock right away, even with no internet
      const cache = await loadCatalogCache();
      if (cancelled) return;

      const hasCache = Array.isArray(cache.products) && Array.isArray(cache.ingredients);
      if (hasCache) {
        setProducts(cache.products);
        setIngredients(cache.ingredients);
        setMenuCategories(cache.menuCategories || {});
        setIngredientCategories(cache.ingredientCategories || []);
        setLoading(false);
      } else {
        // First run on this phone: wait for Firestore, but never spin forever offline
        setLoading(true);
        spinnerTimer = setTimeout(() => setLoading(false), 8000);
      }

      // The spinner goes away once each of these four has loaded once
      const pending = new Set(['ingredients', 'products', 'menuCategories', 'ingredientCategories']);
      const ready = (name) => {
        pending.delete(name);
        if (!pending.size) {
          clearTimeout(spinnerTimer);
          setLoading(false);
        }
      };
      const fail = (name) => (e) => {
        console.log(`Listen error (${name}):`, e.message);
        ready(name);
      };

      // Offline, Firestore can report an empty list "from cache".
      // Ignore that, or it would wipe the saved menu.
      const listen = (name, onData) =>
        onSnapshot(
          collection(db, name),
          (snap) => {
            if (snap.metadata.fromCache && snap.empty) return;
            onData(snap);
            ready(name);
          },
          fail(name)
        );

      stops = [
        listen('ingredients', (snap) => {
          const list = snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id);
          setIngredients(list);
          saveCatalogPart('ingredients', list);
        }),

        listen('products', (snap) => {
          const list = snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id);
          setProducts(list);
          saveCatalogPart('products', list);
        }),

        listen('menuCategories', (snap) => {
          const menuObj = {};
          snap.docs.forEach((d) => { menuObj[d.data().name] = d.data().color; });
          setMenuCategories(menuObj);
          saveCatalogPart('menuCategories', menuObj);
        }),

        listen('ingredientCategories', (snap) => {
          const list = snap.docs.map((d) => d.data().name);
          setIngredientCategories(list);
          saveCatalogPart('ingredientCategories', list);
        }),
      ];

      // Only admins can read sales (Firestore rules), so only they listen
      if (user.role === 'admin') {
        stops.push(
          subscribeSales(setSalesHistory, (e) => console.log('Sales listen error:', e.message))
        );
      }

      // Uploads sales made offline whenever the connection is back
      stops.push(startSync());
    })();

    return () => {
      cancelled = true;
      clearTimeout(spinnerTimer);
      stops.forEach((stop) => stop());
    };
  }, [user]);

  if (booting || loading) {
    return (
      <Frame color={LOGIN_BG}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5d4738" />
        </View>
      </Frame>
    );
  }

  if (screen === 'signup') {
    return (
      <Frame color={LOGIN_BG}>
        <SignupScreen onBackToLogin={() => setScreen('login')} />
        <StatusBar style="dark" />
      </Frame>
    );
  }

  if (screen === 'home' && user) {
    const handleLogout = () => {
      logout();
      clearSession();
      setSalesHistory([]); // don't keep admin sales in memory after logout
      setUser(null);
      setScreen('login');
    };

    if (user.role === 'admin') {
      return (
        <Frame color={ADMIN_BG}>
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
          <StatusBar style="dark" />
        </Frame>
      );
    }

    return (
      <Frame color={ORDER_BG}>
        <OrderScreen
          cashierName={user.name}
          products={products}
          menuCategories={menuCategories}
          ingredients={ingredients}
          setIngredients={setIngredients}
          setSalesHistory={setSalesHistory}
          onLogout={handleLogout}
        />
        <StatusBar style="light" />
      </Frame>
    );
  }

  return (
    <Frame color={LOGIN_BG}>
      <LoginScreen
        onLoginSuccess={(profile) => {
          saveSession(profile);
          setUser(profile);
          setScreen('home');
        }}
        onGoToSignup={() => setScreen('signup')}
      />
      <StatusBar style="dark" />
    </Frame>
  );
}