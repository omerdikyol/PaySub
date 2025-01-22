import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Platform,
  Image,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../useTheme';
import { formatCurrency } from '@/utils/currency';
import { useAnimations } from '@/hooks/useAnimations';
import { useLanguage } from '@/context/LanguageContext';

export interface BaseFinanceItem {
  id: string;
  date: string;
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
  opacity?: number;
}

type BaseCardProps = {
  item: BaseFinanceItem;
  onPress?: (item: BaseFinanceItem) => void;
  renderRightColumn?: () => React.ReactNode;
};

export const BaseCard = ({ item, onPress, renderRightColumn }: BaseCardProps) => {
  const { colors, colorScheme } = useTheme();
  const { t } = useLanguage();
  const {
    fadeAnim,
    scaleAnim,
    slideAnim,
    combinedAnimation,
    resetAnimations,
  } = useAnimations();

  useEffect(() => {
    resetAnimations();
    combinedAnimation().start();
  }, []);

  const date = new Date(item.date);
  const day = date.getDate();
  const getShortMonth = (date: Date) => {
    const monthIndex = date.getMonth();
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may_short', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return t(monthKeys[monthIndex]);
  };
  const month = getShortMonth(date);
  const recurrenceType = item.recurrence.type;
  const displayName = item.service?.customName || item.name;

  const getRecurrenceText = () => {
    if (recurrenceType === 'custom' && item.recurrence.interval && item.recurrence.intervalUnit) {
      const unit = t(item.recurrence.intervalUnit + (item.recurrence.interval > 1 ? 's' : ''));
      return t('custom').replace('{interval}', item.recurrence.interval.toString())
                       .replace('{unit}', unit);
    }
    return t(recurrenceType);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      style={styles.cardTouchArea}
    >
      <Animated.View style={[
        styles.animationWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ]
        }
      ]}>
        <ThemedView style={[
          styles.card, 
          { 
            backgroundColor: Platform.OS === 'ios' 
              ? colors.card.subtle 
              : colorScheme === 'dark'
                ? colors.card.background
                : colors.background
          }
        ]}>
          {/* Color Accent */}
          {item.color && (
            <View style={[styles.colorAccent, { backgroundColor: item.color }]} />
          )}

          {/* Card Content Container */}
          <View style={styles.cardContent}>
            {/* Date Column */}
            <View style={styles.dateColumn}>
              <ThemedText style={[
                styles.dayText,
                typeof item.opacity === 'number' ? { opacity: item.opacity } : undefined
              ]}>
                {day}
              </ThemedText>
              <ThemedText style={[
                styles.monthText,
                typeof item.opacity === 'number' ? { opacity: item.opacity } : undefined
              ]}>
                {month}
              </ThemedText>
            </View>

            {/* Main Content */}
            <View style={[
              styles.mainContent, 
              typeof item.opacity === 'number' ? { opacity: item.opacity } : undefined
            ]}>
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
                    {getRecurrenceText()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Right Column */}
            {renderRightColumn ? renderRightColumn() : (
              <View style={styles.rightColumn}>
                <ThemedText style={[
                  styles.amountText, 
                  typeof item.opacity === 'number' ? { opacity: item.opacity } : undefined
                ]}>
                  {formatCurrency(item.amount, item.currency)}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Gray Overlay for Paid Items */}
          {typeof item.opacity === 'number' && item.opacity < 1 && (
            <View style={[styles.overlay, { opacity: 0.15 }]} />
          )}
        </ThemedView>
      </Animated.View>
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
    height: 80,
    overflow: 'hidden',
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
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
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
  colorAccent: {
    width: 8,
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  animationWrapper: {
    width: '100%',
  },
});