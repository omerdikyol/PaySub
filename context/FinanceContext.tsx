import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { expenseService, Expense } from '../services/firebase/expense.service';
import { incomeService, Income } from '../services/firebase/income.service';
import { useNotifications } from './NotificationContext';
import { NotificationService } from '@/services/NotificationService';

interface FinanceContextType {
  expenses: Expense[];
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpensePaymentStatus: (id: string, date: string, isPaid: boolean) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Omit<Income, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  refreshData: (startDate?: Date, endDate?: Date) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { notificationsEnabled, scheduleDailyNotifications } = useNotifications();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async (startDate?: Date, endDate?: Date) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedExpenses, fetchedIncomes] = await Promise.all([
        expenseService.getExpenses(currentUser.uid, startDate, endDate),
        incomeService.getIncomes(currentUser.uid, startDate, endDate)
      ]);
      const activeExpenses = fetchedExpenses.filter(expense => expense.isActive);
      setExpenses(activeExpenses);
      setIncomes(fetchedIncomes.filter(income => income.isActive));

      // Reschedule daily notifications if enabled
      if (notificationsEnabled) {
        await scheduleDailyNotifications(activeExpenses);
      }
    } catch (err) {
      setError('Failed to fetch financial data');
      console.error('Error fetching financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    try {
      const expenseWithDate = {
        ...expense,
        date: expense.date instanceof Date ? expense.date : new Date(expense.date),
      };

      await expenseService.addExpense({
        ...expenseWithDate,
        userId: currentUser.uid
      });
      await refreshData();
    } catch (err) {
      setError('Failed to add expense');
      throw err;
    }
  };

  const updateExpense = async (id: string, expense: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
    if (!currentUser) return;
    try {
      await expenseService.updateExpense(id, expense);
      await refreshData();
    } catch (err) {
      setError('Failed to update expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!currentUser) return;
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      await refreshData();
    } catch (err) {
      setError('Failed to delete expense');
      throw err;
    }
  };

  const updateExpensePaymentStatus = async (id: string, date: string, isPaid: boolean) => {
    if (!currentUser) return;
    try {
      await expenseService.updateExpensePaymentStatus(id, date, isPaid);
      
      // Update the local state immediately
      const updatedExpenses = expenses.map(expense => {
        if (expense.id === id) {
          return {
            ...expense,
            paymentHistory: {
              ...expense.paymentHistory,
              [date]: {
                isPaid,
                paidDate: isPaid ? new Date().toISOString() : null
              }
            }
          };
        }
        return expense;
      });
      
      setExpenses(updatedExpenses);

      // Reschedule daily notifications if enabled
      if (notificationsEnabled) {
        await scheduleDailyNotifications(updatedExpenses);
      }
    } catch (err) {
      setError('Failed to update payment status');
      throw err;
    }
  };

  const addIncome = async (income: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    try {
      const incomeWithDate = {
        ...income,
        date: income.date instanceof Date ? income.date : new Date(income.date),
      };

      await incomeService.addIncome({
        ...incomeWithDate,
        userId: currentUser.uid
      });
      await refreshData();
    } catch (err) {
      setError('Failed to add income');
      throw err;
    }
  };

  const updateIncome = async (id: string, income: Partial<Omit<Income, 'id' | 'userId' | 'createdAt'>>) => {
    if (!currentUser) return;
    try {
      await incomeService.updateIncome(id, income);
      await refreshData();
    } catch (err) {
      setError('Failed to update income');
      throw err;
    }
  };

  const deleteIncome = async (id: string) => {
    if (!currentUser) return;
    try {
      await incomeService.deleteIncome(id);
      setIncomes(prev => prev.filter(income => income.id !== id));
      await refreshData();
    } catch (err) {
      setError('Failed to delete income');
      throw err;
    }
  };

  const value = {
    expenses,
    incomes,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    updateExpensePaymentStatus,
    addIncome,
    updateIncome,
    deleteIncome,
    refreshData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
