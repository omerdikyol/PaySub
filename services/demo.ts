// In-memory stand-ins for Firebase, used by the web demo (EXPO_PUBLIC_DEMO_MODE=1).
// All amounts, names and history below are made up; nothing is read from or written to Firebase.
import { PREDEFINED_SERVICES } from '@/app/types/service';

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === '1';

export const demoUser = { uid: 'demo-user', email: 'demo@example.com', displayName: 'Demo User' } as any;

const service = (id: string) => {
  for (const category of PREDEFINED_SERVICES) {
    const found = category.services.find((s) => s.id === id);
    if (found) return { id: found.id, name: found.name, logo: found.logo };
  }
  return undefined;
};

const now = new Date();
const monthStart = (offset: number, day: number) => new Date(now.getFullYear(), now.getMonth() + offset, day, 12);
const key = (d: Date) => d.toISOString().split('T')[0];

// Past due dates (including earlier this month) are marked paid so the payment history has content.
function paidHistory(day: number, months = 3) {
  const history: Record<string, { isPaid: boolean; paidDate: string | null }> = {};
  for (let m = -months; m < (day < now.getDate() ? 1 : 0); m++) {
    const d = monthStart(m, day);
    history[key(d)] = { isPaid: true, paidDate: d.toISOString() };
  }
  return history;
}

let nextId = 100;
const id = () => `demo-${nextId++}`;

function expense(name: string, amount: number, day: number, color: string, serviceId?: string, recurrence = 'monthly'): any {
  const start = monthStart(-4, day);
  return {
    id: id(),
    userId: demoUser.uid,
    amount,
    currency: 'TRY',
    name,
    category: color,
    description: name,
    date: start,
    startDate: start.toISOString(),
    color,
    recurrence: { type: recurrence },
    ...(serviceId && { service: service(serviceId) }),
    notification: { enabled: false },
    paymentHistory: recurrence === 'monthly' ? paidHistory(day) : {},
    priceHistory: [],
    isActive: true,
  };
}

let expenses: any[] = [
  expense('Netflix', 149.99, 5, '#E50914', 'netflix'),
  expense('Spotify', 59.99, 12, '#1DB954', 'spotify'),
  expense('Rent', 18500, 1, '#5856D6'),
  expense('Electricity', 940, 18, '#FF9500'),
  expense('Internet', 449.9, 22, '#007AFF'),
  expense('Gym membership', 1200, 3, '#34C759'),
  expense('Cloud storage', 39.99, 27, '#8E8E93'),
  expense('Car insurance', 14200, 9, '#FF3B30', undefined, 'yearly'),
];

let incomes: any[] = [
  { name: 'Salary', amount: 62000, day: 1, color: '#34C759', recurrence: { type: 'monthly' } },
  { name: 'Freelance project', amount: 9500, day: 15, color: '#007AFF', recurrence: { type: 'once' } },
].map((i) => {
  const date = i.recurrence.type === 'once' ? monthStart(0, i.day) : monthStart(-4, i.day);
  return { id: id(), userId: demoUser.uid, amount: i.amount, currency: 'TRY', name: i.name, source: i.name, description: '', date, startDate: date.toISOString(), color: i.color, recurrence: i.recurrence, isActive: true };
});

const copy = <T,>(items: T[]) => items.map((item) => ({ ...item }));

export const demoExpenseService = {
  async getExpenses() {
    return copy(expenses.filter((e) => e.isActive));
  },
  async addExpense(data: any) {
    const record = { ...data, id: id(), isActive: true, priceHistory: [], createdAt: new Date(), updatedAt: new Date() };
    expenses.push(record);
    return record;
  },
  async updateExpense(expenseId: string, data: any) {
    const { selectedOccurrenceDate, ...update } = data;
    expenses = expenses.map((e) => {
      if (e.id !== expenseId) return e;
      const priceHistory =
        update.amount !== undefined && update.amount !== e.amount
          ? [...(e.priceHistory || []), {
              previousAmount: e.amount,
              newAmount: update.amount,
              effectiveDate: selectedOccurrenceDate ? new Date(selectedOccurrenceDate) : new Date(),
              createdAt: new Date(),
            }]
          : e.priceHistory;
      return { ...e, ...update, priceHistory, updatedAt: new Date() };
    });
  },
  async deleteExpense(expenseId: string) {
    expenses = expenses.map((e) => (e.id === expenseId ? { ...e, isActive: false } : e));
    return true;
  },
  async updateExpensePaymentStatus(expenseId: string, date: string, isPaid: boolean) {
    const day = new Date(date).toISOString().split('T')[0];
    expenses = expenses.map((e) =>
      e.id === expenseId
        ? { ...e, paymentHistory: { ...e.paymentHistory, [day]: { isPaid, paidDate: isPaid ? new Date().toISOString() : null } } }
        : e,
    );
  },
};

export const demoIncomeService = {
  async getIncomes() {
    return copy(incomes.filter((i) => i.isActive));
  },
  async addIncome(data: any) {
    const record = { ...data, id: id(), isActive: true, createdAt: new Date(), updatedAt: new Date() };
    incomes.push(record);
    return record;
  },
  async updateIncome(incomeId: string, data: any) {
    incomes = incomes.map((i) => (i.id === incomeId ? { ...i, ...data, updatedAt: new Date() } : i));
  },
  async deleteIncome(incomeId: string) {
    incomes = incomes.map((i) => (i.id === incomeId ? { ...i, isActive: false } : i));
    return true;
  },
};
