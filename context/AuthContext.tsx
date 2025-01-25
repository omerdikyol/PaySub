import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { deleteDoc, doc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        defaultCurrency: 'TRY',
        language: 'en',
        notificationPreferences: {
          defaultEnabled: true,
          defaultDaysInAdvance: 1,
          defaultTime: {
            hour: 12,
            minute: 0,
          },
        },
      });

      // After successful registration and user document creation, redirect to the main app
      router.replace('/(tabs)');
    } catch (error) {
      // If there's an error during registration or user document creation,
      // make sure to clean up by deleting the auth user if it was created
      if (auth.currentUser) {
        await firebaseDeleteUser(auth.currentUser);
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteUser = async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Delete user's expenses
      const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', currentUser.uid));
      const expenseSnapshot = await getDocs(expensesQuery);
      const expenseDeletes = expenseSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(expenseDeletes);

      // Delete user's incomes
      const incomesQuery = query(collection(db, 'incomes'), where('userId', '==', currentUser.uid));
      const incomeSnapshot = await getDocs(incomesQuery);
      const incomeDeletes = incomeSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(incomeDeletes);

      // Delete user document
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Delete user from Firebase Auth
      await firebaseDeleteUser(currentUser);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    deleteUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 