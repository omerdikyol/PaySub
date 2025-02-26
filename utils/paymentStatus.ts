export const checkPaymentStatus = (expense: any, targetDate: string) => {
  const paymentHistory = expense.originalExpense?.paymentHistory || {};
  
  // Format target date to match date part only (YYYY-MM-DD)
  const targetDateObj = new Date(targetDate);
  const targetDateStr = targetDateObj.toISOString().split('T')[0];

  // First try exact match with the target date string
  if (paymentHistory[targetDate]?.isPaid) {
    return {
      isPaid: true,
      paidDate: paymentHistory[targetDate].paidDate
    };
  }
  
  // Then try with the normalized date string
  if (paymentHistory[targetDateStr]?.isPaid) {
    return {
      isPaid: true,
      paidDate: paymentHistory[targetDateStr].paidDate
    };
  }
  
  // Finally, try to find any entry that matches the date part
  for (const key in paymentHistory) {
    const keyDatePart = key.split('T')[0];
    if (keyDatePart === targetDateStr && paymentHistory[key]?.isPaid) {
      return {
        isPaid: true,
        paidDate: paymentHistory[key].paidDate
      };
    }
  }

  return {
    isPaid: false,
    paidDate: null
  };
};