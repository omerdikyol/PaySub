import { 
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ThemedText } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';
import { formatCurrency } from '@/utils/currency';
import { useFinance } from '@/context/FinanceContext';
import { ExpenseCard } from '@/components/FinanceCard';
import { ExpenseHeader } from '@/components/FinanceHeader';
import { ExpensePaymentHistoryModal } from '@/components/PaymentHistory/ExpensePaymentHistoryModal';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';
import { useFinanceCRUD } from '@/hooks/useFinanceCRUD';
import { SortMenu } from '@/components/SortMenu/SortMenu';
import { FAB } from '@/components/FAB/FAB';
import { getOccurrencesInRange } from '@/utils/occurrences';
import { MenuModal } from '@/components/Modals/MenuModal';
import { DeleteConfirmationModal } from '@/components/Modals/DeleteConfirmationModal';
import { AddExpenseModal } from '@/components/Modals/AddExpenseModal';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { checkPaymentStatus } from '@/utils/paymentStatus';
import { usePremium } from '@/context/PremiumContext';
import { useRouter } from 'expo-router';

interface GroupedExpenses {
  id: string;
  color: string;
  total: number;
  currency: string;
  items: any[];
}

interface SectionData {
  title: string;
  data: GroupedExpenses[];
  total: number;
}

