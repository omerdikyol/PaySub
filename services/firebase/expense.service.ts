import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db, collections } from '../../config/firebase';

export interface Expense {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentStatus?: 'paid' | 'unpaid';
  paymentHistory?: Record<string, boolean>;
  isActive: boolean;
}

export const expenseService = {
  async getExpenses(userId: string, startDate?: Date, endDate?: Date) {
    try {
      let q = query(
        collection(db, collections.expenses),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(
          collection(db, collections.expenses),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          where('isActive', '==', true),
          orderBy('date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Expense[];
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) {
    try {
      const expenseWithActive = {
        ...expense,
        isActive: true
      };
      const docRef = await addDoc(collection(db, collections.expenses), {
        ...expenseWithActive,
        date: Timestamp.fromDate(expense.date),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return { id: docRef.id, ...expenseWithActive };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) {
    try {
      const expenseRef = doc(db, collections.expenses, id);
      await updateDoc(expenseRef, {
        ...expense,
        date: expense.date ? Timestamp.fromDate(expense.date) : undefined,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(id: string) {
    try {
      const expenseRef = doc(db, collections.expenses, id);
      await updateDoc(expenseRef, {
        isActive: false
      });
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  async updateExpensePaymentStatus(id: string, date: string, isPaid: boolean) {
    try {
      const expenseRef = doc(db, collections.expenses, id);
      await updateDoc(expenseRef, {
        [`paymentHistory.${date}`]: {
          isPaid,
          paidDate: isPaid ? new Date().toISOString() : null
        },
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating expense payment status:', error);
      throw error;
    }
  }
}; 