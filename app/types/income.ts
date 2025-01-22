export interface Income {
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
  originalIncome: Income;
}