import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Platform, 
  Image 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../useTheme';
import { formatCurrency } from '@/utils/currency';

export type BaseFinanceItem = {
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
};

type BaseCardProps = {
  item: BaseFinanceItem;
  onPress?: (item: BaseFinanceItem) => void;
  renderRightColumn?: () => React.ReactNode;
};

export const BaseCard = ({ item, onPress, renderRightColumn }: BaseCardProps) => {
  const { colors } = useTheme();
  const date = new Date(item.date);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const recurrenceType = item.recurrence.type;
  const displayName = item.service?.customName || item.name;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      style={styles.cardTouchArea}
    >
      <ThemedView style={[styles.card, { backgroundColor: colors.card.background }]}>
        {/* Date Column */}
        <View style={styles.dateColumn}>
          <ThemedText style={styles.dayText}>{day}</ThemedText>
          <ThemedText style={styles.monthText}>{month}</ThemedText>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.topRow}>
            {item.service?.logo && (
              <Image 
                source={typeof item.service.logo === 'string' 
                  ? { uri: item.service.logo }
                  : item.service.logo
                }
                style={styles.serviceLogo}
              />
            )}
            <ThemedText style={styles.nameText} numberOfLines={1}>
              {displayName}
            </ThemedText>
          </View>

          <View style={styles.bottomRow}>
            <View style={[styles.recurrenceBadge, { backgroundColor: colors.card.subtle }]}>
              <FontAwesome 
                name={recurrenceType === 'once' ? 'calendar' : 'refresh'} 
                size={12} 
                color={colors.muted} 
                style={styles.recurrenceIcon}
              />
              <ThemedText style={styles.recurrenceText}>
                {recurrenceType === 'custom'
                  ? `Every ${item.recurrence.interval} ${item.recurrence.intervalUnit || 'month'}`
                  : recurrenceType === 'once' ? 'One-time' : recurrenceType}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Right Column */}
        {renderRightColumn ? renderRightColumn() : (
          <View style={styles.rightColumn}>
            <ThemedText style={styles.amountText}>
              {formatCurrency(item.amount, item.currency)}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardTouchArea: {
    marginVertical: 6,
    marginHorizontal: 2,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    height: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
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
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurrenceIcon: {
    marginRight: 4,
  },
  recurrenceText: {
    fontSize: 12,
    opacity: 0.7,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
});