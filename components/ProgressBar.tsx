import { StyleSheet, View, ViewStyle } from 'react-native';
import React, { useEffect } from 'react';
import { useTheme } from './useTheme';
import Animated, { 
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  color?: string;
  style?: ViewStyle;
  height?: number;
}

export function ProgressBar({ 
  progress, 
  color, 
  style, 
  height = 8 
}: ProgressBarProps) {
  const { colors } = useTheme();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { height }, style]}>
      <Animated.View
        style={[
          styles.progress,
          { backgroundColor: color || colors.primary },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});
