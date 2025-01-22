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
}

export const incomeService = {
  async getIncomes(userId: string, startDate?: Date, endDate?: Date) {
    try {
      let q = query(
        collection(db, collections.incomes),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(
          collection(db, collections.incomes),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
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

  async addIncome(income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, collections.incomes), {
        ...income,
        date: Timestamp.fromDate(income.date),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },

  async updateIncome(id: string, income: Partial<Omit<Income, 'id' | 'createdAt'>>) {
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
      await deleteDoc(incomeRef);
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }
}; 