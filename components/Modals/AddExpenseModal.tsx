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
  SafeAreaView,
  Switch,
  TextInput
} from 'react-native';
import { ThemedView, ThemedText, ThemedButton, ThemedInput } from '../Themed';
import { useTheme } from '../useTheme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { CustomIntervalModal } from './CustomIntervalModal';
import { ExpenseItem, RecurrenceType } from '../../app/types/expense';
import { currencies, displayToNumeric } from '@/utils/currency';
import { CurrencyInput } from '../CurrencyInput';
import { FontAwesome } from '@expo/vector-icons';
import { ServiceSelectionModal } from './ServiceSelectionModal';
import { SubscriptionService } from '../../app/types/service';
import { NotificationSettings } from '../../app/types/notification';
import { NotificationService } from '../../services/NotificationService';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#E74C3C', '#2ECC71', '#F1C40F', '#8E44AD'
];

type IntervalUnit = 'day' | 'month';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, 'id'>) => void;
  initialExpense?: ExpenseItem | null;
}

export function AddExpenseModal({
  visible,
  onClose,
  onSave,
  initialExpense
}: AddExpenseModalProps) {
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

  // Service selection
  const [showServiceSelection, setShowServiceSelection] = useState(true);
  const [selectedService, setSelectedService] = useState<SubscriptionService | null>(null);
  const [customServiceName, setCustomServiceName] = useState('');

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    daysInAdvance: 1,
    time: {
      hour: 12,
      minute: 30
    }
  });

  // Add a new state for time picker
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  // Update price handling functions
  const formatPriceForDisplay = (price: number): string => {
    // Use Turkish locale formatting and replace dot with comma
    return price.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parsePriceInput = (input: string): string => {
    // Remove any non-numeric characters except decimal point and comma
    const cleaned = input.replace(/[^\d,]/g, '');
    // Handle decimal places
    const parts = cleaned.split(',');
    if (parts.length > 1) {
      return `${parts[0]},${parts[1].slice(0, 2)}`;
    }
    return cleaned;
  };

  // Populate initial values if editing
  useEffect(() => {
    if (initialExpense && visible) {
      // Format the amount correctly preserving all digits
      setAmount(formatPriceForDisplay(initialExpense.amount));
      setCurrency(initialExpense.currency);
      setName(initialExpense.name);

      setStartDate(new Date(initialExpense.startDate));
      setSelectedColor(initialExpense.color);
      setRecurrenceType(initialExpense.recurrence.type);

      if (initialExpense.recurrence.interval) {
        setCustomInterval(initialExpense.recurrence.interval.toString());
      }
      if (initialExpense.recurrence.intervalUnit) {
        setIntervalUnit(initialExpense.recurrence.intervalUnit);
      }
      if (initialExpense.recurrence.endDate) {
        setEndDate(new Date(initialExpense.recurrence.endDate));
      }

      // Handle service data if exists
      if (initialExpense.service) {
        setSelectedService({
          id: initialExpense.service.id,
          name: initialExpense.service.name,
          logo: initialExpense.service.logo,
        });
        setCustomServiceName(initialExpense.service.customName || '');
      }

      // Skip service selection when editing
      setShowServiceSelection(false);
    }
  }, [initialExpense, visible]);

  // Handle service selection
  const handleServiceSelect = (service: SubscriptionService | null) => {
    setSelectedService(service);
    setShowServiceSelection(false);
    if (service) {
      setName(service.name);
      if (service.defaultPrice) {
        // Format price correctly by converting to string with 2 decimal places
        setAmount(service.defaultPrice.toFixed(2).replace('.', ','));
      }
      if (service.defaultCurrency) {
        setCurrency(service.defaultCurrency);
      }
      // Set monthly recurrence by default for subscription services
      setRecurrenceType('monthly');
    }
  };

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

    // Construct new/updated expense
    const expenseData = {
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
      },
      service: selectedService ? {
        id: selectedService.id,
        name: selectedService.name,
        logo: selectedService.logo,
        customName: customServiceName || undefined
      } : undefined,
      notification: notificationSettings,
      paymentHistory: initialExpense?.paymentHistory || {}
    };

    // Schedule notification if enabled
    if (notificationSettings.enabled) {
      NotificationService.requestPermissions().then(hasPermission => {
        if (hasPermission) {
          NotificationService.scheduleExpenseNotification({
            ...expenseData,
            id: initialExpense?.id || Date.now().toString()
          });
        }
      });
    }

    onSave(expenseData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    setShowServiceSelection(true); // Reset to show service selection
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
    setSelectedService(null); // Reset selected service
    setCustomServiceName(''); // Reset custom service name
    setShowServiceSelection(true); // Reset to show service selection
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

  // Add this handler for time selection
  const handleTimeConfirm = (date: Date) => {
    setNotificationSettings(prev => ({
      ...prev,
      time: {
        hour: date.getHours(),
        minute: date.getMinutes()
      }
    }));
    setTimePickerVisible(false);
  };

  // Layout
  return (
    <>
      <ServiceSelectionModal
        visible={visible && showServiceSelection}
        onClose={onClose}
        onSelect={handleServiceSelect}
      />
      
      <Modal
        visible={visible && !showServiceSelection}
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
                  {initialExpense ? 'Edit Expense' : 'Add New Expense'}
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
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="money" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Amount</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>Enter expense amount and currency</ThemedText>
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

                {/* NAME + CUSTOM NAME */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionLabelContainer}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="tag" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Name</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>
                          {selectedService ? 'Name and customize your subscription' : 'Give your expense a name'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionContent}>
                    <View style={{ gap: 12 }}>
                      <View>
                        <ThemedInput
                          label=""
                          value={name}
                          onChangeText={setName}
                          placeholder="Enter expense name"
                          style={[styles.input, { marginBottom: 0 }]}
                        />
                      </View>
                      {selectedService && (
                        <View>
                          <View style={styles.customNameLabelContainer}>
                            <ThemedText style={styles.inputLabel}>Custom Name</ThemedText>
                            <ThemedText style={styles.optionalText}>(optional)</ThemedText>
                          </View>
                          <ThemedText style={styles.customNameHint}>
                            Add a custom name to personalize this subscription
                          </ThemedText>
                          <ThemedInput
                            label=""
                            value={customServiceName}
                            onChangeText={setCustomServiceName}
                            placeholder={`e.g., ${selectedService.name} Family`}
                            style={[styles.input, { marginBottom: 0 }]}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* RECURRENCE */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionLabelContainer}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="repeat" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Recurrence</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>How often this expense repeats</ThemedText>
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
                          ? `Custom: every ${customInterval} ${
                              intervalUnit === 'day' ? 'days' : 'months'
                            }`
                          : recurrenceType.charAt(0).toUpperCase() + recurrenceType.slice(1)}
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
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="calendar" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Dates</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>Set start and end dates</ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionContent}>
                    <View style={styles.dateRow}>
                      {/* START DATE */}
                      <View style={styles.dateCol}>
                        <ThemedText style={styles.label}>Start Date</ThemedText>
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
                          <ThemedText style={styles.label}>End Date</ThemedText>
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
                                Clear
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
                              Set End Date
                            </ThemedButton>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Notifications */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionLabelContainer}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome 
                          name={notificationSettings.enabled ? "bell" : "bell-slash"} 
                          size={16} 
                          color={colors.primary} 
                        />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>
                          {notificationSettings.enabled ? 'Enabled' : 'Disabled'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionContent}>
                    <View style={[styles.notificationRow, { marginBottom: 0 }]}>
                      <View style={styles.notificationLabelContainer}>
                        <FontAwesome name="calendar" size={18} color={colors.text} />
                        <ThemedText style={styles.notificationLabel}>Days before</ThemedText>
                      </View>
                      <View style={[styles.daysInputContainer, { backgroundColor: colors.card.background }]}>
                        <TouchableOpacity 
                          style={[styles.dayStepperButton, { 
                            borderColor: colors.border,
                            backgroundColor: colors.card.background
                          }]}
                          onPress={() => {
                            setNotificationSettings(prev => ({
                              ...prev,
                              daysInAdvance: Math.max(0, prev.daysInAdvance - 1)
                            }));
                          }}
                        >
                          <ThemedText style={styles.stepperText}>-</ThemedText>
                        </TouchableOpacity>
                        
                        <ThemedText style={styles.daysValue}>
                          {notificationSettings.daysInAdvance}
                        </ThemedText>
                        
                        <TouchableOpacity 
                          style={[styles.dayStepperButton, { 
                            borderColor: colors.border,
                            backgroundColor: colors.card.background
                          }]}
                          onPress={() => {
                            setNotificationSettings(prev => ({
                              ...prev,
                              daysInAdvance: Math.min(30, prev.daysInAdvance + 1)
                            }));
                          }}
                        >
                          <ThemedText style={styles.stepperText}>+</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {notificationSettings.enabled && (
                      <>
                        {/* Time picker */}
                        <View style={[styles.notificationRow, { marginBottom: 0 }]}>
                          <View style={styles.notificationLabelContainer}>
                            <FontAwesome name="clock-o" size={18} color={colors.text} />
                            <ThemedText style={styles.notificationLabel}>Notification time</ThemedText>
                          </View>
                          <TouchableOpacity
                            style={[styles.timeButton, { 
                              backgroundColor: colors.card.background,
                              borderColor: colors.border,
                              borderWidth: 1
                            }]}
                            onPress={() => setTimePickerVisible(true)}
                          >
                            <ThemedText style={styles.timeText}>
                              {`${notificationSettings.time.hour.toString().padStart(2, '0')}:${notificationSettings.time.minute.toString().padStart(2, '0')}`}
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* COLOR */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionLabelContainer}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="paint-brush" size={16} color={colors.primary} />
                      </View>
                      <View>
                        <ThemedText style={styles.sectionTitle}>Color</ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>Choose a color for this expense</ThemedText>
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
                  Cancel
                </ThemedButton>
                <ThemedButton 
                  style={[styles.footerBtn, styles.saveBtn]}
                  textStyle={styles.buttonText}
                  onPress={handleSave}
                >
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
                        <ThemedText style={styles.recurrenceItemText}>
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
                  <ThemedButton 
                    style={styles.errorButton}
                    textStyle={styles.buttonText}
                    onPress={() => setErrorMessage(null)}
                  >
                    OK
                  </ThemedButton>
                </ThemedView>
              </TouchableOpacity>
            </Modal>

            {/* Add separate time picker modal */}
            <DateTimePickerModal
              isVisible={timePickerVisible}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              date={new Date(new Date().setHours(notificationSettings.time.hour, notificationSettings.time.minute))}
              onConfirm={handleTimeConfirm}
              onCancel={() => setTimePickerVisible(false)}
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
  },

  // Notifications
  notificationSection: {
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationLabel: {
    fontSize: 15,
  },
  daysInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 4,
  },
  dayStepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 18,
    fontWeight: '500',
  },
  daysValue: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationSubtitle: {
    fontSize: 13,
    opacity: 0.6,
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
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  recurrenceText: {
    fontSize: 16,
  },
  normalText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
  },
  recurrenceItemText: {
    fontSize: 16,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  customNameLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionalText: {
    fontSize: 13,
    opacity: 0.5,
  },
  customNameHint: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 4,
  },
});
