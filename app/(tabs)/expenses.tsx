import { 
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
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
  const { expenses, updateExpensePaymentStatus } = useFinance();
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
  const [showPaidExpenses, setShowPaidExpenses] = useState(false);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');

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
      const color = expense.originalExpense.color || '#888888';
      const isPaid = expense.paymentStatus?.isPaid;
      const targetGroups = isPaid ? paidGroups : unpaidGroups;
      
      if (!targetGroups[color]) {
        targetGroups[color] = {
          id: color,
          color,
          total: 0,
          currency: expense.originalExpense.currency,
          items: []
        };
      }
      targetGroups[color].items.push(expense);
      targetGroups[color].total += expense.amount;
      
      if (isPaid) {
        paidTotal += expense.amount;
      } else {
        unpaidTotal += expense.amount;
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
    unpaid: { title: 'Unpaid Expenses', data: sortedOccurrences.filter(e => !e.paymentStatus?.isPaid), total: 0 },
    paid: { title: 'Paid Expenses', data: sortedOccurrences.filter(e => e.paymentStatus?.isPaid), total: 0 }
  };

  const handlePaymentToggle = (occurrence: typeof monthOccurrences[0]) => {
    const dateStr = occurrence.date;
    const newIsPaidStatus = !occurrence.paymentStatus?.isPaid;
    
    updateExpensePaymentStatus(
      occurrence.originalExpense.id,
      dateStr,
      newIsPaidStatus
    );

    setRelatedPayments(prev => 
      prev.map(payment => {
        if (payment.id === occurrence.id) {
          return {
            ...payment,
            paymentStatus: {
              isPaid: newIsPaidStatus,
              paidDate: newIsPaidStatus ? new Date().toISOString() : undefined
            }
          };
        }
        return payment;
      })
    );
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

    return getOccurrencesInRange(expense, startDate, endDate)
        .map(occ => ({
            ...occ,
            id: `${expense.id}-${occ.date}`,
            name: expense.name,
            color: expense.color,
            originalExpense: expense
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

  // Modify the card press handler to set related payments
  const handleCardPress = (occurrence: typeof monthOccurrences[0]) => {
    setSelectedOccurrence(occurrence);
    setRelatedPayments(getRelatedPayments(occurrence));
    setShowPaymentHistory(true);
};

  const renderListHeader = () => {
    return (
      <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>
            Total: {formatInPreferredCurrency(totalInPreferredCurrency)}
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
            onEdit={(expense) => {
              setEditingExpense(expense.originalExpense);
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
    const screenWidth = Dimensions.get('window').width;
    const containerPadding = 10;
    const tabWidth = (screenWidth - (containerPadding * 2)) / 2;
    const indicatorWidth = tabWidth - 32;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(translateX, {
        toValue: activeTab === 'unpaid' ? 16 : tabWidth + 16,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 300,
      }).start();
    }, [activeTab]);

    return (
      <View style={[styles.tabContainer]}>
        <Animated.View style={[
          styles.tabIndicator,
          {
            width: indicatorWidth,
            transform: [{ translateX }],
            backgroundColor: '#007AFF',
          }
        ]} />
        
        <TouchableOpacity 
          style={[styles.tab]}
          onPress={() => setActiveTab('unpaid')}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'unpaid' && styles.activeTabText
          ]}>
            Outstanding
          </ThemedText>
          {unpaid.data.length > 0 && (
            <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
              <ThemedText style={styles.badgeText}>
                {unpaid.data.length}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab]}
          onPress={() => setActiveTab('paid')}
        >
          <ThemedText style={[
            styles.tabText,
            activeTab === 'paid' && styles.activeTabText
          ]}>
            Paid
          </ThemedText>
          {paid.data.length > 0 && (
            <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
              <ThemedText style={styles.badgeText}>
                {paid.data.length}
              </ThemedText>
            </View>
          )}
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
        onMonthChange={setCurrentDate}
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

      <FAB onPress={() => setIsModalVisible(true)} />

      <AddExpenseModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
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
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 4,
    position: 'relative',
    height: 48,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
