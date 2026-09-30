import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrderScreen from './screens/Order';
import AdminScreen from './screens/AdminScreen';

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

// =====================================================
// INITIAL PRODUCTS (with recipes)
// =====================================================
const initialProducts = [
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

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'home'
  const [user, setUser] = useState(null);

  // SHARED STATE — used by both Cashier (Order) and Admin screens
  const [products, setProducts] = useState(initialProducts);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [ingredientCategories, setIngredientCategories] = useState(initialIngredientCategories);
  const [menuCategories, setMenuCategories] = useState(initialMenuCategories);
  const [salesHistory, setSalesHistory] = useState([]);

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