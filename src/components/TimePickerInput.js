import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

const TimePickerInput = ({ label, value, onTimeChange, error, style, defaultPeriod = 'AM' }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value || '');
  const dropdownRef = useRef(null);

  // Generate time options with 15-minute increments
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour}:${minute.toString().padStart(2, '0')}`;
        times.push({
          time: timeString,
          display: `${timeString} AM`,
          period: 'AM'
        });
        times.push({
          time: timeString,
          display: `${timeString} PM`,
          period: 'PM'
        });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Filter options based on default period for better UX
  const getFilteredOptions = () => {
    const allOptions = timeOptions;
    const preferredOptions = allOptions.filter(option => option.period === defaultPeriod);
    const otherOptions = allOptions.filter(option => option.period !== defaultPeriod);
    return [...preferredOptions, ...otherOptions];
  };

  const filteredOptions = getFilteredOptions();

  const handleTimeSelect = (selectedOption) => {
    setSelectedTime(selectedOption.display);
    onTimeChange(selectedOption.display);
    setIsDropdownVisible(false);
  };

  const displayValue = selectedTime || value || '';

  const renderTimeOption = (item, index) => (
    <TouchableOpacity
      key={`${item.time}-${item.period}-${index}`}
      style={[
        styles.timeOption,
        item.period !== defaultPeriod && styles.alternativePeriod
      ]}
      onPress={() => handleTimeSelect(item)}
    >
      <Text style={[
        styles.timeOptionText,
        item.period !== defaultPeriod && styles.alternativePeriodText
      ]}>
        {item.display}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]} ref={dropdownRef}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Text style={[styles.inputText, !displayValue && styles.placeholder]}>
          {displayValue || 'Select time'}
        </Text>
        <Text style={styles.dropdownArrow}>
          {isDropdownVisible ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <ScrollView 
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {filteredOptions.map((item, index) => renderTimeOption(item, index))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
    zIndex: 1000,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  timeOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  alternativePeriod: {
    backgroundColor: Colors.background,
  },
  timeOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  alternativePeriodText: {
    color: Colors.textSecondary,
  },
});

export default TimePickerInput;