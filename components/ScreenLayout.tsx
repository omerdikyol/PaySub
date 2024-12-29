import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from './Themed';
import { useTheme } from './useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

export function ScreenLayout({ children }: ScreenLayoutProps) {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']} // Only apply safe area to top
    >
      <ThemedView style={styles.container}>
        {children}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});