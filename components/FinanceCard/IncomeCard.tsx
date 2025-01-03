import React from 'react';
import { 
  View,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { BaseCard } from './BaseCard';
import { formatCurrency } from '@/utils/currency';
import { IncomeItem } from '@/app/types/income';
import { ThemedText } from '../Themed';

export type IncomeOccurrence = {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  color?: string;
  service?: {
    logo?: string | any;
    customName?: string;
  };
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval?: number;
    intervalUnit?: string;
  };
  originalIncome: IncomeItem;
};

type IncomeCardProps = {
  item: IncomeOccurrence;
  onPress?: (item: IncomeOccurrence) => void;
  onEdit?: (item: IncomeOccurrence) => void;
  onDelete?: (item: IncomeOccurrence) => void;
  swipeableRef?: React.RefObject<Swipeable>;
};

export const IncomeCard = ({ 
  item, 
  onPress, 
  onEdit, 
  onDelete,
  swipeableRef 
}: IncomeCardProps) => {
  const handleSwipeLeft = () => {
    swipeableRef?.current?.close();
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#555' }]}
          onPress={() => {
            onEdit?.(item);
            handleSwipeLeft();
          }}
        >
          <FontAwesome name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => {
            onDelete?.(item);
            handleSwipeLeft();
          }}
        >
          <FontAwesome name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // Transform to BaseFinanceItem format
  const baseItem = {
    id: item.originalIncome.id,
    date: item.date,
    name: item.originalIncome.name,
    amount: item.amount,
    currency: item.originalIncome.currency,
    color: item.color,
    recurrence: item.originalIncome.recurrence
  };

  const renderRightColumn = () => (
    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
      <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
        {formatCurrency(item.amount, item.currency)}
      </ThemedText>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <BaseCard
        item={baseItem}
        onPress={() => onPress?.(item)}
        renderRightColumn={renderRightColumn}
      />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightActionsContainer: {
    flexDirection: 'row',
    width: 140,
    height: 80,
    marginVertical: 6,
    marginHorizontal: 2,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.9,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
