/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Text as RNText, View as RNView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useTheme } from './useTheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedView({ style, ...props }) {
  const { colors } = useTheme();
  return <RNView style={[{ backgroundColor: colors.background }, style]} {...props} />;
}

export function ThemedText({ style, ...props }) {
  const { colors } = useTheme();
  return <RNText style={[{ color: colors.text }, style]} {...props} />;
}

export function ThemedCard({ style, ...props }) {
  const { colors } = useTheme();
  return (
    <RNView 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.surface,
          shadowColor: colors.card.shadow 
        }, 
        style
      ]} 
      {...props} 
    />
  );
}

export function ThemedButton({ style, textStyle, ...props }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { backgroundColor: colors.accent },
        style
      ]} 
      {...props}
    >
      <RNText style={[styles.buttonText, textStyle]}>
        {props.children}
      </RNText>
    </TouchableOpacity>
  );
}

export function ThemedSection({ style, ...props }) {
  const { colors } = useTheme();
  return (
    <RNView 
      style={[
        styles.section, 
        { 
          backgroundColor: colors.card.background,
          shadowColor: colors.card.shadow,
          borderColor: colors.border
        }, 
        style
      ]} 
      {...props} 
    />
  );
}

interface ThemedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  style?: any;
}

export function ThemedInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  style 
}: ThemedInputProps) {
  const { colors } = useTheme();

  return (
    <RNView style={styles.inputContainer}>
      <RNText style={[styles.label, { color: colors.text }]}>{label}</RNText>
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text,
            backgroundColor: colors.card.background,
            borderColor: colors.border
          },
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
