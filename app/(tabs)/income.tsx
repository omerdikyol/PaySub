import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';

type IncomeItem = {
    id: string;
    amount: number;
    description: string;
    date: string;
};

export default function Income() {
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
        <View style={styles.incomeItem}>
            <Text style={styles.amount}>${item.amount}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.date}>{item.date}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Income</Text>
            <FlatList
                data={incomeItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
            />
            <TouchableOpacity style={styles.addButton} onPress={addIncome}>
                <Text style={styles.addButtonText}>Add Income</Text>
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
        color: '#ffffff',
    },
    list: {
        flex: 1,
    },
    incomeItem: {
        padding: 15,
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        marginBottom: 10,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00FF00',
    },
    description: {
        fontSize: 16,
        color: '#bbbbbb',
    },
    date: {
        fontSize: 14,
        color: '#888888',
    },
    addButton: {
        backgroundColor: '#007AFF',
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