import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrderScreen from './screens/Order';

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup' | 'home'
  const [user, setUser] = useState(null);

  if (screen === 'signup') {
    return (
      <>
        <SignupScreen onBackToLogin={() => setScreen('login')} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (screen === 'home' && user) {
    return (
      <>
        <OrderScreen
          cashierName={user.name}
          onLogout={() => {
            setUser(null);
            setScreen('login');
          }}
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