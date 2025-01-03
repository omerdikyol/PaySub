import React from 'react';
import { BasePaymentHistoryModal } from './BasePaymentHistoryModal';
import { IncomeItem } from '@/app/types/income';
import { Occurrence } from '@/app/types/income';

type IncomePaymentHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedIncome: IncomeItem | null;
  payments: Occurrence[];
};

export const IncomePaymentHistoryModal = (props: IncomePaymentHistoryModalProps) => {
  const mappedPayments = props.payments.map(payment => ({
    id: `${payment.date}`,
    date: payment.date,
    name: props.selectedIncome?.name || '',
    amount: payment.amount,
    currency: props.selectedIncome?.currency || ''
  }));

  return (
    <BasePaymentHistoryModal
      visible={props.visible}
      onClose={props.onClose}
      selectedItem={props.selectedIncome}
      payments={mappedPayments}
    />
  );
};