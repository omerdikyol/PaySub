import { 
  StyleSheet,
  FlatList,
  View,
} from 'react-native';
import { useState } from 'react';
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

  const {
    monthOccurrences,
    totalByCurrency,
    sortedOccurrences,
    groupedOccurrences
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
    const totalString = Object.entries(totalByCurrency)
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

  const handleSortChange = (criteria: 'date' | 'price' | 'name', order: 'asc' | 'desc') => {
    setSortCriteria(criteria);
    setSortOrder(order);
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
        onMonthChange={setCurrentDate}
      />

      <FlatList
        data={isGrouped ? groupedOccurrences : sortedOccurrences}
        renderItem={({ item }) => (
          <ExpenseCard
            item={item}
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
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
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
    paddingBottom: 10
  },
  totalContainer: {
    marginTop: 8,
    marginHorizontal: 10
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right'
  }
});
