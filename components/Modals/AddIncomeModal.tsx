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
import { IncomeItem, RecurrenceType } from '@/app/types/income';
import { currencies, displayToNumeric } from '@/utils/currency';
import { CurrencyInput } from '../CurrencyInput';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';

const COLORS = [
  '#007AFF', // Blue (Primary)
  '#34C759', // Green (Primary)
  '#FF3B30', // Red (Primary)
  '#FFCC00', // Yellow (Primary)
  '#AF52DE', // Purple (Secondary)
  '#FF9500', // Orange (Secondary)
  '#00BCD4', // Cyan (Secondary)
  '#FF2D55', // Pink (Secondary)
  '#5856D6', // Indigo (Secondary)
  '#4CD964', // Lime (Secondary)
  '#FF6B6B', // Coral (Accent)
  '#5C6BC0'  // Blue-Purple (Accent)
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
  const { t } = useLanguage();

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

    // Convert amount string to number using the current currency's format
    const numericAmount = displayToNumeric(amount, currencies[currency]);

    if (isNaN(numericAmount)) {
      setErrorMessage('Invalid amount');
      return;
    }

    // Save with the correctly parsed amount
    onSave({
      amount: numericAmount,
      currency,
      name,
      date: startDate,
      startDate: startDate.toISOString(),
      color: selectedColor,
      recurrence: {
        type: recurrenceType,
        ...(recurrenceType === 'custom' && {
          interval: parseInt(customInterval),
          intervalUnit
        }),
        ...(endDate && { endDate: endDate.toISOString() })
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
                {initialIncome ? t('editIncome') : t('addNewIncome')}
              </ThemedText>
            </View>

            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={{ paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* AMOUNT + CURRENCY */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                      <FontAwesome name="money" size={16} color="#007AFF" />
                    </View>
                    <View>
                      <ThemedText style={styles.sectionTitle}>{t('amount')}</ThemedText>
                      <ThemedText style={styles.sectionSubtitle}>{t('enterIncomeAmount')}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionContent}>
                  <CurrencyInput
                    value={amount}
                    onChange={setAmount}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* NAME */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                      <FontAwesome name="tag" size={16} color="#007AFF" />
                    </View>
                    <View>
                      <ThemedText style={styles.sectionTitle}>{t('name')}</ThemedText>
                      <ThemedText style={styles.sectionSubtitle}>{t('enterIncomeName')}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={[styles.sectionContent, { backgroundColor: colors.card.background }]}>
                  <ThemedInput
                    label=""
                    value={name}
                    onChangeText={setName}
                    placeholder={t('enterIncomeName')}
                    style={[styles.input, { marginTop: -30, marginBottom: 0, backgroundColor: colors.card.background }]}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* RECURRENCE */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                      <FontAwesome name="repeat" size={16} color="#007AFF" />
                    </View>
                    <View>
                      <ThemedText style={styles.sectionTitle}>{t('recurrence')}</ThemedText>
                      <ThemedText style={styles.sectionSubtitle}>{t('recurrenceDescription')}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionContent}>
                  <TouchableOpacity
                    style={[styles.recurrenceButton, { borderColor: colors.border }]}
                    onPress={openRecurrenceSheet}
                  >
                    <ThemedText style={styles.recurrenceText}>
                      {recurrenceType === 'custom'
                        ? `${t('custom')} (${customInterval} ${t(intervalUnit === 'day' ? 'days' : 'months')})`
                        : t(recurrenceType)}
                    </ThemedText>
                    <FontAwesome name="chevron-down" size={12} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              {/* DATE FIELDS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                      <FontAwesome name="calendar" size={16} color="#007AFF" />
                    </View>
                    <View>
                      <ThemedText style={styles.sectionTitle}>{t('dates')}</ThemedText>
                      <ThemedText style={styles.sectionSubtitle}>{t('setDates')}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.dateRow}>
                    {/* START DATE */}
                    <View style={styles.dateCol}>
                      <ThemedText style={styles.label}>{t('startDate')}</ThemedText>
                      <TouchableOpacity
                        style={[styles.dateButton, { borderColor: colors.border }]}
                        onPress={() => setStartPickerVisible(true)}
                      >
                        <ThemedText style={styles.dateText}>{startDate.toLocaleDateString()}</ThemedText>
                      </TouchableOpacity>
                    </View>

                    {/* END DATE (optional for recurring) */}
                    {recurrenceType !== 'once' && (
                      <View style={styles.dateCol}>
                        <ThemedText style={styles.label}>{t('endDate')}</ThemedText>
                        {endDate ? (
                          <>
                            <TouchableOpacity
                              style={[styles.dateButton, { borderColor: colors.border }]}
                              onPress={() => setEndPickerVisible(true)}
                            >
                              <ThemedText style={styles.dateText}>{endDate.toLocaleDateString()}</ThemedText>
                            </TouchableOpacity>
                            <ThemedButton
                              style={styles.clearButton}
                              textStyle={styles.buttonText}
                              onPress={() => setEndDate(null)}
                            >
                              {t('clear')}
                            </ThemedButton>
                          </>
                        ) : (
                          <ThemedButton
                            style={styles.endButton}
                            textStyle={styles.buttonText}
                            onPress={() => {
                              setEndPickerVisible(true);
                              if (!endDate) setEndDate(new Date());
                            }}
                          >
                            {t('setEndDate')}
                          </ThemedButton>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* COLOR */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                      <FontAwesome name="paint-brush" size={16} color="#007AFF" />
                    </View>
                    <View>
                      <ThemedText style={styles.sectionTitle}>{t('color')}</ThemedText>
                      <ThemedText style={styles.sectionSubtitle}>{t('chooseIncomeColor')}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.sectionContent}>
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
                </View>
              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.footerButtons}>
              <ThemedButton 
                style={[styles.footerBtn, styles.cancelBtn]} 
                textStyle={styles.buttonText}
                onPress={handleCancel}
              >
                {t('cancel')}
              </ThemedButton>
              <ThemedButton 
                style={[styles.footerBtn, styles.saveBtn]}
                textStyle={styles.buttonText}
                onPress={handleSave}
              >
                {t('save')}
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
                <ThemedText style={styles.sheetTitle}>{t('recurrence')}</ThemedText>
                {(['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'] as RecurrenceType[]).map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.sheetItem}
                      onPress={() => handleRecurrenceSelect(item)}
                    >
                      <ThemedText style={styles.recurrenceItemText}>
                        {t(item)}
                      </ThemedText>
                    </TouchableOpacity>
                  )
                )}
                <TouchableOpacity style={styles.sheetCancel} onPress={closeRecurrenceSheet}>
                  <ThemedText style={{ color: '#FF3B30' }}>{t('cancel')}</ThemedText>
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
                <ThemedText style={styles.errorTitle}>{t('error')}</ThemedText>
                <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
                <ThemedButton 
                  style={styles.errorButton}
                  textStyle={styles.buttonText}
                  onPress={() => setErrorMessage(null)}
                >
                  {t('ok')}
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

  // Section styles
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionContent: {
    paddingHorizontal: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: -16,
  },
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },

  // Common components
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  },

  // Text styles
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  recurrenceText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
  },
  recurrenceItemText: {
    fontSize: 16,
  },
});
