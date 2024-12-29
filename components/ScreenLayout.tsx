import { StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from './Themed';
import { useTheme } from './useTheme';
import { useEffect, useRef } from 'react';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

export function ScreenLayout({ children }: ScreenLayoutProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation after layout is complete
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <Animated.View style={{ flex: 1, opacity }}>
        <ThemedView style={styles.container}>
          {children}
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});