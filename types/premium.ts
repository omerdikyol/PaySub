export interface PremiumStatus {
  isPremium: boolean;
  entitlements: string[];
  expirationDate?: Date;
}

export interface PremiumLimits {
  maxIncomes: number;
  maxExpenses: number;
}

export const FREE_LIMITS: PremiumLimits = {
  maxIncomes: 3,
  maxExpenses: 5,
};

export const PREMIUM_LIMITS: PremiumLimits = {
  maxIncomes: Infinity,
  maxExpenses: Infinity,
};