export default function Expense() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { expenses, updateExpensePaymentStatus } = useFinance();
  const { checkLimits, premiumStatus } = usePremium();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date' | 'price' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<typeof monthOccurrences[0] | null>(null);
  const [relatedPayments, setRelatedPayments] = useState<typeof monthOccurrences>([]);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

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
    searchQuery,
    sortCriteria,
    sortOrder,
    isGrouped
  );

  const {
    isModalVisible,
    editingItem: editingExpense,
    selectedItem: selectedExpense,
    showDeleteConfirm,
    setIsModalVisible,
    setEditingItem: setEditingExpense,
    setSelectedItem: setSelectedExpense,
    setShowDeleteConfirm,
    handleSave: handleSaveExpense,
    handleCloseModal,
    handleDelete: handleDeleteExpense,
    handleConfirmDelete,
    handleCancelDelete
  } = useFinanceCRUD('expense');

  const groupExpensesByColorAndPaymentStatus = (expenses: typeof monthOccurrences) => {
    const unpaidGroups: { [key: string]: GroupedExpenses } = {};
    const paidGroups: { [key: string]: GroupedExpenses } = {};
    let unpaidTotal = 0;
    let paidTotal = 0;
    
    expenses.forEach(expense => {
      if (!expense?.originalExpense) return;

      const color = expense.originalExpense.color || '#888888';
      const paymentStatus = checkPaymentStatus(expense, expense.date);
      const targetGroups = paymentStatus.isPaid ? paidGroups : unpaidGroups;
      
      if (!targetGroups[color]) {
        targetGroups[color] = {
          id: color,
          color,
          total: 0,
          currency: preferredCurrency,
          items: []
        };
      }

      targetGroups[color].items.push({
        ...expense,
        paymentStatus
      });
      targetGroups[color].total += expense.convertedAmount;
      
      if (paymentStatus.isPaid) {
        paidTotal += expense.convertedAmount;
      } else {
        unpaidTotal += expense.convertedAmount;
      }
    });

    return {
      unpaid: {
        title: 'Unpaid Expenses',
        data: Object.values(unpaidGroups),
        total: unpaidTotal
      },
      paid: {
        title: 'Paid Expenses',
        data: Object.values(paidGroups),
        total: paidTotal
      }
    };
  };

  const { unpaid, paid } = isGrouped ? groupExpensesByColorAndPaymentStatus(sortedOccurrences) : {
    unpaid: { 
      title: 'Unpaid Expenses', 
      data: sortedOccurrences.filter(e => {
        if (!e?.originalExpense) return false;
        const status = checkPaymentStatus(e, e.date);
        return !status.isPaid;
      }), 
      total: 0 
    },
    paid: { 
      title: 'Paid Expenses', 
      data: sortedOccurrences.filter(e => {
        if (!e?.originalExpense) return false;
        const status = checkPaymentStatus(e, e.date);
        return status.isPaid;
      }), 
      total: 0 
    }
  };

  const handlePaymentToggle = async (occurrence: ReturnType<typeof useFinanceCalculations>['monthOccurrences'][0]) => {
    if (!occurrence?.originalExpense?.id) return;
    
    try {
      const expenseDate = new Date(occurrence.date).toISOString();   
      const currentPaymentStatus = checkPaymentStatus(occurrence, occurrence.date);
      const newIsPaid = !currentPaymentStatus.isPaid;
      
      await updateExpensePaymentStatus(
        occurrence.originalExpense.id,
        expenseDate,
        newIsPaid
      );
      
      // Don't switch tabs automatically
    } catch (error) {
      console.error('Error toggling payment status:', error);
    }
  };

  // Add new function to get all related payments
  const getRelatedPayments = (occurrence: typeof monthOccurrences[0]) => {
    const expense = occurrence.originalExpense;
    const today = new Date();
    // Look back 6 months and forward 6 months
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);

    // Get all occurrences in the range
    const occurrences = getOccurrencesInRange(expense, startDate, endDate);

    // Map each occurrence to include the correct amount based on price history
    return occurrences.map(occ => {
      let applicableAmount = expense.amount;
      let historicalAmount = undefined;

      if (expense.priceHistory?.length) {
        // Sort price history by effectiveDate in ascending order (oldest first)
        const sortedPriceHistory = [...expense.priceHistory]
          .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

        // Find the price that was in effect at this occurrence's date
        const occurrenceTime = new Date(occ.date).getTime();
        let effectivePrice = null;

        for (let i = 0; i < sortedPriceHistory.length; i++) {
          const entry = sortedPriceHistory[i];
          const entryTime = new Date(entry.effectiveDate).getTime();

          if (entryTime <= occurrenceTime) {
            // This price change was before or at our occurrence
            effectivePrice = entry;
          } else {
            // This price change is after our occurrence
            break;
          }
        }

        if (effectivePrice) {
          // Use the price that was in effect at this date
          applicableAmount = effectivePrice.newAmount;
          historicalAmount = effectivePrice.previousAmount;
        } else {
          // If no price change was in effect yet, use the first entry's previous amount
          applicableAmount = sortedPriceHistory[0].previousAmount;
        }
      }

      return {
        ...occ,
        id: `${expense.id}-${occ.date}`,
        name: expense.name,
        color: expense.color,
        amount: applicableAmount,
        historicalAmount,
        originalExpense: expense
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Modify the card press handler to set related payments
  const handleCardPress = (occurrence: typeof monthOccurrences[0]) => {
    setSelectedOccurrence(occurrence);
    setRelatedPayments(getRelatedPayments(occurrence));
    setShowPaymentHistory(true);
  };

  const handleTabChange = (tab: 'unpaid' | 'paid') => {
    Animated.spring(tabIndicatorAnim, {
      toValue: tab === 'unpaid' ? 0 : 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
    setActiveTab(tab);
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentDate(newDate);
    // Reset to Outstanding tab with animation
    handleTabChange('unpaid');
  };

  const renderListHeader = () => {
    return (
      <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>
            {t('total')}: {formatInPreferredCurrency(totalInPreferredCurrency)}
          </ThemedText>
          <ThemedText style={styles.originalAmounts}>
            {Object.entries(totalByCurrency)
              .map(([currency, amount]) => formatCurrency(amount, currency))
              .join(' + ')}
          </ThemedText>
        </View>
      </View>
    );
  };

  const handleSortChange = (criteria: 'date' | 'price' | 'name', order: 'asc' | 'desc') => {
    setSortCriteria(criteria);
    setSortOrder(order);
  };

  const renderSectionHeader = (section: SectionData) => {
    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          {section.title === 'Paid Expenses' && (
            <TouchableOpacity 
              onPress={() => setShowPaidExpenses(!showPaidExpenses)}
              style={styles.toggleButton}
            >
              <FontAwesome 
                name={showPaidExpenses ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>
          )}
        </View>
        {isGrouped && (
          <ThemedText style={styles.sectionTotal}>
            {formatInPreferredCurrency(section.total)}
          </ThemedText>
        )}
      </View>
    );
  };

  const renderGroupHeader = (group: GroupedExpenses) => {
    return (
      <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
        <ThemedText style={styles.groupTotal}>
          {formatCurrency(group.total, group.currency)}
        </ThemedText>
      </View>
    );
  };

  const renderExpenseGroup = (group: GroupedExpenses) => {
    return (
      <View style={styles.groupContainer} key={group.id}>
        {renderGroupHeader(group)}
        {group.items.map(expense => (
          <ExpenseCard
            key={expense.id}
            item={expense}
            onPress={handleCardPress}
            onEdit={(item) => {
              setEditingExpense(item.originalExpense);
              setSelectedOccurrence(item);
              setIsModalVisible(true);
            }}
            onDelete={(expense) => {
              setSelectedExpense(expense.originalExpense);
              handleDeleteExpense(expense.originalExpense.id);
            }}
            onPaymentToggle={handlePaymentToggle}
          />
        ))}
      </View>
    );
  };

  const renderTabSelector = () => {
    const tabWidth = Dimensions.get('window').width / 2 - 40;
    const unpaidCount = unpaid?.data?.length || 0;
    const paidCount = paid?.data?.length || 0;

    return (
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <Animated.View style={[
          styles.tabIndicator,
          {
            transform: [{
              translateX: tabIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, tabWidth]
              })
            }],
            backgroundColor: colors.primary + '20',
          }
        ]} />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabChange('unpaid')}
        >
          <View style={styles.tabContent}>
            <ThemedText style={[
              styles.tabText,
              activeTab === 'unpaid' && [styles.activeTabText, { color: colors.primary }]
            ]}>
              {t('outstanding')}
            </ThemedText>
            {unpaidCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
                  {unpaidCount}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabChange('paid')}
        >
          <View style={styles.tabContent}>
            <ThemedText style={[
              styles.tabText,
              activeTab === 'paid' && [styles.activeTabText, { color: colors.primary }]
            ]}>
              {t('paid')}
            </ThemedText>
            {paidCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.badgeText, { color: colors.primary }]}>
                  {paidCount}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Add list transition animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset position
      slideAnim.setValue(20);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, [activeTab]);

  const handleAddPress = () => {
    if (!checkLimits('expense', expenses.length)) {
      Alert.alert(
        t('premium_required'),
        t('expense_limit_reached'),
        [
          {
            text: t('upgrade'),
            onPress: () => router.push('/premium'),
            style: 'default',
          },
          {
            text: t('cancel'),
            style: 'cancel',
          },
        ]
      );
      return;
    }
    setIsModalVisible(true);
  };

  return (
    <ScreenLayout>
      <ExpenseHeader
        showSearch={showSearch}
        isGrouped={isGrouped}
        searchQuery={searchQuery}
        currentDate={currentDate}
        onSearchChange={setSearchQuery}
        onSearchToggle={() => {
          setShowSearch(!showSearch);
          if (showSearch) {
            setSearchQuery('');
          }
        }}
        onGroupToggle={() => setIsGrouped(!isGrouped)}
        onSortPress={() => setShowSortMenu(true)}
        onMonthChange={handleMonthChange}
      />

      <FlatList
        data={activeTab === 'unpaid' ? [unpaid] : [paid]}
        renderItem={({ item: section }) => (
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>
            {isGrouped ? (
              section.data.map(renderExpenseGroup)
            ) : (
              section.data.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  item={expense}
                  onPress={handleCardPress}
                  onEdit={(item) => {
                    setEditingExpense(item.originalExpense);
                    setSelectedOccurrence(item);
                    setIsModalVisible(true);
                  }}
                  onDelete={(item) => {
                    setSelectedExpense(item.originalExpense);
                    handleDeleteExpense(item.originalExpense.id);
                  }}
                  onPaymentToggle={handlePaymentToggle}
                />
              ))
            )}
          </Animated.View>
        )}
        keyExtractor={(section) => section.title}
        ListHeaderComponent={
          <>
            {renderListHeader()}
            {renderTabSelector()}
          </>
        }
        stickyHeaderIndices={[0]} 
        contentContainerStyle={styles.listContainer}
      />

      <FAB
        icon="plus"
        onPress={handleAddPress}
        style={styles.fab}
      />

      <AddExpenseModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
        selectedDate={selectedOccurrence?.date}
      />

      <MenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onEdit={() => {
          if (selectedExpense) {
            setEditingExpense(selectedExpense);
            setIsModalVisible(true);
          }
        }}
        onDelete={() => selectedExpense && handleDeleteExpense(selectedExpense.id)}
      />

      <DeleteConfirmationModal
        visible={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
      />

      <SortMenu
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        sortCriteria={sortCriteria}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      <ExpensePaymentHistoryModal
        visible={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        selectedExpense={selectedOccurrence?.originalExpense || null}
        payments={relatedPayments}
        onPaymentToggle={handlePaymentToggle}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 120
  },
  listHeader: {
    paddingBottom: 0
  },
  totalContainer: {
    marginTop: 8,
    marginHorizontal: 10,
    marginBottom: 0
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right'
  },
  originalAmounts: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 2
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  groupTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTotal: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  toggleButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    position: 'relative',
    margin: 10,
    borderRadius: 12,
    padding: 4,
    height: 40,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    width: '48%',
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    fontWeight: '600',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
