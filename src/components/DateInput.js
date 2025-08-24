import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskInput, { Masks } from 'react-native-mask-input';
import { Colors } from '../constants/theme';

const DateInput = ({ label, value, onChangeText, placeholder = "MM-DD-YYYY", error }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <MaskInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        mask={Masks.DATE_MMDDYYYY}
        value={value}
        onChangeText={(masked, unmasked) => {
          onChangeText(masked);
        }}
        keyboardType="numeric"
        placeholderTextColor={Colors.textSecondary}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

export default DateInput;