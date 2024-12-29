import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView, ThemedText, ThemedCard } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { ScreenLayout } from '@/components/ScreenLayout';

export default function TabOneScreen() {
  const { colors } = useTheme();
  
  return (
    <ScreenLayout>
      <ThemedText style={styles.title}>Dashboard</ThemedText>
      
      <View style={styles.cards}>
        <ThemedCard>
          <ThemedText style={[styles.cardTitle, { color: colors.card.title }]}>
            Total Balance
          </ThemedText>
          <ThemedText style={styles.amount}>$1,234.56</ThemedText>
        </ThemedCard>

        <ThemedCard>
          <ThemedText style={[styles.cardTitle, { color: colors.card.title }]}>
            Monthly Income
          </ThemedText>
          <ThemedText style={styles.amount}>$2,345.67</ThemedText>
        </ThemedCard>

        <ThemedCard>
          <ThemedText style={[styles.cardTitle, { color: colors.card.title }]}>
            Monthly Expenses
          </ThemedText>
          <ThemedText style={styles.amount}>$1,111.11</ThemedText>
        </ThemedCard>
      </View>
    </ScreenLayout>
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
  cardTitle: {
    fontSize: 16,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
});