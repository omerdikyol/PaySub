export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type IntervalUnit = 'day' | 'month';

export type IncomeItem = {
  id: string;
  amount: number;
  currency: string;
  name: string;
  startDate: string;
  color: string;
  recurrence: {
    type: RecurrenceType;
    interval?: number;
    intervalUnit?: IntervalUnit;
    endDate?: string;
  };
};

export type Occurrence = {
  date: string;
  amount: number;
};