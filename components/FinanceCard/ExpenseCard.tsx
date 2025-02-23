import React, { useRef } from 'react';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Transform the ExpenseItem into BaseFinanceItem
  const date = new Date(item.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const paymentDate = new Date(item.date);
  paymentDate.setHours(0, 0, 0, 0);
  const isOverdue = !isPaid && paymentDate < today;

  // Custom render for the date column to show overdue status
  const renderDateColumn = () => {
    const date = new Date(item.date);
    const day = date.getDate();
    const getShortMonth = (date: Date) => {
      const monthIndex = date.getMonth();
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may_short', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      return t(monthKeys[monthIndex]);
    };
    const month = getShortMonth(date);

    return (
      <View style={styles.dateColumn}>
        <ThemedText style={[styles.dayText, isOverdue && styles.overdueDayText]}>{day}</ThemedText>
        <ThemedText style={[styles.monthText, isOverdue && styles.overdueMonthText]}>{month}</ThemedText>
      </View>
    );
  };

  const baseItem: BaseFinanceItem = {
    id: item.originalExpense.id,
    date: item.date,
    name: item.originalExpense.name,
    amount: item.amount,
    currency: item.originalExpense.currency,
    service: item.originalExpense.service,
    recurrence: item.originalExpense.recurrence,
    color: item.originalExpense.color,
    opacity: fadeAnim
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
    
    // Start fade out animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onPaymentToggle(item);
    });
  };

  const getPaymentHistoryData = (date: string, paymentHistory?: { [key: string]: any }) => {
    if (!paymentHistory) return undefined;
    
    const targetDate = date.split('T')[0];
    const matchingKey = Object.keys(paymentHistory).find(key => key.split('T')[0] === targetDate);
    if (!matchingKey) return undefined;

    // Get the payment data and handle the nested structure
    const paymentData = paymentHistory[matchingKey];
    if (paymentData['025Z']) {
      return paymentData['025Z'];
    }
    return paymentData;
  };

  const expenseDate = item.date;
  const paymentHistoryData = getPaymentHistoryData(expenseDate, item.originalExpense.paymentHistory);
  const isPaid = paymentHistoryData?.isPaid ?? false;

  // Custom render for the right column with payment button
  const renderRightColumn = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(item.date);
    paymentDate.setHours(0, 0, 0, 0);
    
    const paymentHistoryData = getPaymentHistoryData(item.date, item.originalExpense.paymentHistory);
    const isPaid = paymentHistoryData?.isPaid ?? false;
    const isOverdue = !isPaid && paymentDate < today;

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
    <Animated.View style={{
      transform: [{
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -50]
        })
      }]
    }}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={handleSwipeableWillOpen}
        rightThreshold={40}
        leftThreshold={40}
        overshootRight={false}
        overshootLeft={false}
        style={[
          styles.swipeableContainer,
          isPaid && styles.paidSwipeableContainer
        ]}
      >
        <BaseCard 
          item={baseItem}
          onPress={() => onPress(item)}
          renderRightColumn={renderRightColumn}
          renderDateColumn={renderDateColumn}
        />
      </Swipeable>
    </Animated.View>
  );
};



const styles = StyleSheet.create({
  dateColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayText: {
    fontSize: 20,
    fontWeight: '600',
  },
  monthText: {
    fontSize: 13,
    opacity: 0.6,
  },
  overdueDayText: {
    color: '#FF3B30',
  },
  overdueMonthText: {
    color: '#FF3B30',
    opacity: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  amountContainer: {
    alignItems: 'flex-end',
    position: 'relative',
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
  swipeableContainer: {
    flex: 1,
  },
  paidSwipeableContainer: {
    opacity: 0.7,
  },
});