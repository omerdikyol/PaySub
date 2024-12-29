import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

type IncomeItem = {
    id: string;
    amount: number;
    description: string;
    date: string;
};

export default function Income() {
    const colorScheme = useColorScheme();
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
        <View style={[styles.incomeItem, {
            backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5'
        }]}>
            <Text style={[styles.amount, {
                color: colorScheme === 'dark' ? '#00FF00' : '#008000'
            }]}>${item.amount}</Text>
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
            }]}>Income</Text>
            <FlatList
                data={incomeItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
            />
            <TouchableOpacity 
                style={[styles.addButton, {
                    backgroundColor: colorScheme === 'dark' ? '#007AFF' : '#2f95dc'
                }]} 
                onPress={addIncome}
            >
                <Text style={styles.addButtonText}>Add Income</Text>
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