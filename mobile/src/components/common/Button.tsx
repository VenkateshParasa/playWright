import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const buttonStyle: ViewStyle = {
    backgroundColor:
      variant === 'primary'
        ? theme.colors.primary
        : variant === 'secondary'
        ? theme.colors.secondary
        : variant === 'outline'
        ? 'transparent'
        : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
    paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
    paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 24 : 32,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const textColor =
    variant === 'primary' || variant === 'secondary'
      ? '#fff'
      : variant === 'outline'
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
  },
});
