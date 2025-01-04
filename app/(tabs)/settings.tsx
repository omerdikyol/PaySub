import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { ThemedView, ThemedText } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { currencies } from '@/utils/currency';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const { colors } = useTheme();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState('TRY');

  // Load preferred currency on component mount
  React.useEffect(() => {
    loadPreferredCurrency();
  }, []);

  const loadPreferredCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('preferredCurrency');
      if (saved) {
        setPreferredCurrency(saved);
      }
    } catch (error) {
      console.error('Error loading preferred currency:', error);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    setPreferredCurrency(currency);
    try {
      await AsyncStorage.setItem('preferredCurrency', currency);
    } catch (error) {
      console.error('Error saving preferred currency:', error);
    }
    setShowCurrencyPicker(false);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Currency Settings</ThemedText>
        
        <TouchableOpacity
          style={[styles.settingItem, { borderColor: colors.border }]}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <View style={styles.settingContent}>
            <ThemedText style={styles.settingLabel}>Preferred Currency</ThemedText>
            <View style={styles.currencyDisplay}>
              <ThemedText style={styles.currencyText}>
                {currencies[preferredCurrency].flag} {preferredCurrency}
              </ThemedText>
              <FontAwesome name="chevron-right" size={12} color={colors.text} />
            </View>
          </View>
        </TouchableOpacity>
      </ThemedView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={[styles.currencyPicker, { backgroundColor: colors.card.background }]}>
            <ThemedText style={styles.pickerTitle}>Select Preferred Currency</ThemedText>
            <ScrollView style={styles.currencyList}>
              {Object.values(currencies).map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyOption,
                    currency.code === preferredCurrency && {
                      backgroundColor: colors.primary + '20'
                    }
                  ]}
                  onPress={() => handleCurrencyChange(currency.code)}
                >
                  <View style={styles.currencyOptionContent}>
                    <ThemedText style={styles.currencyFlag}>{currency.flag}</ThemedText>
                    <View style={styles.currencyInfo}>
                      <ThemedText style={styles.currencyCode}>
                        {currency.code}
                      </ThemedText>
                      <ThemedText style={styles.currencyName}>
                        {currency.name}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyText: {
    fontSize: 16,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  currencyPicker: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  currencyList: {
    maxHeight: '100%',
  },
  currencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
});