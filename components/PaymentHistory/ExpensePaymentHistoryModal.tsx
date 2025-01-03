import React, { useState, useEffect } from 'react';
import { BasePaymentHistoryModal, BasePayment } from './BasePaymentHistoryModal';
import { ExpenseItem } from '@/app/types/expense';
import { PaymentStatus } from '@/app/types/expense';
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
  const [relatedPayments, setRelatedPayments] = useState<BasePayment[]>(props.payments);

  useEffect(() => {
    setRelatedPayments(props.payments);
  }, [props.payments]);

  const handlePaymentToggle = (payment: BasePayment) => {
    const dateStr = payment.date;
    const newIsPaidStatus = !payment.paymentStatus?.isPaid;

    if (!props.selectedExpense) {
      console.error('No selected expense');
      return;
    }

    updateExpensePaymentStatus(
      props.selectedExpense.id,
      dateStr,
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