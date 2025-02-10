export const checkPaymentStatus = (expense: any, targetDate: string) => {
  const paymentHistory = expense.originalExpense?.paymentHistory || {};
  
  // Format target date to match date part only
  const targetDateStr = new Date(targetDate).toISOString().split('T')[0];

  // Check all payment entries
  for (const [timestamp, payment] of Object.entries(paymentHistory)) {
    // Compare only the date part
    const paymentDateStr = timestamp.split('T')[0];
    
    if (paymentDateStr === targetDateStr) {
      // Handle both nested and non-nested structures
      const paymentStatus = (payment as any)["025Z"] || payment;
      
      if (paymentStatus?.isPaid) {
        return {
          isPaid: true,
          paidDate: paymentStatus.paidDate
        };
      }
    }
  }

  return {
    isPaid: false,
    paidDate: null
  };
};