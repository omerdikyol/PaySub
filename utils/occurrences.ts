import { ExpenseItem, Occurrence as ExpenseOccurrence } from '@/app/types/expense';
import { IncomeItem, Occurrence as IncomeOccurrence } from '@/app/types/income';

type FinanceItem = ExpenseItem | IncomeItem;
type OccurrenceResult = ExpenseOccurrence | IncomeOccurrence;

/**
 * Gets all occurrences of a finance item within a given date range
 * @param item The finance item (expense or income) to get occurrences for
 * @param startDate Start of the date range
 * @param endDate End of the date range
 * @returns Array of occurrences with payment status for expenses
 */
export function getOccurrencesInRange(item: FinanceItem, startDate: Date, endDate: Date): OccurrenceResult[] {
  const occurrences: OccurrenceResult[] = [];
  const start = new Date(item.startDate);
  const recurrenceEnd = item.recurrence.endDate ? new Date(item.recurrence.endDate) : null;

  // Helper function to get last day of month
  const getLastDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get next occurrence date considering month lengths
  const getNextDate = (currentDate: Date, type: string, interval: number = 1): Date => {
    const nextDate = new Date(currentDate);
    const originalDay = currentDate.getDate();
    const currentLastDay = getLastDayOfMonth(currentDate);
    const wasLastDay = originalDay === currentLastDay;
    const originalWasHighDay = originalDay > 28;

    switch (type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * interval));
        break;
      case 'monthly':
      case 'custom_month':
        nextDate.setDate(1);
        nextDate.setMonth(nextDate.getMonth() + interval);
        const nextMonthLastDay = getLastDayOfMonth(nextDate);
        nextDate.setDate(wasLastDay || originalWasHighDay ? nextMonthLastDay : originalDay);
        break;
      case 'yearly':
        nextDate.setDate(1);
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        const nextYearMonthLastDay = getLastDayOfMonth(nextDate);
        nextDate.setDate(wasLastDay || originalWasHighDay ? nextYearMonthLastDay : originalDay);
        break;
    }
    return nextDate;
  };

  // Function to add occurrence if it's within range
  const addOccurrence = (date: Date) => {
    if (date >= startDate && date <= endDate && (!recurrenceEnd || date <= recurrenceEnd)) {
      const dateStr = date.toISOString();
      const baseOccurrence = {
        date: dateStr,
        amount: item.amount,
      };

      // Add payment status only for expenses
      if ('paymentHistory' in item) {
        occurrences.push({
          ...baseOccurrence,
          paymentStatus: item.paymentHistory[dateStr] || { isPaid: false }
        } as ExpenseOccurrence);
      } else {
        occurrences.push(baseOccurrence as IncomeOccurrence);
      }
    }
  };

  // Handle one-time items
  if (item.recurrence.type === 'once') {
    if (start >= startDate && start <= endDate) {
      addOccurrence(start);
    }
    return occurrences;
  }

  let currentDate = new Date(start);

  // Handle recurring items
  while (true) {
    if (currentDate > endDate || (recurrenceEnd && currentDate > recurrenceEnd)) {
      break;
    }

    if (currentDate >= startDate && currentDate <= endDate) {
      addOccurrence(new Date(currentDate));
    }

    const nextDate = getNextDate(
      currentDate,
      item.recurrence.type === 'custom' && item.recurrence.intervalUnit === 'day'
        ? 'daily'
        : item.recurrence.type,
      item.recurrence.type === 'custom' ? item.recurrence.interval : 1
    );

    if (nextDate.getTime() === currentDate.getTime()) {
      break;
    }

    currentDate = nextDate;
  }

  return occurrences;
} 