import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { currencies, displayToNumeric, numericToDisplay } from '@/utils/currency';
import { FontAwesome } from '@expo/vector-icons';

// Add frequently used currencies after TRY
const FREQUENT_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencyInput({ value, onChange, currency, onCurrencyChange }: CurrencyInputProps) {
  const { colors, colorScheme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  
  // Get currency configuration
  const currencyConfig = currencies[currency];

  const handleAmountChange = (text: string) => {
    // Allow only numbers, decimal separator, and thousand separator
    const validChars = new RegExp(`[0-9${currencyConfig.decimal}${currencyConfig.thousand}]`);
    const cleanedText = text.split('').filter(char => validChars.test(char)).join('');
    
    // Ensure only one decimal separator
    const parts = cleanedText.split(currencyConfig.decimal);
    if (parts.length > 2) {
      parts.splice(2); // Remove extra decimal parts
    }
    
    // Limit decimal places to 2
    if (parts[1]) {
      parts[1] = parts[1].slice(0, 2);
    }
    
    // Reconstruct the value
    const newValue = parts.join(currencyConfig.decimal);
    onChange(newValue);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    // Get both currency configs
    const oldConfig = currencies[currency];
    const newConfig = currencies[newCurrency];
    
    // Convert display value to numeric value
    const numericValue = displayToNumeric(value, oldConfig);
    
    // Convert numeric value back to display format with new currency's formatting
    const newValue = numericToDisplay(numericValue, newConfig);
    
    onChange(newValue);
    onCurrencyChange(newCurrency);
    setShowCurrencyPicker(false);
  };

  // Sort currencies with TRY first, then frequent ones, then the rest
  const sortedCurrencies = Object.values(currencies).sort((a, b) => {
    if (a.code === 'TRY') return -1;
    if (b.code === 'TRY') return 1;
    
    const aIndex = FREQUENT_CURRENCIES.indexOf(a.code);
    const bIndex = FREQUENT_CURRENCIES.indexOf(b.code);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        { backgroundColor: 'rgba(128,128,128,0.1)' },
        focused && styles.focusedInput
      ]}>
        <TextInput
          style={[styles.amountInput, { color: colors.text }]}
          value={value}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`0${currencyConfig.decimal}00`}
          placeholderTextColor={colors.muted}
        />

        <TouchableOpacity 
          style={[styles.currencySelector]}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <ThemedText style={styles.currencyText}>
            {currencies[currency].flag} {currency}
          </ThemedText>
          <FontAwesome name="chevron-down" size={12} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={[styles.currencyPicker, { backgroundColor: colors.card.background }]}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              indicatorStyle={colorScheme === 'dark' ? 'white' : 'black'}
              style={styles.scrollView}
            >
              {sortedCurrencies.map((currencyItem) => (
                <TouchableOpacity
                  key={currencyItem.code}
                  style={[
                    styles.currencyOption,
                    currencyItem.code === currency && { backgroundColor: colors.surface },
                    FREQUENT_CURRENCIES.includes(currencyItem.code) && styles.frequentCurrency
                  ]}
                  onPress={() => handleCurrencyChange(currencyItem.code)}
                >
                  <View style={styles.currencyOptionContent}>
                    <ThemedText style={styles.currencyFlag}>{currencyItem.flag}</ThemedText>
                    <View style={styles.currencyInfo}>
                      <ThemedText style={styles.currencyCode}>
                        {currencyItem.code}
                      </ThemedText>
                      <ThemedText style={styles.currencyName}>
                        {currencyItem.name}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.currencySymbol}>
                      {currencyItem.symbol}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    position: 'relative',
  },
  focusedInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    padding: 0,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
    gap: 5,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  currencyPicker: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    backgroundColor: 'rgba(128,128,128,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  scrollView: {
    paddingRight: 2,
  },
  currencyOption: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyFlag: {
    fontSize: 24,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 14,
    opacity: 0.7,
  },
  currencySymbol: {
    fontSize: 16,
    opacity: 0.8,
  },
  frequentCurrency: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
});