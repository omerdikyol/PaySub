import { useMemo, useState, useEffect } from 'react';
import { ExpenseItem } from '@/app/types/expense';
import { IncomeItem } from '@/app/types/income';
import { getExpenseOccurrencesInRange } from '@/utils/expenseOccurrences';
import { getIncomeOccurrencesInRange } from '@/utils/incomeOccurrences';
import { useCurrency } from '@/context/CurrencyContext';

type CurrencyTotal = {
  [currency: string]: number;
};

type FinanceItem = ExpenseItem | IncomeItem;

type ConvertedOccurrence = {
  id: string;
  date: string;
  name: string;
  color: string;
  amount: number;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  originalExpense?: ExpenseItem;
  originalIncome?: IncomeItem;
};

export function useFinanceCalculations(
  items: FinanceItem[],
  currentDate: Date,
  searchQuery: string,
  sortCriteria: 'date' | 'price' | 'name',
  sortOrder: 'asc' | 'desc',
  isGrouped: boolean
) {
  const {
    preferredCurrency,
    convertAmount,
    formatInPreferredCurrency,
    isLoading: isConverting
  } = useCurrency();

  const [convertedOccurrences, setConvertedOccurrences] = useState<ConvertedOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        originalAmount: occurrence.amount,
        originalCurrency: item.currency,
        convertedAmount: 0, // Will be populated later
        originalExpense: 'paymentHistory' in item ? item : undefined,
        originalIncome: !('paymentHistory' in item) ? item : undefined
      }));
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [items, currentDate]);

  // Convert all amounts to preferred currency
  useEffect(() => {
    const convertOccurrences = async () => {
      setIsLoading(true);
      try {
        const converted = await Promise.all(
          monthOccurrences.map(async occurrence => ({
            ...occurrence,
            convertedAmount: await convertAmount(
              occurrence.originalAmount,
              occurrence.originalCurrency
            )
          }))
        );
        setConvertedOccurrences(converted);
      } catch (error) {
        console.error('Error converting occurrences:', error);
        // On error, use original amounts
        setConvertedOccurrences(
          monthOccurrences.map(occurrence => ({
            ...occurrence,
            convertedAmount: occurrence.originalAmount
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    convertOccurrences();
  }, [monthOccurrences, preferredCurrency]);

  // Calculate totals in preferred currency
  const totalInPreferredCurrency = useMemo(() => {
    return convertedOccurrences.reduce(
      (total, occurrence) => total + occurrence.convertedAmount,
      0
    );
  }, [convertedOccurrences]);

  // Calculate totals by original currency
  const totalByCurrency = useMemo(() => {
    return monthOccurrences.reduce((totals, occurrence) => {
      const currency = occurrence.originalCurrency;
      totals[currency] = (totals[currency] || 0) + occurrence.originalAmount;
      return totals;
    }, {} as CurrencyTotal);
  }, [monthOccurrences]);

  // Filter occurrences based on search
  const filteredOccurrences = useMemo(() => {
    return convertedOccurrences.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [convertedOccurrences, searchQuery]);

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
            ? a.convertedAmount - b.convertedAmount
            : b.convertedAmount - a.convertedAmount;
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
      const color = curr.color;
      if (!acc[color]) {
        acc[color] = {
          id: color,
          color: color,
          name: curr.name,
          originalAmount: curr.originalAmount,
          originalCurrency: curr.originalCurrency,
          convertedAmount: curr.convertedAmount,
          items: [curr],
          date: curr.date,
          originalExpense: curr.originalExpense,
          originalIncome: curr.originalIncome
        };
      } else {
        acc[color].convertedAmount += curr.convertedAmount;
        acc[color].items.push(curr);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups);
  }, [sortedOccurrences, isGrouped]);

  return {
    monthOccurrences: convertedOccurrences,
    totalByCurrency,
    totalInPreferredCurrency,
    filteredOccurrences,
    sortedOccurrences,
    groupedOccurrences,
    preferredCurrency,
    formatInPreferredCurrency,
    isLoading: isLoading || isConverting
  };
} 