import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_MODE } from '../services/demo';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId
};

// Initialize Firebase
// The web demo never talks to Firebase, so it skips initialization entirely.
const app = DEMO_MODE ? null : initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = DEMO_MODE
  ? (null as any)
  : initializeAuth(app!, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

// Initialize Cloud Firestore and get a reference to the service
export const db = DEMO_MODE ? (null as any) : getFirestore(app!);

// Collections
export const collections = {
  users: 'users',
  expenses: 'expenses',
  incomes: 'incomes',
  services: 'services',
  serviceCategories: 'serviceCategories',
}; 