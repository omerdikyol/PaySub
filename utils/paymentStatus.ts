export const checkPaymentStatus = (expense: any, targetDate: string) => {
  const paymentHistory = expense.originalExpense?.paymentHistory || {};
  
  // Format target date to match Firebase timestamp format (without milliseconds)
  const targetDateObj = new Date(targetDate);
  const targetTimestamp = `${targetDateObj.toISOString().split('.')[0]}`;

  // Check all payment entries
  for (const [timestamp, payment] of Object.entries(paymentHistory)) {
    // Get the base timestamp without the milliseconds
    const baseTimestamp = timestamp;
    
    // Check if this is the payment entry we're looking for
    if (baseTimestamp === targetTimestamp) {
      // Access the nested payment status
      const paymentStatus = (payment as any)["025Z"];
      
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