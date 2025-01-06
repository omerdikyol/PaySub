import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, View } from 'react-native';
import { ThemedText, ThemedView, ThemedButton } from '../Themed';
import { useTheme } from '../useTheme';
import { useLanguage } from '@/context/LanguageContext';

type DeleteConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export const DeleteConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm,
  title = "deleteItem",
  message = "deleteConfirmation"
}: DeleteConfirmationModalProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel={t('deleteConfirmation')}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ThemedView style={[styles.confirmModal, { backgroundColor: colors.card.background }]}>
          <ThemedText style={styles.confirmTitle}>{t(title)}</ThemedText>
          <ThemedText style={styles.confirmMessage}>{t(message)}</ThemedText>
          <View style={styles.confirmButtons}>
            <ThemedButton
              style={[styles.confirmButton, styles.cancelButton]}
              onPress={onClose}
            >
              {t('cancel')}
            </ThemedButton>
            <ThemedButton
              style={[styles.confirmButton, styles.deleteButton]}
              onPress={onConfirm}
            >
              {t('delete')}
            </ThemedButton>
          </View>
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
  confirmModal: {
    width: 300,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 20
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#ccc'
  },
  deleteButton: {
    backgroundColor: '#FF3B30'
  }
}); 