import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image, ScrollView } from 'react-native';
import { ThemedText, ThemedView } from './Themed';
import { useTheme } from '@react-navigation/native';
import { usePremium } from '@/context/PremiumContext';
import { useLanguage } from '@/context/LanguageContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { FREE_LIMITS } from '@/types/premium';

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
  featureType?: 'income' | 'expense' | 'general';
}

export const Paywall: React.FC<PaywallProps> = ({ isVisible, onClose, featureType = 'general' }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { packages, isLoading, purchasePremium, restorePurchases } = usePremium();
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchaseInProgress(true);
      await purchasePremium(packageId);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchaseInProgress(true);
      await restorePurchases();
      onClose();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  const getFeatureMessage = () => {
    switch (featureType) {
      case 'income':
        return t('income_limit_reached', { count: FREE_LIMITS.maxIncomes });
      case 'expense':
        return t('expense_limit_reached', { count: FREE_LIMITS.maxExpenses });
      default:
        return t('premium_feature_locked');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <ThemedView style={styles.paywallContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.title}>{t('upgrade_to_premium')}</ThemedText>
            </View>

            <View style={styles.messageContainer}>
              <ThemedText style={styles.message}>{getFeatureMessage()}</ThemedText>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Icon name="check-circle" size={24} color={colors.primary} />
                <ThemedText style={styles.featureText}>{t('unlimited_incomes')}</ThemedText>
              </View>
              <View style={styles.featureRow}>
                <Icon name="check-circle" size={24} color={colors.primary} />
                <ThemedText style={styles.featureText}>{t('unlimited_expenses')}</ThemedText>
              </View>
              <View style={styles.featureRow}>
                <Icon name="check-circle" size={24} color={colors.primary} />
                <ThemedText style={styles.featureText}>{t('advanced_analytics')}</ThemedText>
              </View>
              <View style={styles.featureRow}>
                <Icon name="check-circle" size={24} color={colors.primary} />
                <ThemedText style={styles.featureText}>{t('premium_support')}</ThemedText>
              </View>
            </View>

            {isLoading || purchaseInProgress ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.packagesContainer}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[styles.packageButton, { backgroundColor: colors.primary }]}
                    onPress={() => handlePurchase(pkg.identifier)}
                  >
                    <ThemedText style={styles.packageTitle}>{pkg.product.title}</ThemedText>
                    <ThemedText style={styles.packagePrice}>{pkg.product.priceString}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
              <ThemedText style={[styles.restoreText, { color: colors.primary }]}>
                {t('restore_purchases')}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
  },
  packagesContainer: {
    gap: 15,
    marginBottom: 20,
  },
  packageButton: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 16,
    color: 'white',
  },
  restoreButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
}); 