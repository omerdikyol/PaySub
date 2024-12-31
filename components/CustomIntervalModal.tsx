import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { ThemedText, ThemedButton } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';

type IntervalUnit = 'day' | 'month';

interface CustomIntervalModalProps {
  visible: boolean;
  initialInterval: string;   // e.g. "1"
  initialUnit: IntervalUnit; // "day" or "month"
  onCancel: () => void;
  onSave: (intervalValue: string, intervalUnit: IntervalUnit) => void;
}

export function CustomIntervalModal({
  visible,
  initialInterval,
  initialUnit,
  onCancel,
  onSave
}: CustomIntervalModalProps) {
  const [intervalValue, setIntervalValue] = useState(initialInterval);
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(initialUnit);
  const { colors } = useTheme();

  // If the modal reopens, reset state from props
  useEffect(() => {
    if (visible) {
      setIntervalValue(initialInterval);
      setIntervalUnit(initialUnit);
    }
  }, [visible, initialInterval, initialUnit]);

  const handleSet = () => {
    onSave(intervalValue, intervalUnit);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
              <ScrollView
                contentContainerStyle={styles.scrollInner}
                keyboardShouldPersistTaps="handled"
              >
                <ThemedText style={styles.title}>Set Custom Interval</ThemedText>

                {/* Numeric input for "Repeat every" */}
                <View style={styles.inputBlock}>
                  <ThemedText style={styles.label}>Repeat every</ThemedText>
                  <TextInput
                    value={intervalValue}
                    onChangeText={setIntervalValue}
                    keyboardType="numeric"
                    placeholder="e.g. 1"
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.textInput, 
                      { 
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.card.background
                      }
                    ]}
                  />
                </View>

                {/* Two Buttons for the unit: Days vs. Months */}
                <View style={styles.inputBlock}>
                  <ThemedText style={styles.label}>Unit</ThemedText>
                  <View style={styles.unitButtons}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        { borderColor: colors.border },
                        intervalUnit === 'day' && [
                          styles.selectedButton, 
                          { backgroundColor: colors.accent }
                        ]
                      ]}
                      onPress={() => setIntervalUnit('day')}
                    >
                      <ThemedText style={[
                        styles.unitButtonText,
                        intervalUnit === 'day' && styles.selectedButtonText
                      ]}>
                        Days
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        { borderColor: colors.border },
                        intervalUnit === 'month' && [
                          styles.selectedButton, 
                          { backgroundColor: colors.accent }
                        ]
                      ]}
                      onPress={() => setIntervalUnit('month')}
                    >
                      <ThemedText style={[
                        styles.unitButtonText,
                        intervalUnit === 'month' && styles.selectedButtonText
                      ]}>
                        Months
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action buttons: Cancel / Set */}
                <View style={styles.buttonsRow}>
                  <ThemedButton style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
                    Cancel
                  </ThemedButton>
                  <ThemedButton style={[styles.btn, styles.saveBtn]} onPress={handleSet}>
                    Set
                  </ThemedButton>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollInner: {
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  inputBlock: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 6
  },
  textInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10
  },
  unitButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 15,
  },
  unitButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedButton: {
    borderWidth: 0,
  },
  unitButtonText: {
    fontSize: 16,
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30
  },
  btn: {
    flex: 1,
    marginHorizontal: 5
  },
  cancelBtn: {
    backgroundColor: '#666'
  },
  saveBtn: {
    backgroundColor: '#007AFF'
  }
});
