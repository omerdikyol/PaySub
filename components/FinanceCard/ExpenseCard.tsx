import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Animated,
  GestureResponderEvent
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '../Themed';
import { useTheme } from '../useTheme';
import { BaseCard, BaseFinanceItem } from './BaseCard';
import { formatCurrency } from '@/utils/currency';

export interface ExpenseItem extends BaseFinanceItem {
  originalExpense: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    service?: {
      logo?: string | any;
      customName?: string;
    };
    recurrence: {
      type: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
      interval?: number;
      intervalUnit?: string;
    };
  };
  date: string;
  amount: number;
  paymentStatus?: {
    isPaid: boolean;
  };
}

type ExpenseCardProps = {
  item: ExpenseItem;
  onPress: (item: ExpenseItem) => void;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
  onPaymentToggle: (item: ExpenseItem) => void;
  swipeableRef?: React.RefObject<Swipeable>;
};

export const ExpenseCard = ({ 
  item, 
  onPress, 
  onEdit, 
  onDelete, 
  onPaymentToggle,
  swipeableRef 
}: ExpenseCardProps) => {
  const { colors } = useTheme();
  
  // Transform the ExpenseItem into BaseFinanceItem
  const baseItem: BaseFinanceItem = {
    id: item.originalExpense.id,
    date: item.date,
    name: item.originalExpense.name,
    amount: item.amount,
    currency: item.originalExpense.currency,
    service: item.originalExpense.service,
    recurrence: item.originalExpense.recurrence
  };

  const handleSwipeLeft = () => {
    swipeableRef?.current?.close();
  };

  const handleSwipeableWillOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onPaymentToggle(item);
      handleSwipeLeft();
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#555' }]}
          onPress={() => {
            onEdit(item);
            handleSwipeLeft();
          }}
        >
          <FontAwesome name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => {
            onDelete(item);
            handleSwipeLeft();
          }}
        >
          <FontAwesome name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
    return (
      <View 
        style={[
          styles.leftActionsContainer,
          { backgroundColor: item.paymentStatus?.isPaid ? '#FF3B30' : '#34C759' }
        ]}
      >
        <FontAwesome 
          name={item.paymentStatus?.isPaid ? "times" : "check"} 
          size={24} 
          color="#fff" 
        />
      </View>
    );
  };

  const handlePaymentButtonClick = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onPaymentToggle(item);
  };

  // Custom render for the right column with payment button
  const renderRightColumn = () => (
    <View style={styles.rightColumn}>
      <ThemedText style={styles.amountText}>
        {formatCurrency(item.amount, item.originalExpense.currency)}
      </ThemedText>

      <View style={styles.actionsRow}>
        {item.paymentStatus?.isPaid ? (
          <TouchableOpacity
            style={styles.paidBadge}
            onPress={handlePaymentButtonClick}
          >
            <FontAwesome name="check" size={12} color="#fff" />
            <ThemedText style={styles.paidText}>PAID</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.card.subtle }]}
            onPress={handlePaymentButtonClick}
          >
            <FontAwesome 
              name="credit-card" 
              size={16} 
              color={colors.text} 
              style={styles.payButtonIcon}
            />
            <ThemedText style={styles.payButtonText}>
              Pay Now
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      rightThreshold={40}
      leftThreshold={40}
      overshootRight={false}
      overshootLeft={false}
    >
      <BaseCard 
        item={baseItem} 
        onPress={() => onPress(item)}
        renderRightColumn={renderRightColumn}
      />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  paidText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  payButtonIcon: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
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
  },
  leftActionsContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    marginHorizontal: 2,
    borderRadius: 16,
    opacity: 0.9,
  },
});