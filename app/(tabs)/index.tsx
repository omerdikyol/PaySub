import { StyleSheet, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { ThemedView, ThemedText, ThemedCard } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';
import { MonthNavigation } from '@/components/MonthNavigation';
import { BalanceProgressBar } from '@/components/BalanceProgressBar';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from 'expo-router';
import { useDashboardCalculations } from '@/hooks/useDashboardCalculations';

export default function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { incomes, expenses } = useFinance();
  const fadeAnim = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScreenLayout>
      {/* Header */}
      <ThemedView style={styles.headerContainer}>
        <View>
          <ThemedText style={styles.welcomeText}>Welcome back</ThemedText>
          <ThemedText style={styles.headerTitle}>Dashboard</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Icon name="cog" size={24} color={colors.text} />
        </TouchableOpacity>
      </ThemedView>
      <MonthNavigation currentDate={currentDate} onMonthChange={setCurrentDate} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedCard style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <View>
                <ThemedText style={styles.cardTitle}>Monthly Balance</ThemedText>
                <ThemedText style={styles.subtitle}>
                  {monthlyData.remaining >= 0 ? 'Available to spend' : 'Over budget'}
                </ThemedText>
              </View>
              <Icon 
                name={monthlyData.remaining >= 0 ? "cash-plus" : "cash-minus"} 
                size={32} 
                color={monthlyData.remaining >= 0 ? colors.success : colors.error} 
              />
            </View>
            <ThemedText style={[
              styles.amount,
              { color: monthlyData.remaining >= 0 ? colors.success : colors.error }
            ]}>
              {monthlyData.formatInPreferredCurrency(monthlyData.remaining)}
            </ThemedText>
            <BalanceProgressBar 
              income={monthlyData.income}
              expenses={monthlyData.expenses}
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
                <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                  <Icon name="arrow-down" size={24} color={colors.success} />
                </View>
                <ThemedText style={styles.cardLabel}>Income</ThemedText>
                <ThemedText style={[styles.amount, styles.smallerAmount]}>
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
                <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
                  <Icon name="arrow-up" size={24} color={colors.error} />
                </View>
                <ThemedText style={styles.cardLabel}>Expenses</ThemedText>
                <ThemedText style={[styles.amount, styles.smallerAmount]}>
                  {monthlyData.formatInPreferredCurrency(monthlyData.expenses)}
                </ThemedText>
              </ThemedCard>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <ThemedCard style={[styles.card, styles.debtCard]}>
              <View style={styles.debtHeader}>
                <ThemedText style={styles.sectionTitle}>Payment Status</ThemedText>
                <Icon name="chevron-right" size={24} color={colors.text} />
              </View>
              <View style={styles.debtSection}>
                <View style={styles.debtGroup}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
                    <Icon name="clock-outline" size={24} color={colors.error} />
                  </View>
                  <ThemedText style={styles.debtLabel}>Unpaid</ThemedText>
                  <ThemedText style={[styles.debtAmount, { color: colors.error }]}>
                    {monthlyData.formatInPreferredCurrency(monthlyData.unpaid)}
                  </ThemedText>
                </View>
                <View style={styles.divider} />
                <View style={styles.debtGroup}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                    <Icon name="check-circle-outline" size={24} color={colors.success} />
                  </View>
                  <ThemedText style={styles.debtLabel}>Paid</ThemedText>
                  <ThemedText style={[styles.debtAmount, { color: colors.success }]}>
                    {monthlyData.formatInPreferredCurrency(monthlyData.paid)}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCard: {
    padding: 20,
    marginVertical: 15,
    borderRadius: 16,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    padding: 16,
    borderRadius: 16,
  },
  debtCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardLabel: {
    fontSize: 16,
    marginVertical: 8,
    opacity: 0.8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  smallerAmount: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressBar: {
    marginTop: 15,
    height: 8,
    borderRadius: 4,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  debtSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtGroup: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 15,
  },
  debtLabel: {
    fontSize: 14,
    marginVertical: 8,
    opacity: 0.7,
  },
  debtAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardWrapper: {
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});