import { 
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    GestureResponderEvent,
    PanResponderGestureState,
    Image
  } from 'react-native';
  import { useState, useMemo, useRef } from 'react';
  import { 
  ThemedText,
  ThemedCard,
  ThemedButton,
  ThemedView,
  ThemedInput
  } from '@/components/Themed';
  import { useTheme } from '@/components/useTheme';
  import { ScreenLayout } from '@/components/ScreenLayout';
  import { MonthNavigation } from '@/components/MonthNavigation';
  import { AddExpenseModal } from '@/components/AddExpenseModal';
  import { formatCurrency } from '@/utils/currency';
  import { ExpenseItem, Occurrence } from '@/app/types/expense';
  import { FontAwesome } from '@expo/vector-icons';
  import { useFinance } from '@/context/FinanceContext';
  
  // Modify the getOccurrencesInRange function to include payment status
  function getOccurrencesInRange(expense: ExpenseItem, startDate: Date, endDate: Date): Occurrence[] {
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
  
  // Add new type for currency totals
  type CurrencyTotal = {
    [currency: string]: number;
  };

  export default function Expense() {
    const { colors } = useTheme();
    const { expenses, addExpense, updateExpense, deleteExpense, updateExpensePaymentStatus } = useFinance();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortCriteria, setSortCriteria] = useState<'date' | 'price' | 'name'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [isGrouped, setIsGrouped] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<typeof monthOccurrences[0] | null>(null);
    const [relatedPayments, setRelatedPayments] = useState<typeof monthOccurrences>([]);
  
    // -- Memoized data calculations (unchanged) -- 
    const monthOccurrences = useMemo(() => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // Fix: Use next month's first day minus 1 millisecond to include the full last day
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        monthEnd.setMilliseconds(-1);
        
        return expenses.flatMap(expense => 
            getOccurrencesInRange(expense, monthStart, monthEnd)
                .map(occurrence => ({
                    ...occurrence,
                    id: `${expense.id}-${occurrence.date}`,
                    name: expense.name,
                    color: expense.color,
                    originalExpense: expense
                }))
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [expenses, currentDate]);
  
    const totalExpenseByCurrency = useMemo(() => {
        return monthOccurrences.reduce((totals, occurrence) => {
            const currency = occurrence.originalExpense.currency;
            totals[currency] = (totals[currency] || 0) + occurrence.amount;
            return totals;
        }, {} as CurrencyTotal);
    }, [monthOccurrences]);
  
    const filteredOccurrences = useMemo(() => {
        return monthOccurrences.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [monthOccurrences, searchQuery]);
  
    const sortedOccurrences = useMemo(() => {
        return filteredOccurrences.sort((a, b) => {
            switch (sortCriteria) {
                case 'date':
                    return sortOrder === 'asc' 
                        ? new Date(a.date).getTime() - new Date(b.date).getTime()
                        : new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'price':
                    return sortOrder === 'asc' 
                        ? a.amount - b.amount
                        : b.amount - a.amount;
                case 'name':
                    return sortOrder === 'asc' 
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }, [filteredOccurrences, sortCriteria, sortOrder]);
  
    const groupedOccurrences = useMemo(() => {
        if (!isGrouped) return sortedOccurrences;
  
        const groups = sortedOccurrences.reduce((acc, curr) => {
            const color = curr.originalExpense.color;
            if (!acc[color]) {
                acc[color] = {
                    id: color,
                    color: color,
                    amount: curr.amount,
                    items: [curr],
                    date: curr.date,
                    originalExpense: curr.originalExpense
                };
            } else {
                acc[color].amount += curr.amount;
                acc[color].items.push(curr);
            }
            return acc;
        }, {} as Record<string, any>);
  
        return Object.values(groups);
    }, [sortedOccurrences, isGrouped]);
  
    // -- CRUD Handlers (unchanged) -- 
    const handleAddExpense = (newExpense: Omit<ExpenseItem, 'id'>) => {
        const expense: ExpenseItem = {
            ...newExpense,
            id: Date.now().toString(),
            paymentHistory: {} // Initialize empty payment history
        };
        setExpenseItems(prev => [...prev, expense]);
    };
  
    const handleEditExpense = () => {
        if (selectedExpense) {
            setEditingExpense(selectedExpense);
            setIsModalVisible(true);
            setShowMenu(false);
            setSelectedExpense(null);
        }
    };
  
    const handleSaveExpense = (updatedExpense: Omit<ExpenseItem, 'id'>) => {
        if (editingExpense) {
            updateExpense(editingExpense.id, updatedExpense);
        } else {
            addExpense(updatedExpense);
        }
        setIsModalVisible(false);
        setEditingExpense(null);
    };
  
    const handleCloseModal = () => {
        setEditingExpense(null);
        setIsModalVisible(false);
    };
  
    const handleDeleteExpense = (expenseId: string) => {
        setShowMenu(false); // Close menu first
        setShowDeleteConfirm(true); // Show confirmation dialog
    };
  
    const handleConfirmDelete = () => {
        if (selectedExpense) {
            deleteExpense(selectedExpense.id);
            setShowDeleteConfirm(false);
            setSelectedExpense(null);
        }
    };

    // Add new function to handle payment toggle
    const handlePaymentToggle = (occurrence: typeof monthOccurrences[0]) => {
        const dateStr = occurrence.date;
        const newIsPaidStatus = !occurrence.paymentStatus?.isPaid;
        
        updateExpensePaymentStatus(
          occurrence.originalExpense.id,
          dateStr,
          newIsPaidStatus
        );
    
        // Immediately update the related payments list
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

    // Add new handler for payment button click
    const handlePaymentButtonClick = (e: GestureResponderEvent, occurrence: typeof monthOccurrences[0]) => {
        e.stopPropagation();
        handlePaymentToggle(occurrence);
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
  
    // -- Render item -- 
    const renderItem = ({ item }: { item: typeof monthOccurrences[0] }) => {
      // For grouped items, item might be a group instead
      if (isGrouped) {
        return (
          <ThemedCard style={styles.card}>
            <View style={[styles.groupCardHeader, { backgroundColor: item.color }]}>
              <ThemedText style={[styles.groupedAmount, { color: '#fff' }]}>
                {formatCurrency(item.amount, item.originalExpense.currency)}
              </ThemedText>
            </View>
          </ThemedCard>
        );
      }
  
      // Normal items
      const dateStr = new Date(item.date).toLocaleDateString('en-GB');
      const recurrenceType = item.originalExpense.recurrence.type;
      const recurrenceStr =
        recurrenceType !== 'once'
          ? recurrenceType === 'custom'
            ? `Every ${item.originalExpense.recurrence.interval} ${item.originalExpense.recurrence.intervalUnit || 'month'}`
            : `${recurrenceType[0].toUpperCase()}${recurrenceType.slice(1)}`
          : '';
  
      // Get the display name - use custom name if available
      const displayName = item.originalExpense.service?.customName || item.name;
  
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleCardPress(item)}
          style={styles.cardTouchArea}
        >
          <ThemedCard style={[
            styles.card,
            item.paymentStatus?.isPaid && styles.paidCard
          ]}>
            {/* Left color bar */}
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
  
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <View style={styles.leftContent}>
                  {/* Show service logo if available */}
                  {item.originalExpense.service?.logo && (
                    <Image 
                      source={typeof item.originalExpense.service.logo === 'string' 
                        ? { uri: item.originalExpense.service.logo }
                        : item.originalExpense.service.logo
                      }
                      style={styles.serviceLogo}
                    />
                  )}
                  <ThemedText style={[styles.amountText, { color: colors.text }]}>
                    {formatCurrency(item.amount, item.originalExpense.currency)}
                  </ThemedText>
                  {item.paymentStatus?.isPaid && (
                    <View style={styles.paidBadge}>
                      <FontAwesome name="check" size={12} color="#fff" />
                      <ThemedText style={styles.paidText}>PAID</ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.rightContent}>
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={(e) => handlePaymentButtonClick(e, item)}
                  >
                    <View style={styles.rightContent}>
                      <FontAwesome 
                          name={item.paymentStatus?.isPaid ? "times" : "credit-card"} 
                          size={20} 
                          color={colors.text}
                      />
                    </View>

                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemMenuButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedExpense(item.originalExpense);
                      setShowMenu(true);
                    }}
                  >
                    <FontAwesome name="ellipsis-v" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
  
              <ThemedText style={[styles.nameText, { color: colors.muted }]}>
                {displayName}
              </ThemedText>
  
              {/* Date + recurrence */}
              <View style={styles.dateRecurrenceRow}>
                <ThemedText style={[styles.dateText, { color: colors.muted }]}>
                  {dateStr}
                </ThemedText>
                {recurrenceStr ? (
                  <ThemedText style={[styles.recurrenceText, { color: colors.muted }]}>
                    • {recurrenceStr}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          </ThemedCard>
        </TouchableOpacity>
      );
    };
  
    // -- List Header (search + total) -- 
    const renderListHeader = () => {
        const totalString = Object.entries(totalExpenseByCurrency)
            .map(([currency, amount]) => formatCurrency(amount, currency))
            .join(' + ');

        return (
            <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
                <View style={styles.totalContainer}>
                    <ThemedText style={styles.totalText}>
                        Total: {totalString}
                    </ThemedText>
                </View>
            </View>
        );
    };
  
    return (
      <ScreenLayout>
        {/* Header */}
        <View 
          style={[styles.fixedHeader, { backgroundColor: colors.background }]}
        >
          {/* Title and icons row */}
          <View style={styles.headerContainer}>
            <ThemedText style={styles.headerTitle}>Expense</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  isGrouped && {
                    backgroundColor: colors.surface,
                    borderRadius: 8
                  }
                ]}
                onPress={() => setIsGrouped(!isGrouped)}
              >
                <FontAwesome name="th-large" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSortMenu(true)}
              >
                <FontAwesome name="sort" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  showSearch && {
                    backgroundColor: colors.surface,
                    borderRadius: 8
                  }
                ]}
                onPress={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    setSearchQuery('');
                  }
                }}
              >
                <FontAwesome name="search" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Search input */}
          {showSearch && (
            <ThemedInput
              label=""
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name..."
              style={styles.searchInput}
              autoFocus={true}
            />
          )}
  
          {/* Month nav */}
          <MonthNavigation currentDate={currentDate} onMonthChange={setCurrentDate} />
        </View>
  
        {/* The list */}
        <FlatList
          data={isGrouped ? groupedOccurrences : sortedOccurrences}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          stickyHeaderIndices={[0]} 
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 120 }}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
  
        {/* Floating Add Button (FAB) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.9}
        >
          <FontAwesome name="plus" size={24} color="#fff" />
        </TouchableOpacity>
  
        {/* Add/Edit Expense Modal */}
        <AddExpenseModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveExpense}
          initialExpense={editingExpense}
        />
  
        {/* Menu Modal (Edit/Delete) */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <ThemedView style={[styles.menuModal, { backgroundColor: colors.card.background }]}>
              <TouchableOpacity style={styles.menuOption} onPress={handleEditExpense}>
                <ThemedText>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuOption, styles.deleteOption]}
                onPress={() => selectedExpense && handleDeleteExpense(selectedExpense.id)}
              >
                <ThemedText style={{ color: colors.error }}>Delete</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
  
        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeleteConfirm(false)}
          >
            <ThemedView style={[styles.confirmModal, { backgroundColor: colors.card.background }]}>
              <ThemedText style={styles.confirmTitle}>Delete Expense</ThemedText>
              <ThemedText style={styles.confirmMessage}>
                Are you sure you want to delete this expense?
              </ThemedText>
              <View style={styles.confirmButtons}>
                <ThemedButton
                  style={[styles.confirmButton, styles.cancelButton]}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </ThemedButton>
                <ThemedButton
                  style={[styles.confirmButton, styles.deleteButton]}
                  onPress={handleConfirmDelete}
                >
                  Delete
                </ThemedButton>
              </View>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
  
        {/* Sort Menu Modal */}
        <Modal
          visible={showSortMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSortMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortMenu(false)}
          >
            <ThemedView style={[styles.menuModal, { backgroundColor: colors.card.background }]}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setSortCriteria('date');
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  setShowSortMenu(false);
                }}
              >
                <View style={styles.menuOptionContent}>
                  <ThemedText>Date</ThemedText>
                  {sortCriteria === 'date' && (
                    <FontAwesome
                      name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                      size={16}
                      color={colors.text}
                    />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setSortCriteria('price');
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  setShowSortMenu(false);
                }}
              >
                <View style={styles.menuOptionContent}>
                  <ThemedText>Amount</ThemedText>
                  {sortCriteria === 'price' && (
                    <FontAwesome
                      name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                      size={16}
                      color={colors.text}
                    />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setSortCriteria('name');
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  setShowSortMenu(false);
                }}
              >
                <View style={styles.menuOptionContent}>
                  <ThemedText>Name</ThemedText>
                  {sortCriteria === 'name' && (
                    <FontAwesome
                      name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                      size={16}
                      color={colors.text}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </ThemedView>
          </TouchableOpacity>
        </Modal>

        {/* Payment History Modal */}
        <Modal
            visible={showPaymentHistory}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPaymentHistory(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowPaymentHistory(false)}
            >
                <ThemedView style={[styles.paymentHistoryModal, { backgroundColor: colors.card.background }]}>
                    <View style={styles.paymentHistoryHeader}>
                        <ThemedText style={styles.paymentHistoryTitle}>
                            Payment History
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowPaymentHistory(false)}
                        >
                            <FontAwesome name="times" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {selectedOccurrence && (
                        <>
                            <ThemedText style={styles.expenseName}>
                                {selectedOccurrence.name}
                            </ThemedText>
                            <ThemedText style={styles.expenseRecurrence}>
                                {selectedOccurrence.originalExpense.recurrence.type === 'custom' 
                                    ? `Every ${selectedOccurrence.originalExpense.recurrence.interval} ${selectedOccurrence.originalExpense.recurrence.intervalUnit || 'month'}`
                                    : `${selectedOccurrence.originalExpense.recurrence.type[0].toUpperCase()}${selectedOccurrence.originalExpense.recurrence.type.slice(1)}`
                                }
                            </ThemedText>

                            <FlatList
                                data={relatedPayments}
                                style={styles.paymentsList}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.paymentItem}>
                                        <View>
                                            <ThemedText style={styles.paymentItemDate}>
                                                {new Date(item.date).toLocaleDateString('en-GB')}
                                            </ThemedText>
                                            <ThemedText style={styles.paymentItemAmount}>
                                                {formatCurrency(item.amount, item.originalExpense.currency)}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.paymentItemStatus}>
                                            {item.paymentStatus?.isPaid ? (
                                                <>
                                                    <View style={styles.paidBadge}>
                                                        <FontAwesome name="check" size={12} color="#fff" />
                                                        <ThemedText style={styles.paidText}>PAID</ThemedText>
                                                    </View>
                                                    <ThemedText style={styles.paidDate}>
                                                        {item.paymentStatus.paidDate ? 
                                                            new Date(item.paymentStatus.paidDate).toLocaleDateString('en-GB')
                                                            : ''}
                                                    </ThemedText>
                                                </>
                                            ) : (
                                                <TouchableOpacity
                                                    style={[styles.payButton, { flexDirection: 'row', alignItems: 'center' }]}
                                                    onPress={() => handlePaymentToggle(item)}
                                                >
                                                    <FontAwesome name="credit-card" size={16} color="#fff" style={{ marginRight: 6 }} />
                                                    <ThemedText style={styles.payButtonText}>
                                                        Pay
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                )}
                            />
                        </>
                    )}
                </ThemedView>
            </TouchableOpacity>
        </Modal>
      </ScreenLayout>
    );
  }
  
  const styles = StyleSheet.create({
    // Layout
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10, // Less margin to tighten up
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
    list: {
      flex: 1,
      marginTop: 5
    },
    searchInput: {
      height: 40,
      marginHorizontal: 10
    },
    totalContainer: {
      marginTop: 8,
      marginHorizontal: 10
    },
    totalText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'right'
    },
  
    // Cards
    cardTouchArea: {
      marginVertical: 2
    },
    card: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
    },
    colorBar: {
      width: 5,
      backgroundColor: '#007AFF'
    },
    cardContent: {
      flex: 1,
      paddingInline: 10,
    },
    amountText: {
      fontSize: 16,
      fontWeight: '600'
    },
    nameText: {
      fontSize: 14,
      marginTop: 1
    },
    dateRecurrenceRow: {
      flexDirection: 'row',
      marginTop: 4,
      alignItems: 'center'
    },
    dateText: {
      fontSize: 13
    },
    recurrenceText: {
      fontSize: 13,
      marginLeft: 6
    },
    itemMenuButton: {
      padding: 2,
      marginRight: -8,
      marginLeft: 6,
      alignSelf: 'center'
    },
    listHeader: {
      paddingBottom: 10
    },
    // Grouped cards
    groupCardHeader: {
      padding: 15,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12
    },
    groupedAmount: {
      fontSize: 18,
      fontWeight: 'bold'
    },
  
    // Floating action button
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6, // shadow for Android
      shadowColor: '#000', // shadow for iOS
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4
    },
  
    // Menus & Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    menuModal: {
      width: 200,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    },
    menuOption: {
      padding: 15,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    deleteOption: {
      borderBottomWidth: 0
    },
    menuOptionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    },
  
    // Confirmation
    confirmModal: {
      width: 300,
      borderRadius: 12,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84
    },
    confirmTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10
    },
    confirmMessage: {
      fontSize: 16,
      marginBottom: 20
    },
    confirmButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    confirmButton: {
      flex: 1,
      marginHorizontal: 5
    },
    cancelButton: {
      backgroundColor: '#ccc'
    },
    deleteButton: {
      backgroundColor: '#f00'
    },
    fixedHeader: {
      zIndex: 1, // Ensure header stays on top
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    paidCard: {
      opacity: 0.8,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    paidBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#34C759',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    paidText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    paymentButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(48, 48, 48, 0.144)',
    },

    paymentHistoryModal: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },

    paymentHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    paymentHistoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    closeButton: {
        padding: 4,
    },

    expenseName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },

    expenseAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },

    paymentInfo: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 16,
        borderRadius: 8,
    },

    paymentDate: {
        fontSize: 16,
        marginBottom: 8,
    },

    paymentStatus: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    expenseRecurrence: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },

    paymentsList: {
        flexGrow: 0,
    },

    paymentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },

    paymentItemDate: {
        fontSize: 16,
        marginBottom: 4,
    },

    paymentItemAmount: {
        fontSize: 14,
        color: '#666',
    },

    paymentItemStatus: {
        alignItems: 'flex-end',
    },

    paidDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    payButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },

    payButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    serviceLogo: {
      width: 24,
      height: 24,
      borderRadius: 4,
    },
  });
