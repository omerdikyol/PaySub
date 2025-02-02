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
import { useLanguage } from '@/context/LanguageContext';

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
    color?: string;
    paymentHistory?: {
      [key: string]: {
        isPaid: boolean;
        paidDate?: string;
      };
    };
  };
  date: string;
  amount: number;
  historicalAmount?: number;
  paymentStatus?: {
    isPaid: boolean;
    paidDate?: string;
  };
  paymentHistory?: Array<{
    previousAmount: number;
    newAmount: number;
    effectiveDate: Date;
  }>;
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
  const { t } = useLanguage();
  
  // Transform the ExpenseItem into BaseFinanceItem
  const baseItem: BaseFinanceItem = {
    id: item.originalExpense.id,
    date: item.date,
    name: item.originalExpense.name,
    amount: item.amount,
    currency: item.originalExpense.currency,
    service: item.originalExpense.service,
    recurrence: item.originalExpense.recurrence,
    color: item.originalExpense.color,
    opacity: item.paymentStatus?.isPaid ? 0.5 : 1
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

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
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

  const handlePaymentButtonClick = (e: GestureResponderEvent) => {
    e.stopPropagation();
    // Check payment status from the original expense's paymentHistory
    const expenseDate = item.date.split('T')[0];
    const paymentHistoryEntry = Object.entries(item.originalExpense.paymentHistory || {})
      .find(([timestamp]) => timestamp.split('T')[0] === expenseDate);
    const isPaid = paymentHistoryEntry?.[1]?.isPaid ?? false;
    
    // Allow toggling in both directions (pay and refund)
    onPaymentToggle(item);
  };

  // Custom render for the right column with payment button
  const renderRightColumn = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(item.date);
    paymentDate.setHours(0, 0, 0, 0);
    const isOverdue = !item.paymentStatus?.isPaid && paymentDate < today;

    // Check payment status from the original expense's paymentHistory
    const expenseDate = item.date.split('T')[0];
    const paymentHistoryEntry = Object.entries(item.originalExpense.paymentHistory || {})
      .find(([timestamp]) => timestamp.split('T')[0] === expenseDate);
    const isPaid = paymentHistoryEntry?.[1]?.isPaid ?? false;

    return (
      <View style={[
        styles.rightColumn,
        isPaid && styles.paidRightColumn
      ]}>
        <View style={styles.amountContainer}>
          <ThemedText style={[
            styles.amountText,
            isPaid && styles.paidAmountText
          ]}>
            {formatCurrency(item.amount, item.originalExpense.currency)}
          </ThemedText>
          {/* {item.historicalAmount !== undefined && item.historicalAmount !== item.amount && (
            <ThemedText style={styles.historicalAmountText}>
              {formatCurrency(item.historicalAmount, item.originalExpense.currency)}
            </ThemedText>
          )} */}
          {isOverdue && !isPaid && (
            <View style={styles.overdueBadge}>
              <FontAwesome name="exclamation" size={10} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          {isPaid ? (
            <TouchableOpacity
              style={[styles.paidBadge]}
              onPress={handlePaymentButtonClick}
            >
              <FontAwesome name="check" size={12} color="#fff" />
              <ThemedText style={styles.paidText}>{t('paid')}</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.payButton, 
                { backgroundColor: item.originalExpense.color || '#888888' },
                isOverdue && styles.overduePayButton
              ]}
              onPress={handlePaymentButtonClick}
            >
              <FontAwesome 
                name="credit-card" 
                size={16} 
                color="#fff"
                style={styles.payButtonIcon}
              />
              <ThemedText style={[styles.payButtonText, { color: '#fff' }]}>
                {t('payNow')}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
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
  historicalAmountText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  leftActionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  paidRightColumn: {
    opacity: 0.7,
  },
  paidAmountText: {
    textDecorationLine: 'line-through',
  },
  paidBadge: {
    backgroundColor: '#34C759',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonIcon: {
    marginRight: 4,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overduePayButton: {
    backgroundColor: '#FF3B30',
  },
});