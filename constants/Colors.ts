import AsyncStorage from '@react-native-async-storage/async-storage';

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export type ColorScheme = 'light' | 'dark';

const THEME_STORAGE_KEY = '@theme_preference';

let currentColorScheme: ColorScheme = 'light';
let colorSchemeChangeCallbacks: ((scheme: ColorScheme) => void)[] = [];

export async function setColorScheme(scheme: ColorScheme) {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
    currentColorScheme = scheme;
    colorSchemeChangeCallbacks.forEach(callback => callback(scheme));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

export async function initializeColorScheme() {
  try {
    const savedScheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedScheme === 'light' || savedScheme === 'dark') {
      currentColorScheme = savedScheme;
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
}

export function subscribeToColorScheme(callback: (scheme: ColorScheme) => void) {
  colorSchemeChangeCallbacks.push(callback);
  return () => {
    colorSchemeChangeCallbacks = colorSchemeChangeCallbacks.filter(cb => cb !== callback);
  };
}

export function getCurrentColorScheme() {
  return currentColorScheme;
}

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#e5e5e5'
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    border: '#333333'
  },
};