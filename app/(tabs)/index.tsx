import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView, ThemedText, ThemedCard } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';
import { MonthNavigation } from '@/components/MonthNavigation';
import { ProgressBar } from '@/components/ProgressBar';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import { useDashboardCalculations } from '@/hooks/useDashboardCalculations';

export default function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { incomes, expenses } = useFinance();
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    remaining: 0,
    progress: 0,
    paid: 0,
    unpaid: 0,
    formatInPreferredCurrency: (amount: number) => `${amount}`,
    isLoading: true
  });

  const calculations = useDashboardCalculations(incomes, expenses, currentDate);

  useEffect(() => {
    calculations.then(setMonthlyData);
  }, [calculations]);

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
            {monthlyData.formatInPreferredCurrency(monthlyData.remaining)}
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
                {monthlyData.formatInPreferredCurrency(monthlyData.income)}
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
                {monthlyData.formatInPreferredCurrency(monthlyData.expenses)}
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
                  {monthlyData.formatInPreferredCurrency(monthlyData.unpaid)}
                </ThemedText>
              </View>
              <View style={styles.debtGroup}>
                <ThemedText style={styles.debtLabel}>Paid</ThemedText>
                <ThemedText style={[styles.debtAmount, { color: colors.success }]}>
                  {monthlyData.formatInPreferredCurrency(monthlyData.paid)}
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