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
  PanResponderGestureState
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
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { formatCurrency } from '@/utils/currency';
import { IncomeItem, Occurrence } from '@/app/types/income';
import { FontAwesome } from '@expo/vector-icons';

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

export default function Income() {
  const { colors } = useTheme();
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date' | 'price' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // -- Memoized data calculations (unchanged) --
  const monthOccurrences = useMemo(() => {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Fix: Use next month's first day minus 1 millisecond to include the full last day
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      monthEnd.setMilliseconds(-1);
      
      return incomeItems.flatMap(income => 
          getOccurrencesInRange(income, monthStart, monthEnd)
              .map(occurrence => ({
                  ...occurrence,
                  id: `${income.id}-${occurrence.date}`,
                  name: income.name,
                  color: income.color,
                  originalIncome: income
              }))
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [incomeItems, currentDate]);

  const totalIncome = useMemo(() => {
      return monthOccurrences.reduce((sum, occurrence) => sum + occurrence.amount, 0);
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
          const color = curr.originalIncome.color;
          if (!acc[color]) {
              acc[color] = {
                  id: color,
                  color: color,
                  amount: curr.amount,
                  items: [curr],
                  date: curr.date,
                  originalIncome: curr.originalIncome
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
  const handleAddIncome = (newIncome: Omit<IncomeItem, 'id'>) => {
      const income: IncomeItem = {
          ...newIncome,
          id: Date.now().toString()
      };
      setIncomeItems(prev => [...prev, income]);
  };

  const handleEditIncome = () => {
      if (selectedIncome) {
          setEditingIncome(selectedIncome);
          setIsModalVisible(true);
          setShowMenu(false);
          setSelectedIncome(null);
      }
  };

  const handleSaveIncome = (updatedIncome: Omit<IncomeItem, 'id'>) => {
      if (editingIncome) {
          // Update existing income
          setIncomeItems(prev => prev.map(item => 
              item.id === editingIncome.id 
                  ? { ...updatedIncome, id: editingIncome.id }
                  : item
          ));
          setEditingIncome(null);
      } else {
          // Add new income
          const income: IncomeItem = {
              ...updatedIncome,
              id: Date.now().toString()
          };
          setIncomeItems(prev => [...prev, income]);
      }
      setIsModalVisible(false);
  };

  const handleCloseModal = () => {
      setEditingIncome(null);
      setIsModalVisible(false);
  };

  const handleDeleteIncome = (incomeId: string) => {
      setShowMenu(false); // Close menu first
      setShowDeleteConfirm(true); // Show confirmation dialog
  };

  const handleConfirmDelete = () => {
      if (selectedIncome) {
          setIncomeItems(prev => prev.filter(item => item.id !== selectedIncome.id));
          setShowDeleteConfirm(false);
          setSelectedIncome(null);
      }
  };

  // -- Render item --
  const renderItem = ({ item }: { item: typeof monthOccurrences[0] }) => {
    // For grouped items, item might be a group instead
    if (isGrouped) {
      return (
        <ThemedCard style={styles.card}>
          <View style={[styles.groupCardHeader, { backgroundColor: item.color }]}>
            <ThemedText style={[styles.groupedAmount, { color: '#fff' }]}>
              {formatCurrency(item.amount, item.originalIncome.currency)}
            </ThemedText>
          </View>
        </ThemedCard>
      );
    }

    // Normal items
    const dateStr = new Date(item.date).toLocaleDateString('en-GB');
    const recurrenceType = item.originalIncome.recurrence.type;
    const recurrenceStr =
      recurrenceType !== 'once'
        ? recurrenceType === 'custom'
          ? `Every ${item.originalIncome.recurrence.interval} ${item.originalIncome.recurrence.intervalUnit || 'month'}`
          : `${recurrenceType[0].toUpperCase()}${recurrenceType.slice(1)}`
        : '';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          // Maybe open a detail screen or do nothing
        }}
        style={styles.cardTouchArea}
      >
        <ThemedCard style={styles.card}>
          {/* Left color bar */}
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />

          <View style={styles.cardContent}>
            {/* Amount + name */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <ThemedText style={[styles.amountText, { color: colors.text }]}>
                {formatCurrency(item.amount, item.originalIncome.currency)}
              </ThemedText>
                <TouchableOpacity
                style={[styles.itemMenuButton, { alignContent: 'center' }]}
                onPress={() => {
                  setSelectedIncome(item.originalIncome);
                  setShowMenu(true);
                }}
                >
                <FontAwesome name="ellipsis-v" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ThemedText style={[styles.nameText, { color: colors.muted }]}>
              {item.name}
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
    return (
      <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>
            Total: {formatCurrency(totalIncome)}
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
          <ThemedText style={styles.headerTitle}>Income</ThemedText>
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

      {/* Add/Edit Income Modal */}
      <AddIncomeModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveIncome}
        initialIncome={editingIncome}
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
            <TouchableOpacity style={styles.menuOption} onPress={handleEditIncome}>
              <ThemedText>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuOption, styles.deleteOption]}
              onPress={() => selectedIncome && handleDeleteIncome(selectedIncome.id)}
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
            <ThemedText style={styles.confirmTitle}>Delete Income</ThemedText>
            <ThemedText style={styles.confirmMessage}>
              Are you sure you want to delete this income?
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
    padding: 8,
    marginRight: -8,
    marginTop: -8,
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
  }
});
