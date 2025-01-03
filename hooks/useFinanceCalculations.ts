import { useMemo } from 'react';
import { ExpenseItem } from '@/app/types/expense';
import { IncomeItem } from '@/app/types/income';
import { getExpenseOccurrencesInRange } from '@/utils/expenseOccurrences';
import { getIncomeOccurrencesInRange } from '@/utils/incomeOccurrences';


type CurrencyTotal = {
  [currency: string]: number;
};

type FinanceItem = ExpenseItem | IncomeItem;

export function useFinanceCalculations(
  items: FinanceItem[],
  currentDate: Date,
  searchQuery: string,
  sortCriteria: 'date' | 'price' | 'name',
  sortOrder: 'asc' | 'desc',
  isGrouped: boolean
) {
  // Calculate occurrences for the current month
  const monthOccurrences = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    monthEnd.setMilliseconds(-1);
    
    return items.flatMap(item => {
        const occurrences = 'paymentHistory' in item
          ? getExpenseOccurrencesInRange(item, monthStart, monthEnd)
          : getIncomeOccurrencesInRange(item, monthStart, monthEnd);
  
        return occurrences.map(occurrence => ({
          ...occurrence,
          id: `${item.id}-${occurrence.date}`,
          name: item.name,
          color: item.color,
          originalExpense: 'paymentHistory' in item ? item : undefined,
          originalIncome: !('paymentHistory' in item) ? item : undefined
        }));
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [items, currentDate]);

  // Calculate totals by currency
  const totalByCurrency = useMemo(() => {
    return monthOccurrences.reduce((totals, occurrence) => {
      const currency = occurrence.originalExpense?.currency || occurrence.originalIncome?.currency;
      totals[currency] = (totals[currency] || 0) + occurrence.amount;
      return totals;
    }, {} as CurrencyTotal);
  }, [monthOccurrences]);

  // Filter occurrences based on search
  const filteredOccurrences = useMemo(() => {
    return monthOccurrences.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [monthOccurrences, searchQuery]);

  // Sort filtered occurrences
  const sortedOccurrences = useMemo(() => {
    return filteredOccurrences.sort((a, b) => {
      switch (sortCriteria) {
        case 'date':
          return sortOrder === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'price':
          return sortOrder === 'asc' 
            ? a.amount - b.amount
            : b.amount - a.amount;
        case 'name':
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [filteredOccurrences, sortCriteria, sortOrder]);

  // Group sorted occurrences if needed
  const groupedOccurrences = useMemo(() => {
    if (!isGrouped) return sortedOccurrences;

    const groups = sortedOccurrences.reduce((acc, curr) => {
      const color = curr.originalExpense?.color || curr.originalIncome?.color;
      if (!acc[color]) {
        acc[color] = {
          id: color,
          color: color,
          amount: curr.amount,
          items: [curr],
          date: curr.date,
          originalExpense: curr.originalExpense,
          originalIncome: curr.originalIncome
        };
      } else {
        acc[color].amount += curr.amount;
        acc[color].items.push(curr);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups);
  }, [sortedOccurrences, isGrouped]);

  return {
    monthOccurrences,
    totalByCurrency,
    filteredOccurrences,
    sortedOccurrences,
    groupedOccurrences
  };
} 