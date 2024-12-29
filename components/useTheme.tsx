import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  return {
    colors: Colors[colorScheme],
    colorScheme
  };
}