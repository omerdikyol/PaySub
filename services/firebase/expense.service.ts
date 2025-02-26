import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp, getDoc } from 'firebase/firestore';
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
  paymentHistory?: Record<string, {
    isPaid: boolean;
    paidDate: string | null;
    previousAmount?: number;
  }>;
  priceHistory?: Array<{
    previousAmount: number;
    newAmount: number;
    effectiveDate: Date;
    createdAt: Date;
  }>;
  effectiveDate?: Date;
  selectedDate?: Date;
  isActive: boolean;
  selectedOccurrenceDate?: string;
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
      const expenses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          paymentHistory: data.paymentHistory || {},
          priceHistory: data.priceHistory?.map((ph: any) => ({
            ...ph,
            effectiveDate: ph.effectiveDate.toDate(),
            createdAt: ph.createdAt.toDate()
          }))
        } as Expense;
      });

      // Return the base expense data without adjusting amounts
      // The amount adjustments will be handled by the getOccurrencesInRange function
      // which has access to the specific occurrence dates
      return expenses;
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) {
    try {
      const expenseWithActive = {
        ...expense,
        isActive: true,
        priceHistory: []
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
      const expenseDoc = await getDoc(expenseRef);
      const currentExpense = expenseDoc.data() as Expense;

      // If amount is being updated, create a price history record
      if (expense.amount !== undefined && expense.amount !== currentExpense.amount) {
        // Use the selectedOccurrenceDate as the effective date for price history
        const effectiveDate = expense.selectedOccurrenceDate 
          ? new Date(expense.selectedOccurrenceDate)
          : new Date();

        const priceHistoryEntry = {
          previousAmount: currentExpense.amount,
          newAmount: expense.amount,
          effectiveDate: Timestamp.fromDate(effectiveDate),
          createdAt: Timestamp.fromDate(new Date())
        };

        // Sort existing price history by effectiveDate
        const existingPriceHistory = currentExpense.priceHistory || [];
        const updatedPriceHistory = [
          ...existingPriceHistory,
          priceHistoryEntry
        ].sort((a, b) => {
          const dateA = a.effectiveDate instanceof Date ? a.effectiveDate : a.effectiveDate.toDate();
          const dateB = b.effectiveDate instanceof Date ? b.effectiveDate : b.effectiveDate.toDate();
          return dateA.getTime() - dateB.getTime();
        });

        // Remove selectedOccurrenceDate from the update data as it's not needed in the document
        const { selectedOccurrenceDate, ...updateData } = expense;

        await updateDoc(expenseRef, {
          ...updateData,
          date: expense.date ? Timestamp.fromDate(expense.date) : undefined,
          priceHistory: updatedPriceHistory,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        // Remove selectedOccurrenceDate from the update data if it exists
        const { selectedOccurrenceDate, ...updateData } = expense;
        
        await updateDoc(expenseRef, {
          ...updateData,
          date: expense.date ? Timestamp.fromDate(expense.date) : undefined,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
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