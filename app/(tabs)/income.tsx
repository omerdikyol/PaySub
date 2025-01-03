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
import { IncomeCard } from '@/components/FinanceCard';
import { IncomeHeader } from '@/components/FinanceHeader';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';
import { useFinanceCRUD } from '@/hooks/useFinanceCRUD';
import { SortMenu } from '@/components/SortMenu/SortMenu';
import { FAB } from '@/components/FAB/FAB';
import { MenuModal } from '@/components/Modals/MenuModal';
import { DeleteConfirmationModal } from '@/components/Modals/DeleteConfirmationModal';
import { AddIncomeModal } from '@/components/Modals/AddIncomeModal';
import { IncomePaymentHistoryModal } from '@/components/PaymentHistory/IncomePaymentHistoryModal';
import { getOccurrencesInRange } from '@/utils/occurrences';

export default function Income() {
  const { colors } = useTheme();
  const { incomes } = useFinance();
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
    incomes,
    currentDate,
    searchQuery,
    sortCriteria,
    sortOrder,
    isGrouped
  );

  const {
    isModalVisible,
    editingItem: editingIncome,
    selectedItem: selectedIncome,
    showDeleteConfirm,
    setIsModalVisible,
    setEditingItem: setEditingIncome,
    setSelectedItem: setSelectedIncome,
    setShowDeleteConfirm,
    handleSave: handleSaveIncome,
    handleCloseModal,
    handleDelete: handleDeleteIncome,
    handleConfirmDelete,
    handleCancelDelete
  } = useFinanceCRUD('income');

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

  const handleCardPress = (occurrence: typeof monthOccurrences[0]) => {
    setSelectedOccurrence(occurrence);
    setRelatedPayments(getOccurrencesInRange(occurrence.originalIncome, 
      new Date(new Date().setMonth(new Date().getMonth() - 6)),
      new Date(new Date().setMonth(new Date().getMonth() + 6))
    ));
    setShowPaymentHistory(true);
  };

  return (
    <ScreenLayout>
      <IncomeHeader
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
          <IncomeCard
            item={item}
            onPress={handleCardPress}
            onEdit={(item) => {
              setEditingIncome(item.originalIncome);
              setIsModalVisible(true);
            }}
            onDelete={(item) => {
              setSelectedIncome(item.originalIncome);
              handleDeleteIncome(item.originalIncome.id);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={[0]} 
        contentContainerStyle={styles.listContainer}
      />

      <FAB onPress={() => setIsModalVisible(true)} />

      <AddIncomeModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveIncome}
        initialIncome={editingIncome}
      />

      <MenuModal
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onEdit={() => {
          if (selectedIncome) {
            setEditingIncome(selectedIncome);
            setIsModalVisible(true);
          }
        }}
        onDelete={() => selectedIncome && handleDeleteIncome(selectedIncome.id)}
      />

      <DeleteConfirmationModal
        visible={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Income"
        message="Are you sure you want to delete this income?"
      />

      <SortMenu
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        sortCriteria={sortCriteria}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      <IncomePaymentHistoryModal
        visible={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        selectedIncome={selectedOccurrence?.originalIncome || null}
        payments={relatedPayments}
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
