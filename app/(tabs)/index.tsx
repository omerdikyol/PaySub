import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[styles.container, {
      backgroundColor: Colors[colorScheme].background
    }]}>
      <Text style={[styles.title, {
        color: Colors[colorScheme].text
      }]}>Dashboard</Text>
      
      <View style={styles.cards}>
        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
          shadowColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        }]}>
          <Text style={[styles.cardTitle, {
            color: colorScheme === 'dark' ? '#888' : '#666'
          }]}>Total Balance</Text>
          <Text style={[styles.amount, {
            color: Colors[colorScheme].text
          }]}>$1,234.56</Text>
        </View>

        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
          shadowColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        }]}>
          <Text style={[styles.cardTitle, {
            color: colorScheme === 'dark' ? '#888' : '#666'
          }]}>Monthly Income</Text>
          <Text style={[styles.amount, {
            color: Colors[colorScheme].text
          }]}>$2,345.67</Text>
        </View>

        <View style={[styles.card, {
          backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
          shadowColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        }]}>
          <Text style={[styles.cardTitle, {
            color: colorScheme === 'dark' ? '#888' : '#666'
          }]}>Monthly Expenses</Text>
          <Text style={[styles.amount, {
            color: Colors[colorScheme].text
          }]}>$1,111.11</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cards: {
    gap: 15,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
});