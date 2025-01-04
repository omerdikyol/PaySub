import { useMemo } from 'react';
import { getOccurrencesInRange } from '@/utils/occurrences';
import { getExpenseOccurrencesInRange } from '@/utils/expenseOccurrences';
import { ExpenseItem } from '@/app/types/expense';
import { IncomeItem } from '@/app/types/income';
import { useCurrencyConversion } from './useCurrencyConversion';

export function useDashboardCalculations(
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  currentDate: Date
) {
  const {
    preferredCurrency,
    convertAmount,
    formatInPreferredCurrency,
    isLoading: isConverting
  } = useCurrencyConversion();

  // Calculate monthly totals with currency conversion
  const monthlyData = useMemo(async () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get all occurrences for the current month
    const monthIncomes = incomes.flatMap(income => 
      getOccurrencesInRange(income, monthStart, monthEnd)
        .map(occurrence => ({
          ...occurrence,
          currency: income.currency
        }))
    );
    
    const monthExpenses = expenses.flatMap(expense => 
      getExpenseOccurrencesInRange(expense, monthStart, monthEnd)
        .map(occurrence => ({
          ...occurrence,
          currency: expense.currency
        }))
    );

    // Convert all amounts to preferred currency
    const convertedIncomes = await Promise.all(
      monthIncomes.map(async inc => ({
        ...inc,
        convertedAmount: await convertAmount(inc.amount, inc.currency)
      }))
    );

    const convertedExpenses = await Promise.all(
      monthExpenses.map(async exp => ({
        ...exp,
        convertedAmount: await convertAmount(exp.amount, exp.currency)
      }))
    );

    // Calculate totals in preferred currency
    const totalIncome = convertedIncomes.reduce((sum, inc) => sum + inc.convertedAmount, 0);
    const totalExpense = convertedExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
    
    // Calculate paid vs unpaid expenses in preferred currency
    const paidExpenses = convertedExpenses.reduce((sum, exp) => 
      sum + (exp.paymentStatus?.isPaid ? exp.convertedAmount : 0), 0);
    const unpaidExpenses = convertedExpenses.reduce((sum, exp) => 
      sum + (!exp.paymentStatus?.isPaid ? exp.convertedAmount : 0), 0);

    // Calculate remaining budget
    const remaining = totalIncome - totalExpense;
    const spendingProgress = totalExpense / (totalIncome || 1); // Avoid division by zero

    return {
      income: totalIncome,
      expenses: totalExpense,
      remaining,
      progress: Math.min(spendingProgress, 1), // Cap at 100%
      paid: paidExpenses,
      unpaid: unpaidExpenses,
      preferredCurrency,
      formatInPreferredCurrency,
      isLoading: isConverting
    };
  }, [currentDate, incomes, expenses, preferredCurrency]);

  return monthlyData;
} 