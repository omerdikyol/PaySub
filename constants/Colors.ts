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

const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#2f95dc',
    secondary: '#4caf50',
    accent: '#007AFF',
    border: '#e5e5e5',
    success: '#008000',
    error: '#d32f2f',
    muted: '#666666',
    card: {
      background: '#ffffff',
      shadow: '#000000',
      title: '#666666',
      subtle: '#f0f0f0'
    }
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    surface: '#1e1e1e',
    primary: '#fff',
    secondary: '#4caf50',
    accent: '#007AFF',
    border: '#333333',
    success: '#00FF00',
    error: '#ff5252',
    muted: '#888888',
    card: {
      background: '#1e1e1e',
      shadow: '#ffffff',
      title: '#888888',
      subtle: '#1a1a1a'
    }
  }
};

export default Colors;