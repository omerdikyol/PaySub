import { StyleSheet, View, ViewStyle } from 'react-native';
import React from 'react';
import { useTheme } from './useTheme';

interface BalanceProgressBarProps {
  income: number;
  expenses: number;
  style?: ViewStyle;
  height?: number;
}

export function BalanceProgressBar({ 
  income, 
  expenses,
  style, 
  height = 8 
}: BalanceProgressBarProps) {
  const { colors } = useTheme();
  
  const total = income + expenses;
  const incomeRatio = total === 0 ? 0 : (income / total) * 100;
  const expenseRatio = total === 0 ? 0 : (expenses / total) * 100;

  return (
    <View style={[styles.container, { height }, style]}>
      {total === 0 ? (
        // Show gray bar when no income or expenses
        <View style={[styles.progress, { backgroundColor: '#E0E0E0', width: '100%' }]} />
      ) : (
        <>
          {/* Income bar (green) */}
          <View 
            style={[
              styles.progress, 
              { 
                backgroundColor: colors.success,
                width: `${incomeRatio}%`,
                borderTopRightRadius: expenseRatio === 0 ? 4 : 0,
                borderBottomRightRadius: expenseRatio === 0 ? 4 : 0,
              }
            ]} 
          />
          {/* Expense bar (red) */}
          <View 
            style={[
              styles.progress, 
              { 
                backgroundColor: colors.error,
                width: `${expenseRatio}%`,
                borderTopLeftRadius: incomeRatio === 0 ? 4 : 0,
                borderBottomLeftRadius: incomeRatio === 0 ? 4 : 0,
              }
            ]} 
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progress: {
    height: '100%',
  },
}); 