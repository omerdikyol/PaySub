import React from 'react';
import { 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../useTheme';

type SortCriteria = 'date' | 'price' | 'name';
type SortOrder = 'asc' | 'desc';

type SortMenuProps = {
  visible: boolean;
  onClose: () => void;
  sortCriteria: SortCriteria;
  sortOrder: SortOrder;
  onSortChange: (criteria: SortCriteria, order: SortOrder) => void;
};

export const SortMenu = ({ 
  visible, 
  onClose, 
  sortCriteria, 
  sortOrder, 
  onSortChange 
}: SortMenuProps) => {
  const { colors } = useTheme();

  const handleSortOptionPress = (criteria: SortCriteria) => {
    const newOrder = criteria === sortCriteria && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(criteria, newOrder);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ThemedView style={[styles.menuModal, { backgroundColor: colors.card.background }]}>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => handleSortOptionPress('date')}
          >
            <View style={styles.menuOptionContent}>
              <ThemedText>Date</ThemedText>
              {sortCriteria === 'date' && (
                <FontAwesome
                  name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                  size={16}
                  color={colors.text}
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => handleSortOptionPress('price')}
          >
            <View style={styles.menuOptionContent}>
              <ThemedText>Amount</ThemedText>
              {sortCriteria === 'price' && (
                <FontAwesome
                  name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                  size={16}
                  color={colors.text}
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => handleSortOptionPress('name')}
          >
            <View style={styles.menuOptionContent}>
              <ThemedText>Name</ThemedText>
              {sortCriteria === 'name' && (
                <FontAwesome
                  name={sortOrder === 'asc' ? 'sort-up' : 'sort-down'}
                  size={16}
                  color={colors.text}
                />
              )}
            </View>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
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
  menuModal: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  menuOption: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  menuOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  }
}); 