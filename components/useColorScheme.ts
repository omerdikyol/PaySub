import { useState, useEffect } from 'react';
import { subscribeToColorScheme, getCurrentColorScheme } from '@/constants/Colors';

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState(getCurrentColorScheme());

  useEffect(() => {
    return subscribeToColorScheme(setColorScheme);
  }, []);

  return colorScheme;
}