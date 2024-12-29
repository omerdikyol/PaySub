import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Income</Text>
          <Text style={styles.amount}>$5,240</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Expenses</Text>
          <Text style={styles.amount}>$3,167</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={styles.amount}>$2,073</Text>
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
});
