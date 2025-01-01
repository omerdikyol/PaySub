import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView, ThemedText, ThemedCard, ThemedInput } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';
import { MonthNavigation } from '@/components/MonthNavigation';
import { ProgressBar } from '@/components/ProgressBar';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { IncomeItem, Occurrence } from '@/app/types/income';
import { ExpenseItem } from '@/app/types/expense';
import { formatCurrency } from '@/utils/currency';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';

function getOccurrencesInRange(income: IncomeItem, startDate: Date, endDate: Date): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const start = new Date(income.startDate);
  const recurrenceEnd = income.recurrence.endDate ? new Date(income.recurrence.endDate) : null;

  // Helper function to get last day of month
  const getLastDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get next occurrence date considering month lengths
  const getNextDate = (currentDate: Date, type: string, interval: number = 1): Date => {
      const nextDate = new Date(currentDate);
      const originalDay = currentDate.getDate();
      const currentLastDay = getLastDayOfMonth(currentDate);
      const wasLastDay = originalDay === currentLastDay;
      const originalWasHighDay = originalDay > 28; // Was 29, 30, or 31

      switch (type) {
          case 'daily':
              nextDate.setDate(nextDate.getDate() + interval);
              break;

          case 'weekly':
              nextDate.setDate(nextDate.getDate() + (7 * interval));
              break;

          case 'monthly':
          case 'custom_month':
              // First, set to first day to avoid skipping months
              nextDate.setDate(1);
              nextDate.setMonth(nextDate.getMonth() + interval);
              const nextMonthLastDay = getLastDayOfMonth(nextDate);

              // If original date was last day of month OR was a high day (29-31)
              if (wasLastDay || originalWasHighDay) {
                  // Always set to last day of target month
                  nextDate.setDate(nextMonthLastDay);
              } else {
                  // For normal days (1-28), keep the same day
                  nextDate.setDate(originalDay);
              }
              break;

          case 'yearly':
              // Same logic for yearly
              nextDate.setDate(1);
              nextDate.setFullYear(nextDate.getFullYear() + interval);
              const nextYearMonthLastDay = getLastDayOfMonth(nextDate);
              
              if (wasLastDay || originalWasHighDay) {
                  nextDate.setDate(nextYearMonthLastDay);
              } else {
                  nextDate.setDate(originalDay);
              }
              break;
      }

      return nextDate;
  };

  // Function to add occurrence if it's within range
  const addOccurrence = (date: Date) => {
      if (date >= startDate && date <= endDate && 
          (!recurrenceEnd || date <= recurrenceEnd)) {
          occurrences.push({
              date: date.toISOString(),
              amount: income.amount
          });
      }
  };

  // Handle one-time income
  if (income.recurrence.type === 'once') {
      if (start >= startDate && start <= endDate) {
          addOccurrence(start);
      }
      return occurrences;
  }

  let currentDate = new Date(start);

  // Handle recurring incomes
  while (true) { // Changed from currentDate <= endDate condition
      // Check if we've gone beyond the end date or recurrence end date
      if (currentDate > endDate || (recurrenceEnd && currentDate > recurrenceEnd)) {
          break;
      }

      // Add occurrence if it's within range
      if (currentDate >= startDate && currentDate <= endDate) {
          addOccurrence(new Date(currentDate));
      }

      // Get next date based on recurrence type
      const nextDate = getNextDate(currentDate, 
          income.recurrence.type === 'custom' && income.recurrence.intervalUnit === 'day' 
              ? 'daily' 
              : income.recurrence.type,
          income.recurrence.type === 'custom' ? income.recurrence.interval : 1
      );

      // Prevent infinite loop if next date wasn't changed
      if (nextDate.getTime() === currentDate.getTime()) {
          break;
      }

      currentDate = nextDate;
  }

  return occurrences;
}

function getExpenseOccurrencesInRange(expense: ExpenseItem, startDate: Date, endDate: Date): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const start = new Date(expense.startDate);
  const recurrenceEnd = expense.recurrence.endDate ? new Date(expense.recurrence.endDate) : null;

  // Helper function to get last day of month
  const getLastDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get next occurrence date considering month lengths
  const getNextDate = (currentDate: Date, type: string, interval: number = 1): Date => {
      const nextDate = new Date(currentDate);
      const originalDay = currentDate.getDate();
      const currentLastDay = getLastDayOfMonth(currentDate);
      const wasLastDay = originalDay === currentLastDay;
      const originalWasHighDay = originalDay > 28; // Was 29, 30, or 31

      switch (type) {
          case 'daily':
              nextDate.setDate(nextDate.getDate() + interval);
              break;

          case 'weekly':
              nextDate.setDate(nextDate.getDate() + (7 * interval));
              break;

          case 'monthly':
          case 'custom_month':
              // First, set to first day to avoid skipping months
              nextDate.setDate(1);
              nextDate.setMonth(nextDate.getMonth() + interval);
              const nextMonthLastDay = getLastDayOfMonth(nextDate);

              // If original date was last day of month OR was a high day (29-31)
              if (wasLastDay || originalWasHighDay) {
                  // Always set to last day of target month
                  nextDate.setDate(nextMonthLastDay);
              } else {
                  // For normal days (1-28), keep the same day
                  nextDate.setDate(originalDay);
              }
              break;

          case 'yearly':
              // Same logic for yearly
              nextDate.setDate(1);
              nextDate.setFullYear(nextDate.getFullYear() + interval);
              const nextYearMonthLastDay = getLastDayOfMonth(nextDate);
              
              if (wasLastDay || originalWasHighDay) {
                  nextDate.setDate(nextYearMonthLastDay);
              } else {
                  nextDate.setDate(originalDay);
              }
              break;
      }

      return nextDate;
  };

  // Function to add occurrence if it's within range
  const addOccurrence = (date: Date) => {
      if (date >= startDate && date <= endDate && 
          (!recurrenceEnd || date <= recurrenceEnd)) {
          const dateStr = date.toISOString();
          occurrences.push({
              date: dateStr,
              amount: expense.amount,
              paymentStatus: expense.paymentHistory[dateStr] || { isPaid: false }
          });
      }
  };

  // Handle one-time expense
  if (expense.recurrence.type === 'once') {
      if (start >= startDate && start <= endDate) {
          addOccurrence(start);
      }
      return occurrences;
  }

  let currentDate = new Date(start);

  // Handle recurring expenses
  while (true) { // Changed from currentDate <= endDate condition
      // Check if we've gone beyond the end date or recurrence end date
      if (currentDate > endDate || (recurrenceEnd && currentDate > recurrenceEnd)) {
          break;
      }

      // Add occurrence if it's within range
      if (currentDate >= startDate && currentDate <= endDate) {
          addOccurrence(new Date(currentDate));
      }

      // Get next date based on recurrence type
      const nextDate = getNextDate(currentDate, 
          expense.recurrence.type === 'custom' && expense.recurrence.intervalUnit === 'day' 
              ? 'daily' 
              : expense.recurrence.type,
          expense.recurrence.type === 'custom' ? expense.recurrence.interval : 1
      );

      // Prevent infinite loop if next date wasn't changed
      if (nextDate.getTime() === currentDate.getTime()) {
          break;
      }

      currentDate = nextDate;
  }

  return occurrences;
}

