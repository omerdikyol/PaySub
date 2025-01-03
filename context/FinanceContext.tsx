import React, { createContext, useContext, useState, useCallback } from 'react';
import { IncomeItem } from '@/app/types/income';
import { ExpenseItem } from '@/app/types/expense';

interface FinanceContextType {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  updateIncome: (id: string, income: Omit<IncomeItem, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<ExpenseItem, 'id'>) => void;
  deleteIncome: (id: string) => void;
  deleteExpense: (id: string) => void;
  updateExpensePaymentStatus: (expenseId: string, date: string, isPaid: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const addIncome = useCallback((income: Omit<IncomeItem, 'id'>) => {
    const newIncome: IncomeItem = {
      ...income,
      id: Date.now().toString(),
    };
    setIncomes(prev => {
      const updated = [...prev, newIncome];
      return updated;
    });
  }, []);

  const addExpense = useCallback((expense: Omit<ExpenseItem, 'id'>) => {
    const newExpense: ExpenseItem = {
      ...expense,
      id: Date.now().toString(),
      paymentHistory: {},
    };
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const updateIncome = useCallback((id: string, income: Omit<IncomeItem, 'id'>) => {
    setIncomes(prev => 
      prev.map(item => item.id === id ? { ...income, id } : item)
    );
  }, []);

  const updateExpense = useCallback((id: string, expense: Omit<ExpenseItem, 'id'>) => {
    setExpenses(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...expense, id, paymentHistory: item.paymentHistory }
          : item
      )
    );
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(item => item.id !== id));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateExpensePaymentStatus = useCallback((
    expenseId: string,
    date: string,
    isPaid: boolean
  ) => {
    setExpenses(prev => prev.map(expense => {
      if (expense.id !== expenseId) return expense;

      return {
        ...expense,
        paymentHistory: {
          ...expense.paymentHistory,
          [date]: {
            isPaid,
            paidDate: isPaid ? new Date().toISOString() : undefined,
          },
        },
      };
    }));
  }, []);

  return (
    <FinanceContext.Provider value={{
      incomes,
      expenses,
      addIncome,
      addExpense,
      updateIncome,
      updateExpense,
      deleteIncome,
      deleteExpense,
      updateExpensePaymentStatus,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
