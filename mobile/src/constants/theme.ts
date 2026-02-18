import { useColorScheme } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../constants';

export type Theme = typeof lightTheme;

export const lightTheme = {
  colors: COLORS.light,
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  isDark: false,
};

export const darkTheme = {
  colors: COLORS.dark,
  fonts: FONTS,
  fontSizes: FONT_SIZES,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  isDark: true,
};

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};
