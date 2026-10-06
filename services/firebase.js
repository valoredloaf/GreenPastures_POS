import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDAUcpBt55BXl4iZ7hredT8xEs9vRW0KUY",
  authDomain: 'greenpastures-5e19c.firebaseapp.com',
  projectId: 'greenpastures-5e19c',
  storageBucket: 'greenpastures-5e19c.firebasestorage.app',
  messagingSenderId: '754102399168',
  appId: "1:754102399168:web:295a00447b0d1ad3577d25",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});