import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db, collections } from '../../config/firebase';

export interface Income {
  id?: string;
  userId: string;
  amount: number;
  source: string;
  description: string;
  date: Date;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export const incomeService = {
  async getIncomes(userId: string, startDate?: Date, endDate?: Date) {
    try {
      let q = query(
        collection(db, collections.incomes),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(
          collection(db, collections.incomes),
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
      })) as Income[];
    } catch (error) {
      console.error('Error getting incomes:', error);
      throw error;
    }
  },

  async addIncome(income: Omit<Income, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) {
    try {
      const incomeWithActive = {
        ...income,
        isActive: true
      };
      const docRef = await addDoc(collection(db, collections.incomes), {
        ...incomeWithActive,
        date: Timestamp.fromDate(income.date),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return { id: docRef.id, ...incomeWithActive };
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },

  async updateIncome(id: string, income: Partial<Omit<Income, 'id' | 'createdAt' | 'isActive'>>) {
    try {
      const incomeRef = doc(db, collections.incomes, id);
      await updateDoc(incomeRef, {
        ...income,
        date: income.date ? Timestamp.fromDate(income.date) : undefined,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  },

  async deleteIncome(id: string) {
    try {
      const incomeRef = doc(db, collections.incomes, id);
      await updateDoc(incomeRef, {
        isActive: false
      });
      return true;
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }
}; 