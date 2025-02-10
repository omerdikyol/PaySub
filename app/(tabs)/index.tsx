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
import { useLanguage } from '@/context/LanguageContext';
import { checkPaymentStatus } from '@/utils/paymentStatus';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';

export default function TabOneScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { incomes, expenses, isLoading: isDataLoading } = useFinance();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const {
    monthOccurrences,
    totalByCurrency,
    totalInPreferredCurrency,
    sortedOccurrences,
    preferredCurrency,
    formatInPreferredCurrency,
  } = useFinanceCalculations(
    expenses,
    currentDate,
    '', // no search query
    'date',
    'asc',
    false
  );

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

  const [isDataReady, setIsDataReady] = useState(false);
  const mainCardAnim = useRef(new Animated.Value(0)).current;
  const incomeExpenseAnim = useRef(new Animated.Value(0)).current;
  const paymentCardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isDataLoading) {
      calculations.then(data => {
        setMonthlyData(data);
        animateAllCards();
      });
    }
  }, [calculations, isDataLoading]);

  const calculatePaymentTotals = (occurrences: typeof monthOccurrences) => {
    let paidTotal = 0;
    let unpaidTotal = 0;

    occurrences.forEach(expense => {
      if (!expense?.originalExpense) return;
      const status = checkPaymentStatus(expense, expense.date);
      
      if (status.isPaid) {
        paidTotal += expense.convertedAmount;
      } else {
        unpaidTotal += expense.convertedAmount;
      }
    });

    return { paidTotal, unpaidTotal };
  };

  const animateAllCards = () => {
    setIsDataReady(false);
    
    mainCardAnim.setValue(0);
    incomeExpenseAnim.setValue(0);
    paymentCardAnim.setValue(0);

    Animated.sequence([
      Animated.delay(50),
      Animated.timing(mainCardAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(incomeExpenseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(paymentCardAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsDataReady(true);
    });
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentDate(newDate);
    animateAllCards();
  };

  useEffect(() => {
    const { paidTotal, unpaidTotal } = calculatePaymentTotals(monthOccurrences);
    setMonthlyData(prev => ({
      ...prev,
      paid: paidTotal,
      unpaid: unpaidTotal
    }));
    
    animateAllCards();
  }, [monthOccurrences]);

  const filterExpensesByPaymentStatus = (expenses: any[]) => {
    return expenses.filter(expense => {
      if (!expense?.originalExpense) return false;
      const status = checkPaymentStatus(expense, expense.date);
      return !status.isPaid; // Only show unpaid expenses in dashboard
    });
  };

  const filteredExpenses = filterExpensesByPaymentStatus(expenses);

  return (
    <ScreenLayout>
      {/* Header */}
      <ThemedView style={styles.headerContainer}>
        <View>
          <ThemedText style={styles.welcomeText}>{t('welcomeBack')}</ThemedText>
          <ThemedText style={styles.headerTitle}>{t('dashboard')}</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Icon name="cog" size={24} color={colors.text} />
        </TouchableOpacity>
      </ThemedView>
      <MonthNavigation 
        currentDate={currentDate} 
        onMonthChange={handleMonthChange}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View>
          <Animated.View style={{
            opacity: mainCardAnim,
            transform: [{
              translateY: mainCardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }}>
            <ThemedCard style={styles.mainCard}>
              {!isDataLoading && isDataReady ? (
                <>
                  <View style={styles.mainCardHeader}>
                    <View>
                      <ThemedText style={styles.cardTitle}>{t('monthlyBalance')}</ThemedText>
                      <ThemedText style={styles.subtitle}>
                        {monthlyData.remaining >= 0 ? t('availableToSpend') : t('overBudget')}
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
                </>
              ) : (
                <View style={[styles.shimmer, styles.mainCardShimmer]}>
                  <Animated.View style={{
                    transform: [{
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100]
                      })
                    }]
                  }}>
                    <View style={[styles.shimmer, styles.mainCardShimmer]} />
                  </Animated.View>
                </View>
              )}
            </ThemedCard>
          </Animated.View>

          <Animated.View style={{
            opacity: incomeExpenseAnim,
            transform: [{
              translateY: incomeExpenseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }}>
            <View style={styles.row}>
              <TouchableOpacity 
                style={styles.cardWrapper}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/income')}
              >
                <ThemedCard style={[styles.card, styles.halfCard]}>
                  {!isDataLoading && isDataReady ? (
                    <>
                      <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                        <Icon name="arrow-down" size={24} color={colors.success} />
                      </View>
                      <ThemedText style={styles.cardLabel}>{t('income')}</ThemedText>
                      <ThemedText style={[styles.amount, styles.smallerAmount]}>
                        {monthlyData.formatInPreferredCurrency(monthlyData.income)}
                      </ThemedText>
                    </>
                  ) : (
                    <View style={[styles.shimmer, styles.halfCardShimmer]}>
                      <Animated.View style={{
                        transform: [{
                          translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 100]
                          })
                        }]
                      }}>
                        <View style={[styles.shimmer, styles.halfCardShimmer]} />
                      </Animated.View>
                    </View>
                  )}
                </ThemedCard>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cardWrapper}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/expense')}
              >
                <ThemedCard style={[styles.card, styles.halfCard]}>
                  {!isDataLoading && isDataReady ? (
                    <>
                      <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
                        <Icon name="arrow-up" size={24} color={colors.error} />
                      </View>
                      <ThemedText style={styles.cardLabel}>{t('expense')}</ThemedText>
                      <ThemedText style={[styles.amount, styles.smallerAmount]}>
                        {monthlyData.formatInPreferredCurrency(monthlyData.expenses)}
                      </ThemedText>
                    </>
                  ) : (
                    <View style={[styles.shimmer, styles.halfCardShimmer]}>
                      <Animated.View style={{
                        transform: [{
                          translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 100]
                          })
                        }]
                      }}>
                        <View style={[styles.shimmer, styles.halfCardShimmer]} />
                      </Animated.View>
                    </View>
                  )}
                </ThemedCard>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/expense')}
          >
            <Animated.View style={{
              opacity: paymentCardAnim,
              transform: [{
                translateY: paymentCardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }}>
              <ThemedCard style={[styles.card, styles.debtCard]}>
                <View style={styles.debtHeader}>
                  <ThemedText style={styles.sectionTitle}>{t('paymentStatus')}</ThemedText>
                  <Icon name="chevron-right" size={24} color={colors.text} />
                </View>
                {!isDataLoading && isDataReady ? (
                  <Animated.View style={{
                    opacity: paymentCardAnim,
                    transform: [{
                      scale: paymentCardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1]
                      })
                    }]
                  }}>
                    <View style={styles.debtSection}>
                      <View style={styles.debtGroup}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
                          <Icon name="clock-outline" size={24} color={colors.error} />
                        </View>
                        <ThemedText style={styles.debtLabel}>{t('unpaid')}</ThemedText>
                        <ThemedText style={[styles.debtAmount, { color: colors.error }]}>
                          {monthlyData.formatInPreferredCurrency(monthlyData.unpaid)}
                        </ThemedText>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.debtGroup}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                          <Icon name="check-circle-outline" size={24} color={colors.success} />
                        </View>
                        <ThemedText style={styles.debtLabel}>{t('paid')}</ThemedText>
                        <ThemedText style={[styles.debtAmount, { color: colors.success }]}>
                          {monthlyData.formatInPreferredCurrency(monthlyData.paid)}
                        </ThemedText>
                      </View>
                    </View>
                  </Animated.View>
                ) : (
                  <View style={styles.debtSection}>
                    <View style={[styles.shimmer, styles.loadingShimmer]}>
                      <Animated.View style={{
                        transform: [{
                          translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 100]
                          })
                        }]
                      }}>
                        <View style={[styles.shimmer, styles.loadingShimmer]} />
                      </Animated.View>
                    </View>
                  </View>
                )}
              </ThemedCard>
            </Animated.View>
          </TouchableOpacity>
        </View>
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
  shimmer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingShimmer: {
    height: 80,
    width: '100%',
  },
  mainCardShimmer: {
    height: 150,
    width: '100%',
  },
  halfCardShimmer: {
    height: 100,
    width: '100%',
  },
});