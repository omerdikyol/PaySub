export const checkPaymentStatus = (expense: any, targetDate: string) => {
  const paymentHistory = expense.originalExpense?.paymentHistory || {};
  
  // Format target date to match date part only
  const targetDateStr = new Date(targetDate).toISOString().split('T')[0];

  // Check if we have a payment entry for this date
  const paymentEntry = paymentHistory[targetDateStr] || paymentHistory[targetDate];
  
  if (paymentEntry?.isPaid) {
    return {
      isPaid: true,
      paidDate: paymentEntry.paidDate
    };
  }

  return {
    isPaid: false,
    paidDate: null
  };
};