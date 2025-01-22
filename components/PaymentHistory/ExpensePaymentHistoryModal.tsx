import React, { useState, useEffect } from 'react';
import { BasePaymentHistoryModal, BasePayment } from './BasePaymentHistoryModal';
import { ExpenseItem } from '@/app/types/expense';
import { useFinance } from '@/context/FinanceContext';

type ExpensePaymentHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedExpense: ExpenseItem | null;
  payments: BasePayment[];
  onPaymentToggle: (payment: BasePayment) => void;
};

export const ExpensePaymentHistoryModal = (props: ExpensePaymentHistoryModalProps) => {
  const { updateExpensePaymentStatus } = useFinance();
  const [relatedPayments, setRelatedPayments] = useState<BasePayment[]>([]);

  useEffect(() => {
    if (props.payments && props.selectedExpense) {
      // Map the payments to include payment status from payment history
      const updatedPayments = props.payments.map(payment => {
        const paymentDate = payment.date.split('T')[0];
        const paymentHistoryEntry = Object.entries(props.selectedExpense?.paymentHistory || {})
          .find(([timestamp]) => timestamp.split('T')[0] === paymentDate);
        const isPaid = paymentHistoryEntry?.[1]?.isPaid ?? false;
        const paidDate = paymentHistoryEntry?.[1]?.paidDate;

        return {
          ...payment,
          paymentStatus: {
            isPaid,
            paidDate
          }
        };
      });
      setRelatedPayments(updatedPayments);
    } else {
      setRelatedPayments([]);
    }
  }, [props.payments, props.selectedExpense]);

  const handlePaymentToggle = (payment: BasePayment) => {
    const dateStr = payment.date;
    const newIsPaidStatus = !payment.paymentStatus?.isPaid;

    if (!props.selectedExpense) {
      console.error('No selected expense');
      return;
    }

    // Find existing payment entry if any
    const expenseDate = dateStr.split('T')[0];
    const existingPaymentDate = Object.keys(props.selectedExpense.paymentHistory || {})
      .find(timestamp => timestamp.split('T')[0] === expenseDate);
    const timestamp = existingPaymentDate || dateStr;

    updateExpensePaymentStatus(
      props.selectedExpense.id,
      timestamp,
      newIsPaidStatus
    );

    setRelatedPayments(prev => 
      prev.map(p => {
        if (p.id === payment.id) {
          return {
            ...p,
            paymentStatus: {
              isPaid: newIsPaidStatus,
              paidDate: newIsPaidStatus ? new Date().toISOString() : undefined
            }
          };
        }
        return p;
      })
    );
  };

  return (
    <BasePaymentHistoryModal
      visible={props.visible}
      onClose={props.onClose}
      selectedItem={props.selectedExpense}
      payments={relatedPayments}
      onPaymentToggle={handlePaymentToggle}
    />
  );
};