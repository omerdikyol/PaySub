/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Text as RNText, View as RNView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useTheme } from './useTheme';
import { fonts, fontConfig, fontSizes } from '@/constants/Fonts';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'] & {
  variant?: keyof typeof fontConfig;
  size?: keyof typeof fontSizes;
};

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
  const { style, lightColor, darkColor, variant = 'body', size = 'md', ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <DefaultText 
      style={[
        { 
          color,
          fontFamily: fontConfig[variant],
          fontSize: fontSizes[size],
        }, 
        style
      ]} 
      {...otherProps} 
    />
  );
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

export function ThemedText({ style, variant = 'body', size = 'md', ...props }) {
  const { colors } = useTheme();
  return (
    <RNText 
      style={[
        { 
          color: colors.text,
          fontFamily: fontConfig[variant],
          fontSize: fontSizes[size],
        }, 
        style
      ]} 
      {...props} 
    />
  );
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

export function ThemedButton({ style, textStyle, variant = 'button', size = 'md', ...props }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.primary,
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}
    >
      <ThemedText
        style={[
          {
            color: '#fff',
            fontFamily: fontConfig[variant],
            fontSize: fontSizes[size],
          },
          textStyle,
        ]}
      >
        {props.children}
      </ThemedText>
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
    <View style={styles.inputContainer}>
      <ThemedText variant="caption" size="sm" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.text + '80'}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: 'transparent',
            borderColor: colors.border,
            borderWidth: 1,
            fontFamily: fontConfig.input,
            fontSize: fontSizes.md,
          },
          style,
        ]}
      />
    </View>
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
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});
