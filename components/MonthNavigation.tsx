import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from './Themed';
import { useTheme } from './useTheme';

type MonthNavigationProps = {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
};

export const MonthNavigation = ({ currentDate, onMonthChange }: MonthNavigationProps) => {
  const { colors } = useTheme();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const getNextMonthName = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleString('default', { month: 'short' });
  };

  const getPrevMonthName = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth.toLocaleString('default', { month: 'short' });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.card.subtle }]}
        onPress={handlePrevMonth}
      >
        <FontAwesome name="chevron-left" size={16} color={colors.text} />
        <ThemedText style={styles.monthText}>{getPrevMonthName()}</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.currentMonth}>
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </ThemedText>

      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.card.subtle }]}
        onPress={handleNextMonth}
      >
        <ThemedText style={styles.monthText}>{getNextMonthName()}</ThemedText>
        <FontAwesome name="chevron-right" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  currentMonth: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 14,
    opacity: 0.8,
  },
});