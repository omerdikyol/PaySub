import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { currencies } from '@/utils/currency';
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
  const wholePartRef = useRef<TextInput>(null);
  const decimalPartRef = useRef<TextInput>(null);
  
  // Get currency configuration
  const currencyConfig = currencies[currency];

  // Split using the correct decimal separator
  const [wholePart, decimalPart] = value.split(currencyConfig.decimal);

  const handleCurrencyChange = (newCurrency: string) => {
    // Get both currency configs
    const oldConfig = currencies[currency];
    const newConfig = currencies[newCurrency];
    
    // Convert the current value to a normalized format
    const normalizedValue = value
      .replace(new RegExp('\\' + oldConfig.thousand, 'g'), '')
      .replace(oldConfig.decimal, '.');
    
    // Format the value according to the new currency's format
    const [whole, decimal = ''] = normalizedValue.split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, newConfig.thousand);
    const newValue = `${formattedWhole}${newConfig.decimal}${decimal}`;
    
    onChange(newValue);
    onCurrencyChange(newCurrency);
    setShowCurrencyPicker(false);
  };

  const handleWholePartChange = (text: string) => {
    // Remove existing thousand separators
    const rawNumber = text.replace(new RegExp('\\' + currencyConfig.thousand, 'g'), '');
    
    // Remove any non-numeric characters
    const cleaned = rawNumber.replace(/[^0-9]/g, '');
    
    // Add thousand separators using the correct separator for this currency
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousand);
    
    // Combine with decimal part using the correct decimal separator
    onChange(`${formatted || '0'}${currencyConfig.decimal}${decimalPart || ''}`);
  };

  const handleDecimalPartChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    onChange(`${wholePart || '0'}${currencyConfig.decimal}${cleaned}`);
  };

  const handleWholePartKeyPress = ({ nativeEvent: { key } }: any) => {
    if (key === currencyConfig.decimal) {
      decimalPartRef.current?.focus();
    }
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
          ref={wholePartRef}
          style={[styles.wholePartInput, { color: colors.text }]}
          value={wholePart === '0' ? '' : wholePart}
          onChangeText={handleWholePartChange}
          onKeyPress={handleWholePartKeyPress}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity onPress={() => decimalPartRef.current?.focus()}>
          <ThemedText style={styles.comma}>{currencyConfig.decimal}</ThemedText>
        </TouchableOpacity>
        <TextInput
          ref={decimalPartRef}
          style={[styles.decimalPartInput, { color: colors.text }]}
          value={decimalPart || ''}
          onChangeText={handleDecimalPartChange}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="00"
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
              showsVerticalScrollIndicator={true} // Add this line
              indicatorStyle={colorScheme === 'dark' ? 'white' : 'black'} // Add this line
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
  wholePartInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    padding: 0,
  },
  decimalPartInput: {
    fontSize: 20,
    width: 30,
    padding: 0,
  },
  comma: {
    fontSize: 24,
    marginHorizontal: 2,
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
    maxHeight: '70%', // Increased height
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    backgroundColor: 'rgba(128,128,128,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden', // Added to keep border radius with ScrollView
  },
  scrollView: {
    paddingRight: 2, // Add this to prevent content from touching scroll indicator
  },
  currencyOption: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  currencyOptionText: {
    fontSize: 16,
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