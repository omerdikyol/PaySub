type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type IntervalUnit = 'day' | 'month';

type Occurrence = {
    date: string; // ISO string date
    amount: number;
};

type ExpenseItem = {
    id: string;
    amount: number;
    currency: string;
    name: string;
    startDate: string;
    color: string;
    recurrence: {
        type: RecurrenceType;
        interval?: number;
        endDate?: string;
        intervalUnit?: IntervalUnit; 
    };
};

export type { RecurrenceType, Occurrence };
export { ExpenseItem };
export default ExpenseItem;