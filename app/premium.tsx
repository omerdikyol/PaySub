import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePremium } from '@/context/PremiumContext';
import { useTheme } from '@react-navigation/native';
import { ThemedText } from '@/components/Themed';
import { FREE_LIMITS } from '@/types/premium';
import { useTranslation } from 'react-i18next';

export default function PremiumScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { premiumStatus, packages, isLoading, purchasePremium, restorePurchases } = usePremium();

  const handlePurchase = async (packageId: string) => {
    try {
      await purchasePremium(packageId);
    } catch (error) {
      // Handle error (show alert, etc.)
      console.error('Purchase failed:', error);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      // Handle error (show alert, etc.)
      console.error('Restore failed:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t('premium_features')}</ThemedText>
        {premiumStatus.isPremium && (
          <ThemedText style={styles.subtitle}>
            {t('premium_active_until', { date: premiumStatus.expirationDate?.toLocaleDateString() })}
          </ThemedText>
        )}
      </View>

      <View style={styles.featuresContainer}>
        <ThemedText style={styles.featureTitle}>{t('free_plan')}</ThemedText>
        <ThemedText style={styles.feature}>
          • {t('max_incomes', { count: FREE_LIMITS.maxIncomes })}
        </ThemedText>
        <ThemedText style={styles.feature}>
          • {t('max_expenses', { count: FREE_LIMITS.maxExpenses })}
        </ThemedText>

        <ThemedText style={[styles.featureTitle, styles.premiumTitle]}>
          {t('premium_plan')}
        </ThemedText>
        <ThemedText style={styles.feature}>• {t('unlimited_incomes')}</ThemedText>
        <ThemedText style={styles.feature}>• {t('unlimited_expenses')}</ThemedText>
        <ThemedText style={styles.feature}>• {t('advanced_analytics')}</ThemedText>
        <ThemedText style={styles.feature}>• {t('premium_support')}</ThemedText>
      </View>

      {!premiumStatus.isPremium && (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
  },
  premiumTitle: {
    marginTop: 30,
  },
  feature: {
    fontSize: 16,
    marginBottom: 10,
    paddingLeft: 10,
  },
  packagesContainer: {
    gap: 15,
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
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 16,
  },
});
