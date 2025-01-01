type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type IntervalUnit = 'day' | 'month';

type PaymentStatus = {
    isPaid: boolean;
    paidDate?: string; // ISO string date
};

type Occurrence = {
    date: string; // ISO string date
    amount: number;
    paymentStatus: PaymentStatus;
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
    // Track payment status for each occurrence
    paymentHistory: Record<string, PaymentStatus>; // Key is ISO date string
    service?: {
        id: string;
        name: string;
        logo: string;
        customName?: string;
    };
};

export type { RecurrenceType, Occurrence, PaymentStatus };
export { ExpenseItem };
export default ExpenseItem;