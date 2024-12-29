import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

type ExpenseItem = {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
};

export default function Expenses() {
  const colorScheme = useColorScheme();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      amount: 0,
      description: 'New Expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Other'
    };
    setExpenses([...expenses, newExpense]);
  };

  const renderExpense = ({ item }: { item: ExpenseItem }) => (
    <View style={[styles.expenseItem, {
      backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5'
    }]}>
      <View style={styles.expenseHeader}>
        <Text style={[styles.amount, {
          color: colorScheme === 'dark' ? '#ff5252' : '#d32f2f'
        }]}>-${item.amount}</Text>
        <Text style={[styles.category, {
          backgroundColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
          color: Colors[colorScheme].text
        }]}>{item.category}</Text>
      </View>
      <Text style={[styles.description, {
        color: Colors[colorScheme].text
      }]}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  return (
    <View style={[styles.container, {
      backgroundColor: Colors[colorScheme].background
    }]}>
      <Text style={[styles.header, {
        color: Colors[colorScheme].text
      }]}>Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity 
        style={[styles.addButton, {
          backgroundColor: colorScheme === 'dark' ? '#ff5252' : '#d32f2f'
        }]} 
        onPress={addExpense}
      >
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  expenseItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
  },
  date: {
    fontSize: 14,
    marginTop: 5,
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});