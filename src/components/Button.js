import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  style,
  ...props 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  
  // Sizes
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  large: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.surface,
  },
  secondaryText: {
    color: Colors.text,
  },
  dangerText: {
    color: Colors.surface,
  },
  
  smallText: {
    ...Typography.caption,
  },
  mediumText: {
    ...Typography.body,
  },
  largeText: {
    ...Typography.h3,
  },
  
  disabled: {
    opacity: 0.5,
  },
});

export default Button;