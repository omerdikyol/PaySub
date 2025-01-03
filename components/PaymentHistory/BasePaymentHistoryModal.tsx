import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  SectionList 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../useTheme';
import { formatCurrency } from '@/utils/currency';

export type BasePayment = {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  paymentStatus?: {
    isPaid: boolean;
    paidDate?: string;
  };
};

type BasePaymentHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedItem: any | null;
  payments: BasePayment[];
  onPaymentToggle?: (payment: BasePayment) => void;
};

export const BasePaymentHistoryModal = ({
  visible,
  onClose,
  selectedItem,
  payments,
  onPaymentToggle
}: BasePaymentHistoryModalProps) => {
  const { colors } = useTheme();

  const groupedPayments = React.useMemo(() => {
    const groups: { [key: string]: BasePayment[] } = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(payment);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data
    }));
  }, [payments]);

  const renderPaymentItem = ({ item }: { item: BasePayment }) => {
    const date = new Date(item.date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isPaid = item.paymentStatus?.isPaid;
    const isOverdue = !isPaid && new Date(item.date) < new Date();
  
    return (
      <View style={styles.paymentItem}>
        <View style={styles.paymentItemLeft}>
          <ThemedText style={styles.paymentDate}>
            {date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              day: 'numeric',
              month: 'short' 
            })}
            {isToday && (
              <ThemedText style={styles.todayBadge}> • Today</ThemedText>
            )}
          </ThemedText>
          <ThemedText style={styles.paymentAmount}>
            {formatCurrency(item.amount, item.currency)}
          </ThemedText>
        </View>
  
        {onPaymentToggle && (
          <TouchableOpacity
            style={[
              styles.paymentStatusButton,
              isPaid ? styles.paidButton : 
              isOverdue ? styles.overdueButton : styles.unpaidButton
            ]}
            onPress={() => onPaymentToggle(item)}
          >
            <FontAwesome 
              name={isPaid ? "check" : "credit-card"} 
              size={14} 
              color="#fff" 
            />
            <ThemedText style={styles.paymentStatusText}>
              {isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PAY NOW'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <ThemedView style={[styles.paymentHistoryModal, { backgroundColor: colors.surface }]}>
          <View style={styles.paymentHistoryHeader}>
            <View>
              <ThemedText style={styles.paymentHistoryTitle}>
                Payment History
              </ThemedText>
              <ThemedText style={styles.expenseName}>
                {selectedItem?.name}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <FontAwesome name="times" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.expenseDetails}>
            <View style={styles.expenseInfoRow}>
              <View style={styles.expenseInfoItem}>
                <ThemedText style={styles.expenseInfoLabel}>
                  Amount
                </ThemedText>
                <ThemedText style={styles.expenseInfoValue}>
                  {selectedItem && formatCurrency(selectedItem.amount, selectedItem.currency)}
                </ThemedText>
              </View>
              <View style={styles.expenseInfoItem}>
                <ThemedText style={styles.expenseInfoLabel}>
                  Frequency
                </ThemedText>
                <ThemedText style={styles.expenseInfoValue}>
                  {selectedItem?.recurrence?.type || 'One-time'}
                </ThemedText>
              </View>
            </View>
          </View>

          <SectionList
            sections={groupedPayments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderPaymentItem({ item })}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.monthSection}>
                <ThemedText style={styles.monthHeader}>{title}</ThemedText>
              </View>
            )}
            style={styles.paymentsList}
            contentContainerStyle={styles.paymentsListContent}
            showsVerticalScrollIndicator={true}
          />
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalBackground: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    paymentHistoryModal: {
      width: '90%',
      maxWidth: 400,
      height: '80%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    paymentHistoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    paymentHistoryTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    closeButton: {
      padding: 4,
    },
    expenseName: {
      fontSize: 16,
      opacity: 0.7,
    },
    expenseDetails: {
      padding: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    expenseInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    expenseInfoItem: {
      flex: 1,
    },
    expenseInfoLabel: {
      fontSize: 13,
      opacity: 0.5,
      marginBottom: 4,
    },
    expenseInfoValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    paymentsList: {
      flex: 1,
    },
    paymentsListContent: {
      flexGrow: 1,
    },
    monthSection: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    monthHeader: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 12,
      opacity: 0.6,
    },
    paymentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    paymentItemLeft: {
      flex: 1,
    },
    paymentDate: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    paymentAmount: {
      fontSize: 14,
      opacity: 0.7,
    },
    todayBadge: {
      color: '#007AFF',
      fontWeight: '500',
    },
    paymentStatusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      gap: 6,
    },
    paidButton: {
      backgroundColor: '#34C759',
    },
    unpaidButton: {
      backgroundColor: '#007AFF',
    },
    overdueButton: {
      backgroundColor: '#FF3B30',
    },
    paymentStatusText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
    }
  });