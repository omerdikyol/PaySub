import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ThemedView, ThemedText, ThemedCard, ThemedButton } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';

type ExpenseItem = {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
};

export default function Expenses() {
    const { colors } = useTheme();
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

    const addExpense = () => {
        const newItem: ExpenseItem = {
            id: Date.now().toString(),
            amount: 0,
            description: 'New Expense',
            date: new Date().toISOString().split('T')[0],
            category: 'Other'
        };
        setExpenses([...expenses, newItem]);
    };

    const renderExpense = ({ item }: { item: ExpenseItem }) => (
        <ThemedCard>
            <ThemedView style={[styles.expenseHeader, { backgroundColor: 'transparent' }]}>
                <ThemedText style={[styles.amount, { 
                    color: colors.error,
                    backgroundColor: 'transparent' 
                }]}>
                    -${item.amount}
                </ThemedText>
                <ThemedText style={[styles.category, {
                    backgroundColor: colors.surface,
                }]}>
                    {item.category}
                </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.description, { backgroundColor: 'transparent' }]}>
                {item.description}
            </ThemedText>
            <ThemedText style={[styles.date, { 
                color: colors.muted,
                backgroundColor: 'transparent' 
            }]}>
                {item.date}
            </ThemedText>
        </ThemedCard>
    );

    return (
        <ScreenLayout>
            <ThemedText style={styles.header}>Expenses</ThemedText>
            <FlatList
                data={expenses}
                renderItem={renderExpense}
                keyExtractor={item => item.id}
                style={styles.list}
            />
            <ThemedButton onPress={addExpense}>Add Expense</ThemedButton>
        </ScreenLayout>
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
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    category: {
        padding: 4,
        borderRadius: 4,
        fontSize: 14,
    },
    description: {
        fontSize: 16,
    },
    date: {
        fontSize: 14,
        color: '#888888',
        marginTop: 5,
    }
});