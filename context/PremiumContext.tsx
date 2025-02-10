import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PremiumStatus, PremiumLimits, FREE_LIMITS, PREMIUM_LIMITS } from '@/types/premium';

// Only import Purchases in development builds
let Purchases: any;
try {
  Purchases = require('react-native-purchases');
} catch (error) {
  console.log('RevenueCat not available in Expo Go');
}

interface PremiumContextType {
  premiumStatus: PremiumStatus;
  limits: PremiumLimits;
  packages: any[];
  isLoading: boolean;
  purchasePremium: (packageId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  checkLimits: (type: 'income' | 'expense', currentCount: number) => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    entitlements: [],
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    // Skip RevenueCat initialization in Expo Go
    if (!Purchases) {
      console.log('Running in Expo Go - Premium features limited');
      return;
    }

    try {
      setIsLoading(true);
      // Replace with your RevenueCat API key
      Purchases.configure({ apiKey: 'your_revenuecat_api_key' });
      
      // Get current subscription status
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      setPremiumStatus({
        isPremium,
        entitlements: Object.keys(customerInfo.entitlements.active),
        expirationDate: isPremium 
          ? new Date(customerInfo.entitlements.active['premium'].expirationDate) 
          : undefined,
      });

      // Get available packages
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('Error initializing purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = async (packageId: string) => {
    if (!Purchases) {
      console.log('Premium features not available in Expo Go');
      return;
    }

    try {
      setIsLoading(true);
      const purchasePackage = packages.find(pkg => pkg.identifier === packageId);
      if (!purchasePackage) throw new Error('Package not found');

      const { customerInfo } = await Purchases.purchasePackage(purchasePackage);
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      setPremiumStatus({
        isPremium,
        entitlements: Object.keys(customerInfo.entitlements.active),
        expirationDate: isPremium 
          ? new Date(customerInfo.entitlements.active['premium'].expirationDate) 
          : undefined,
      });
    } catch (error) {
      console.error('Error purchasing premium:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!Purchases) {
      console.log('Premium features not available in Expo Go');
      return;
    }

    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      
      setPremiumStatus({
        isPremium,
        entitlements: Object.keys(customerInfo.entitlements.active),
        expirationDate: isPremium 
          ? new Date(customerInfo.entitlements.active['premium'].expirationDate) 
          : undefined,
      });
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkLimits = (type: 'income' | 'expense', currentCount: number): boolean => {
    const limits = premiumStatus.isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
    const maxItems = type === 'income' ? limits.maxIncomes : limits.maxExpenses;
    return currentCount < maxItems;
  };

  return (
    <PremiumContext.Provider
      value={{
        premiumStatus,
        limits: premiumStatus.isPremium ? PREMIUM_LIMITS : FREE_LIMITS,
        packages,
        isLoading,
        purchasePremium,
        restorePurchases,
        checkLimits,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
