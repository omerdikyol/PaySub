import { ExpenseItem, Occurrence as ExpenseOccurrence, PaymentHistoryItem } from '@/app/types/expense';

export function getExpenseOccurrencesInRange(
  expense: ExpenseItem,
  startDate: Date,
  endDate: Date,
  paymentHistories?: PaymentHistoryItem[]
): ExpenseOccurrence[] {
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

  const getHistoricalAmount = (date: Date): number | undefined => {
    if (!paymentHistories?.length) return undefined;

    // Find the most recent payment history entry before or on this date
    const relevantHistory = paymentHistories
      .filter(ph => ph.effectiveDate <= date)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())[0];

    return relevantHistory?.previousAmount;
  };

  const addOccurrence = (date: Date) => {
    if (date >= startDate && date <= endDate && (!recurrenceEnd || date <= recurrenceEnd)) {
      const dateStr = date.toISOString();
      const expenseDate = dateStr.split('T')[0];
      const paymentHistoryEntry = Object.entries(expense.paymentHistory || {})
        .find(([timestamp]) => timestamp.split('T')[0] === expenseDate);
      const paymentStatus = paymentHistoryEntry?.[1] || { isPaid: false };

      // Get the applicable amount based on price history
      let applicableAmount = expense.amount;
      let historicalAmount = undefined;

      if (expense.priceHistory?.length) {
        // Sort price history by effectiveDate in ascending order (oldest first)
        const sortedPriceHistory = [...expense.priceHistory]
          .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

        // Find the price that was in effect at this occurrence's date
        const occurrenceTime = date.getTime();
        let effectivePrice = null;

        for (let i = 0; i < sortedPriceHistory.length; i++) {
          const entry = sortedPriceHistory[i];
          const entryTime = new Date(entry.effectiveDate).getTime();

          if (entryTime <= occurrenceTime) {
            // This price change was before or at our occurrence
            effectivePrice = entry;
          } else {
            // This price change is after our occurrence
            break;
          }
        }

        if (effectivePrice) {
          // Use the price that was in effect at this date
          applicableAmount = effectivePrice.newAmount;
          historicalAmount = effectivePrice.previousAmount;
        } else {
          // If no price change was in effect yet, use the first entry's previous amount
          applicableAmount = sortedPriceHistory[0].previousAmount;
        }
      }

      // Get relevant payment histories for this occurrence
      const relevantPaymentHistories = paymentHistories?.filter(ph => {
        const phDate = new Date(ph.effectiveDate);
        return phDate <= date;
      }).sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());

      occurrences.push({
        id: `${expense.id}-${dateStr}`,
        date: dateStr,
        amount: applicableAmount,
        historicalAmount,
        currency: expense.currency,
        name: expense.name,
        color: expense.color,
        paymentStatus,
        paymentHistory: relevantPaymentHistories,
        originalExpense: expense
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