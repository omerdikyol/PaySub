import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, View } from 'react-native';
import { ThemedText, ThemedView } from '../Themed';
import { useTheme } from '../useTheme';
import { useLanguage } from '@/context/LanguageContext';

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const MenuModal = ({ visible, onClose, onEdit, onDelete }: MenuModalProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel={t('menuOptions')}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ThemedView style={[styles.menuModal, { backgroundColor: colors.card.background }]}>
          <TouchableOpacity 
            style={styles.menuOption} 
            onPress={onEdit}
            accessibilityLabel={t('edit')}
          >
            <ThemedText style={styles.menuText}>{t('edit')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuOption, styles.deleteOption]}
            onPress={onDelete}
            accessibilityLabel={t('delete')}
          >
            <ThemedText style={[styles.menuText, { color: colors.error }]}>{t('delete')}</ThemedText>
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
  deleteOption: {
    borderBottomWidth: 0
  },
  menuText: {
    fontSize: 16
  }
}); 