export default function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { incomes, expenses } = useFinance();

  // Calculate monthly totals
  const monthlyData = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get all occurrences for the current month
    const monthIncomes = incomes.flatMap(income => 
      getOccurrencesInRange(income, monthStart, monthEnd)
    );
    
    const monthExpenses = expenses.flatMap(expense => 
      getExpenseOccurrencesInRange(expense, monthStart, monthEnd)
    );

    // Calculate totals
    const totalIncome = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate paid vs unpaid expenses
    const paidExpenses = monthExpenses.reduce((sum, exp) => 
      sum + (exp.paymentStatus?.isPaid ? exp.amount : 0), 0);
    const unpaidExpenses = monthExpenses.reduce((sum, exp) => 
      sum + (!exp.paymentStatus?.isPaid ? exp.amount : 0), 0);

    // Calculate remaining budget
    const remaining = totalIncome - totalExpense;
    const spendingProgress = totalExpense / totalIncome; // For progress bar

    return {
      income: totalIncome,
      expenses: totalExpense,
      remaining,
      progress: Math.min(spendingProgress, 1), // Cap at 100%
      paid: paidExpenses,
      unpaid: unpaidExpenses
    };
  }, [currentDate, incomes, expenses]);

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        {/* Title and icons row */}
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
          <View style={styles.headerIcons}>
          </View>
        </View>
        {/* Month nav */}
        <MonthNavigation currentDate={currentDate} onMonthChange={setCurrentDate} />
      </View>

      {/* Rest of the dashboard content */}
      <ScrollView style={styles.scrollView}>
        <ThemedCard style={styles.mainCard}>
          <ThemedText style={styles.cardTitle}>Monthly Overview</ThemedText>
          <ThemedText style={[
            styles.amount,
            { color: monthlyData.remaining >= 0 ? colors.success : colors.error }
          ]}>
            {formatCurrency(monthlyData.remaining)}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {monthlyData.remaining >= 0 ? 'Left to spend' : 'Over budget'}
          </ThemedText>
          <ProgressBar 
            progress={monthlyData.progress}
            color={monthlyData.remaining >= 0 ? colors.primary : colors.error}
            style={styles.progressBar}
          />
        </ThemedCard>

        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/income')}
          >
            <ThemedCard style={[styles.card, styles.halfCard]}>
              <Icon name="arrow-down" size={24} color={colors.success} />
              <ThemedText style={styles.cardLabel}>Income</ThemedText>
              <ThemedText style={styles.amount}>
                {formatCurrency(monthlyData.income)}
              </ThemedText>
            </ThemedCard>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cardWrapper}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <ThemedCard style={[styles.card, styles.halfCard]}>
              <Icon name="arrow-up" size={24} color={colors.error} />
              <ThemedText style={styles.cardLabel}>Expenses</ThemedText>
              <ThemedText style={styles.amount}>
                {formatCurrency(monthlyData.expenses)}
              </ThemedText>
            </ThemedCard>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/expenses')}
        >
          <ThemedCard style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Debts</ThemedText>
            <View style={styles.debtSection}>
              <View style={styles.debtGroup}>
                <ThemedText style={styles.debtLabel}>Unpaid</ThemedText>
                <ThemedText style={[styles.debtAmount, { color: colors.error }]}>
                  {formatCurrency(monthlyData.unpaid)}
                </ThemedText>
              </View>
              <View style={styles.debtGroup}>
                <ThemedText style={styles.debtLabel}>Paid</ThemedText>
                <ThemedText style={[styles.debtAmount, { color: colors.success }]}>
                  {formatCurrency(monthlyData.paid)}
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  // Add new header styles
  fixedHeader: {
    zIndex: 1,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconButton: {
    padding: 8
  },
  searchInput: {
    height: 40,
    marginHorizontal: 10
  },
  // ...existing styles...
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mainCard: {
    padding: 20,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  halfCard: {
    flex: 1,
  },
  card: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 16,
    marginVertical: 5,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  progressBar: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  debtSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  debtGroup: {
    alignItems: 'center',
  },
  debtLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  debtAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardWrapper: {
    flex: 1,
  },
});