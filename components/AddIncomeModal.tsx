import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  SafeAreaView
} from 'react-native';
import { ThemedView, ThemedText, ThemedButton, ThemedInput } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { CustomIntervalModal } from './CustomIntervalModal';
import { IncomeItem, RecurrenceType } from '@/types/income';
import { parseCurrencyInput } from '@/utils/currency';
import { CurrencyInput } from './CurrencyInput';
import { FontAwesome } from '@expo/vector-icons';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#E74C3C', '#2ECC71', '#F1C40F', '#8E44AD'
];

type IntervalUnit = 'day' | 'month';

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (income: Omit<IncomeItem, 'id'>) => void;
  initialIncome?: IncomeItem | null;
}

export function AddIncomeModal({
  visible,
  onClose,
  onSave,
  initialIncome
}: AddIncomeModalProps) {
  const { colors } = useTheme();

  // Fields
  const [amount, setAmount] = useState('0,00');
  const [currency, setCurrency] = useState('TRY');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Pickers
  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);

  // Recurrence
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('once');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [customInterval, setCustomInterval] = useState('1');
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('month');
  const [showRecurrenceSheet, setShowRecurrenceSheet] = useState(false);
  const [showCustomIntervalModal, setShowCustomIntervalModal] = useState(false);

  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPriceForDisplay = (price: number): string => {
    return price.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Populate initial values if editing
  useEffect(() => {
    if (initialIncome && visible) {
      setAmount(formatPriceForDisplay(initialIncome.amount));
      setCurrency(initialIncome.currency);
      setName(initialIncome.name);

      setStartDate(new Date(initialIncome.startDate));
      setSelectedColor(initialIncome.color);
      setRecurrenceType(initialIncome.recurrence.type);

      if (initialIncome.recurrence.interval) {
        setCustomInterval(initialIncome.recurrence.interval.toString());
      }
      if (initialIncome.recurrence.intervalUnit) {
        setIntervalUnit(initialIncome.recurrence.intervalUnit);
      }
      if (initialIncome.recurrence.endDate) {
        setEndDate(new Date(initialIncome.recurrence.endDate));
      }
    }
  }, [initialIncome, visible]);

  // --- Save / Cancel ---
  const handleSave = () => {
    // Validate
    if (!amount || amount === '0,00') {
      setErrorMessage('Please enter an amount');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter a name');
      return;
    }
    setErrorMessage(null);

    // Convert amount string to number
    const numericAmount = parseFloat(
      amount
        .replace(/\./g, '') // Remove thousand separators
        .replace(',', '.') // Replace decimal comma with dot
    );
    
    if (isNaN(numericAmount)) {
      setErrorMessage('Invalid amount');
      return;
    }

    // Save with the correctly parsed amount
    onSave({
      amount: numericAmount,
      currency,
      name,
      startDate: startDate.toISOString(),
      color: selectedColor,
      recurrence: {
        type: recurrenceType,
        interval: recurrenceType === 'custom' ? parseInt(customInterval) : undefined,
        intervalUnit: recurrenceType === 'custom' ? intervalUnit : undefined,
        endDate: endDate?.toISOString()
      }
    });

    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('0,00');
    setCurrency('TRY');
    setName('');
    setStartDate(new Date());
    setEndDate(null);
    setSelectedColor(COLORS[0]);
    setRecurrenceType('once');
    setCustomInterval('1');
    setIntervalUnit('month');
  };

  // Date pickers
  const handleStartConfirm = (date: Date) => {
    setStartDate(date);
    setStartPickerVisible(false);
  };
  const handleEndConfirm = (date: Date) => {
    setEndDate(date);
    setEndPickerVisible(false);
  };

  // Recurrence
  const openRecurrenceSheet = () => setShowRecurrenceSheet(true);
  const closeRecurrenceSheet = () => setShowRecurrenceSheet(false);

  const handleRecurrenceSelect = (type: RecurrenceType) => {
    setRecurrenceType(type);
    closeRecurrenceSheet();
    if (type === 'custom') {
      setShowCustomIntervalModal(true);
    }
  };

  // Custom Interval
  const handleCancelCustomInterval = () => {
    // If user cancels, revert to 'once' or keep old logic
    setRecurrenceType('once');
    setShowCustomIntervalModal(false);
  };
  const handleSaveCustomInterval = (intervalValue: string, unit: IntervalUnit) => {
    setCustomInterval(intervalValue);
    setIntervalUnit(unit);
    setRecurrenceType('custom');
    setShowCustomIntervalModal(false);
  };

  // Layout
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancel}
    >
      {/* Tap outside text inputs to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[
          styles.screenContainer,
          { backgroundColor: colors.background }
        ]}>
          {/* Card-like container */}
          <ThemedView style={[styles.modalCard, { backgroundColor: colors.card.background }]}>
            {/* Header */}
            <View style={styles.headerRow}>
              <ThemedText style={styles.title}>
                {initialIncome ? 'Edit Income' : 'Add New Income'}
              </ThemedText>
            </View>

            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* AMOUNT + CURRENCY */}
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                currency={currency}
                onCurrencyChange={setCurrency}
              />

              {/* NAME */}
              <ThemedInput
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter income name"
                style={styles.input}
              />

              {/* DATE FIELDS */}
              <View style={styles.dateRow}>
                {/* START DATE */}
                <View style={styles.dateCol}>
                  <ThemedText style={styles.label}>Start Date</ThemedText>
                  <TouchableOpacity
                    style={[styles.dateButton, { borderColor: colors.border }]}
                    onPress={() => setStartPickerVisible(true)}
                  >
                    <ThemedText>{startDate.toLocaleDateString()}</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* END DATE (optional for recurring) */}
                {recurrenceType !== 'once' && (
                  <View style={styles.dateCol}>
                    <ThemedText style={styles.label}>End Date</ThemedText>
                    {endDate ? (
                      <>
                        <TouchableOpacity
                          style={[styles.dateButton, { borderColor: colors.border }]}
                          onPress={() => setEndPickerVisible(true)}
                        >
                          <ThemedText>{endDate.toLocaleDateString()}</ThemedText>
                        </TouchableOpacity>
                        <ThemedButton
                          style={styles.clearButton}
                          onPress={() => setEndDate(null)}
                        >
                          Clear
                        </ThemedButton>
                      </>
                    ) : (
                      <ThemedButton
                        style={styles.endButton}
                        onPress={() => {
                          setEndPickerVisible(true);
                          if (!endDate) setEndDate(new Date());
                        }}
                      >
                        Set End Date
                      </ThemedButton>
                    )}
                  </View>
                )}
              </View>

              {/* RECURRENCE */}
              <ThemedText style={styles.label}>Recurrence</ThemedText>
              <TouchableOpacity
                style={[styles.recurrenceButton, { borderColor: colors.border }]}
                onPress={openRecurrenceSheet}
              >
                <ThemedText>
                  {recurrenceType === 'custom'
                    ? `Custom: every ${customInterval} ${
                        intervalUnit === 'day' ? 'days' : 'months'
                      }`
                    : recurrenceType.charAt(0).toUpperCase() + recurrenceType.slice(1)}
                </ThemedText>
                <FontAwesome name="chevron-down" size={12} color={colors.text} />
              </TouchableOpacity>

              {/* COLOR PICKER */}
              <ThemedText style={[styles.label, { marginTop: 16 }]}>Color</ThemedText>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selectedColor === color && {
                        borderWidth: 3,
                        borderColor: colors.text
                      }
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.footerButtons}>
              <ThemedButton style={[styles.footerBtn, styles.cancelBtn]} onPress={handleCancel}>
                Cancel
              </ThemedButton>
              <ThemedButton style={[styles.footerBtn, styles.saveBtn]} onPress={handleSave}>
                Save
              </ThemedButton>
            </View>
          </ThemedView>

          {/* START / END PICKERS */}
          <DateTimePickerModal
            isVisible={startPickerVisible}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            date={startDate}
            onConfirm={handleStartConfirm}
            onCancel={() => setStartPickerVisible(false)}
          />
          <DateTimePickerModal
            isVisible={endPickerVisible}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            date={endDate || new Date()}
            onConfirm={handleEndConfirm}
            onCancel={() => setEndPickerVisible(false)}
          />

          {/* RECURRENCE SELECTION SHEET */}
          <Modal
            visible={showRecurrenceSheet}
            transparent
            animationType="slide"
            onRequestClose={closeRecurrenceSheet}
          >
            <SafeAreaView style={styles.sheetBackdrop}>
              <View style={[styles.sheetContainer, { backgroundColor: colors.card.background }]}>
                <ThemedText style={styles.sheetTitle}>Choose Recurrence</ThemedText>
                {(['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'] as RecurrenceType[]).map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.sheetItem}
                      onPress={() => handleRecurrenceSelect(item)}
                    >
                      <ThemedText>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  )
                )}
                <TouchableOpacity style={styles.sheetCancel} onPress={closeRecurrenceSheet}>
                  <ThemedText style={{ color: '#FF3B30' }}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>

          {/* CUSTOM INTERVAL MODAL */}
          <CustomIntervalModal
            visible={showCustomIntervalModal}
            initialInterval={customInterval}
            initialUnit={intervalUnit}
            onCancel={handleCancelCustomInterval}
            onSave={handleSaveCustomInterval}
          />

          {/* ERROR MESSAGE MODAL */}
          <Modal
            visible={!!errorMessage}
            transparent
            animationType="fade"
            onRequestClose={() => setErrorMessage(null)}
          >
            <TouchableOpacity
              style={styles.errorOverlay}
              activeOpacity={1}
              onPress={() => setErrorMessage(null)}
            >
              <ThemedView style={[styles.errorCard, { backgroundColor: colors.card.background }]}>
                <ThemedText style={styles.errorTitle}>Required Field</ThemedText>
                <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
                <ThemedButton style={styles.errorButton} onPress={() => setErrorMessage(null)}>
                  OK
                </ThemedButton>
              </ThemedView>
            </TouchableOpacity>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 0
  },
  modalCard: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  contentScroll: {
    flex: 1,
    marginTop: 8
  },
  input: {
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10
  },
  dateCol: {
    flex: 1
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10
  },
  endButton: {
    marginTop: 5,
    paddingVertical: 6
  },
  clearButton: {
    marginTop: 5,
    paddingVertical: 6,
    backgroundColor: '#666'
  },

  // Recurrence
  recurrenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10
  },

  // Color
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8
  },
  colorCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5
  },

  // Footer
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 10
  },
  cancelBtn: {
    backgroundColor: '#888'
  },
  saveBtn: {
    backgroundColor: '#007AFF'
  },

  // Recurrence Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  sheetItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc'
  },
  sheetCancel: {
    alignSelf: 'center',
    marginTop: 12
  },

  // Error Modal
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorCard: {
    width: '80%',
    borderRadius: 12,
    padding: 20
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 15,
    marginBottom: 20
  },
  errorButton: {
    alignSelf: 'flex-end'
  }
});
