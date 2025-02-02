import { SubscriptionService } from './service';

export interface ExpenseItem {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  name: string;
  startDate: Date;
  color: string;
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    endDate?: Date;
    intervalUnit?: 'day' | 'month';
  };
  notification?: {
    enabled: boolean;
    daysInAdvance: number;
    time: {
      hour: number;
      minute: number;
    };
  };
  paymentHistory?: {
    [key: string]: {
      isPaid: boolean;
      paidDate?: string;
    };
  };
  priceHistory?: Array<{
    previousAmount: number;
    newAmount: number;
    effectiveDate: Date;
    createdAt: Date;
  }>;
  effectiveDate?: Date;
  service?: {
    id: string;
    name: string;
    logo: string;
    customName?: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentHistoryItem {
  id: string;
  expenseId: string;
  userId: string;
  previousAmount: number;
  newAmount: number;
  currency: string;
  isPaid?: boolean;
  paidAmount?: number;
  paidDate?: Date;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Occurrence {
  id: string;
  date: string;
  amount: number;
  historicalAmount?: number;
  currency: string;
  name: string;
  color?: string;
  paymentStatus?: {
    isPaid: boolean;
    paidDate?: string;
  };
  paymentHistory?: PaymentHistoryItem[];
  originalExpense: ExpenseItem;
}