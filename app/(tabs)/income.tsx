import { StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { ThemedView, ThemedText, ThemedCard, ThemedButton } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';

type IncomeItem = {
    id: string;
    amount: number;
    description: string;
    date: string;
};

export default function Income() {
    const { colors } = useTheme();
    const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);

    const addIncome = () => {
        const newItem: IncomeItem = {
            id: Date.now().toString(),
            amount: 0,
            description: 'New Income',
            date: new Date().toISOString().split('T')[0]
        };
        setIncomeItems([...incomeItems, newItem]);
    };

    const renderItem = ({ item }: { item: IncomeItem }) => (
        <ThemedCard>
            <ThemedText style={[styles.amount, { color: colors.success }]}>
                +${item.amount}
            </ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
            <ThemedText style={[styles.date, { color: colors.muted }]}>
                {item.date}
            </ThemedText>
        </ThemedCard>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.header}>Income</ThemedText>
            <FlatList
                data={incomeItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
            />
            <ThemedButton onPress={addIncome}>Add Income</ThemedButton>
        </ThemedView>
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
    incomeItem: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
    },
    date: {
        fontSize: 14,
        color: '#888888',
        marginTop: 5,
    },
    addButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});