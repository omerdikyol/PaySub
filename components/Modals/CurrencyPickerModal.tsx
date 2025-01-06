import React from 'react';
import { Modal, StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView, ThemedText } from '../Themed';
import { useTheme } from '../useTheme';
import { currencies } from '@/utils/currency';
import { useLanguage } from '@/context/LanguageContext';

// Add frequently used currencies after TRY
const FREQUENT_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: string) => void;
  selectedCurrency: string;
}

export function CurrencyPickerModal({ visible, onClose, onSelect, selectedCurrency }: CurrencyPickerModalProps) {
  const { colors, colorScheme } = useTheme();
  const { t } = useLanguage();

  // Sort currencies with TRY first, then frequent ones, then the rest
  const sortedCurrencies = Object.values(currencies).sort((a, b) => {
    if (a.code === 'TRY') return -1;
    if (b.code === 'TRY') return 1;
    
    const aIndex = FREQUENT_CURRENCIES.indexOf(a.code);
    const bIndex = FREQUENT_CURRENCIES.indexOf(b.code);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return t(`currency_${a.code.toLowerCase()}`).localeCompare(t(`currency_${b.code.toLowerCase()}`));
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel={t('selectCurrency')}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
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
                  currencyItem.code === selectedCurrency && { backgroundColor: colors.surface },
                  FREQUENT_CURRENCIES.includes(currencyItem.code) && styles.frequentCurrency
                ]}
                onPress={() => onSelect(currencyItem.code)}
                accessibilityLabel={t(`currency_${currencyItem.code.toLowerCase()}`)}
              >
                <View style={styles.currencyOptionContent}>
                  <ThemedText style={styles.currencyFlag}>{currencyItem.flag}</ThemedText>
                  <View style={styles.currencyInfo}>
                    <ThemedText style={styles.currencyCode}>
                      {currencyItem.code}
                    </ThemedText>
                    <ThemedText style={styles.currencyName}>
                      {t(`currency_${currencyItem.code.toLowerCase()}`)}
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
  );
}

const styles = StyleSheet.create({
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