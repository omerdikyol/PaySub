import { useState } from 'react';
import { ExpenseItem } from '@/app/types/expense';
import { IncomeItem } from '@/app/types/income';
import { useFinance } from '@/context/FinanceContext';

type FinanceItem = ExpenseItem | IncomeItem;
type FinanceType = 'expense' | 'income';

export function useFinanceCRUD(type: FinanceType) {
  const { 
    addExpense, 
    updateExpense, 
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome 
  } = useFinance();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<FinanceItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAdd = (newItem: Omit<FinanceItem, 'id'>) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
      ...(type === 'expense' ? { paymentHistory: {} } : {})
    };

    if (type === 'expense') {
      addExpense(item as ExpenseItem);
    } else {
      addIncome(item as IncomeItem);
    }
  };

  const handleEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setIsModalVisible(true);
      setSelectedItem(null);
    }
  };

  const handleSave = (updatedItem: Omit<FinanceItem, 'id'>) => {
    if (editingItem) {
      if (type === 'expense') {
        updateExpense(editingItem.id, updatedItem as Omit<ExpenseItem, 'id'>);
      } else {
        updateIncome(editingItem.id, updatedItem as Omit<IncomeItem, 'id'>);
      }
    } else {
      if (type === 'expense') {
        addExpense(updatedItem as Omit<ExpenseItem, 'id'>);
      } else {
        addIncome(updatedItem as Omit<IncomeItem, 'id'>);
      }
    }
    setIsModalVisible(false);
    setEditingItem(null);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalVisible(false);
  };

  const handleDelete = (itemId: string) => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      if (type === 'expense') {
        deleteExpense(selectedItem.id);
      } else {
        deleteIncome(selectedItem.id);
      }
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedItem(null);
  };

  return {
    // State
    isModalVisible,
    editingItem,
    selectedItem,
    showDeleteConfirm,

    // Setters
    setIsModalVisible,
    setEditingItem,
    setSelectedItem,
    setShowDeleteConfirm,

    // Handlers
    handleAdd,
    handleEdit,
    handleSave,
    handleCloseModal,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete
  };
} 