import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDAUcpBt55BXl4iZ7hredT8xEs9vRW0KUY',
  authDomain: 'greenpastures-5e19c.firebaseapp.com',
  projectId: 'greenpastures-5e19c',
  storageBucket: 'greenpastures-5e19c.firebasestorage.app',
  messagingSenderId: '754102399168',
  appId: '1:754102399168:web:295a00447b0d1ad3577d25',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  // Web uses the browser's built-in persistence
  if (Platform.OS === 'web') return getAuth(app);
  // Native keeps the login in AsyncStorage; catch covers a hot reload re-initializing auth
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (e) {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);