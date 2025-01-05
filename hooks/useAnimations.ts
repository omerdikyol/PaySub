import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = (duration = 300, delay = 0) => {
    return Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });
  };

  const scaleIn = (duration = 300, delay = 0) => {
    return Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    });
  };

  const slideUp = (duration = 300, delay = 0) => {
    return Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    });
  };

  const spin = (duration = 1000) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(spinAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const combinedAnimation = (duration = 300, delay = 0) => {
    return Animated.parallel([
      fadeIn(duration, delay),
      scaleIn(duration, delay),
      slideUp(duration, delay),
    ]);
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    slideAnim.setValue(20);
  };

  const getSpinInterpolation = () => {
    return spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  };

  return {
    fadeAnim,
    scaleAnim,
    slideAnim,
    spinAnim,
    fadeIn,
    scaleIn,
    slideUp,
    spin,
    combinedAnimation,
    resetAnimations,
    getSpinInterpolation,
  };
}; 