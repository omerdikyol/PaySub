import { IncomeItem, Occurrence as IncomeOccurrence } from '@/app/types/income';

export function getIncomeOccurrencesInRange(income: IncomeItem, startDate: Date, endDate: Date): IncomeOccurrence[] {
  const occurrences: IncomeOccurrence[] = [];
  const start = new Date(income.startDate);
  const recurrenceEnd = income.recurrence.endDate ? new Date(income.recurrence.endDate) : null;

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
      occurrences.push({
        date: date.toISOString(),
        amount: income.amount
      });
    }
  };

  if (income.recurrence.type === 'once') {
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
      income.recurrence.type === 'custom' && income.recurrence.intervalUnit === 'day'
        ? 'daily'
        : income.recurrence.type,
      income.recurrence.type === 'custom' ? income.recurrence.interval : 1
    );

    if (nextDate.getTime() === currentDate.getTime()) {
      break;
    }

    currentDate = nextDate;
  }

  return occurrences;
}