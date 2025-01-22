import { SubscriptionService } from './service';

export interface ExpenseItem {
  id: string;
  userId?: string;
  amount: number;
  currency: string;
  name: string;
  date: Date;
  startDate: string;
  color?: string;
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    intervalUnit?: 'day' | 'month';
    endDate?: string;
  };
  service?: {
    id: string;
    name: string;
    logo?: string;
    customName?: string;
  };
  notification?: {
    enabled: boolean;
    daysInAdvance?: number;
    time?: {
      hour: number;
      minute: number;
    };
  };
  paymentHistory: {
    [key: string]: {
      isPaid: boolean;
      paidDate?: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Occurrence {
  id: string;
  date: string;
  amount: number;
  currency: string;
  name: string;
  color?: string;
  paymentStatus?: {
    isPaid: boolean;
    paidDate?: string;
  };
  originalExpense: ExpenseItem;
}