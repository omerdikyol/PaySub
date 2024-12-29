import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';

type ExpenseItem = {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
};

export default function Expenses() {
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
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.amount}>-${item.amount}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity style={styles.addButton} onPress={addExpense}>
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  expenseItem: {
    padding: 15,
    backgroundColor: '#1e1e1e',
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
    color: '#ff5252',
  },
  category: {
    fontSize: 14,
    color: '#bbb',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    color: '#bbb',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#ff5252',
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