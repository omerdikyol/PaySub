import { ExpenseItem, Occurrence as ExpenseOccurrence } from '@/app/types/expense';

export function getExpenseOccurrencesInRange(expense: ExpenseItem, startDate: Date, endDate: Date): ExpenseOccurrence[] {
  const occurrences: ExpenseOccurrence[] = [];
  const start = new Date(expense.startDate);
  const recurrenceEnd = expense.recurrence.endDate ? new Date(expense.recurrence.endDate) : null;

  const getLastDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

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

  const addOccurrence = (date: Date) => {
    if (date >= startDate && date <= endDate && (!recurrenceEnd || date <= recurrenceEnd)) {
      const dateStr = date.toISOString();
      occurrences.push({
        date: dateStr,
        amount: expense.amount,
        paymentStatus: expense.paymentHistory[dateStr] || { isPaid: false }
      });
    }
  };

  if (expense.recurrence.type === 'once') {
    if (start >= startDate && start <= endDate) {
      addOccurrence(start);
    }
    return occurrences;
  }

  let currentDate = new Date(start);

  while (true) {
    if (currentDate > endDate || (recurrenceEnd && currentDate > recurrenceEnd)) {
      break;
    }

    if (currentDate >= startDate && currentDate <= endDate) {
      addOccurrence(new Date(currentDate));
    }

    const nextDate = getNextDate(
      currentDate,
      expense.recurrence.type === 'custom' && expense.recurrence.intervalUnit === 'day'
        ? 'daily'
        : expense.recurrence.type,
      expense.recurrence.type === 'custom' ? expense.recurrence.interval : 1
    );

    if (nextDate.getTime() === currentDate.getTime()) {
      break;
    }

    currentDate = nextDate;
  }

  return occurrences;
}