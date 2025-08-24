import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const RouteForm = ({ route = null, onClose }) => {
  const { addRoute, updateRoute, categories } = useApp();
  const [formData, setFormData] = useState({
    routeName: route?.route_name || '',
    categoryId: route?.category_id || '',
    amCheckInTime: route?.route_type === 'AM' ? route?.check_in_time || '' : '',
    pmCheckInTime: route?.route_type === 'PM' ? route?.check_in_time || '' : '',
    stops: route?.stops ? (Array.isArray(route.stops) ? route.stops.join(', ') : route.stops) : '',
    distance: route?.distance || '',
    estimatedTime: route?.estimated_time || '',
    schoolName: route?.school_name || '',
    notes: route?.notes || '',
  });
  
  const [errors, setErrors] = useState({});
  
  // Add utility functions
  const processStops = (stopsString) => {
    if (!stopsString || !stopsString.trim()) {
      return [];
    }
    return stopsString.split(',').map(stop => stop.trim()).filter(stop => stop.length > 0);
  };
  
  const processNumericField = (value) => {
    if (!value || !value.toString().trim()) {
      return null;
    }
    const numericValue = parseFloat(value.toString().trim());
    return isNaN(numericValue) ? null : numericValue;
  };

  // Generate time options with 15-minute increments
  const generateTimeOptions = () => {
    const times = [{ label: 'Select time or enter manually', value: '' }];
    
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour}:${minute.toString().padStart(2, '0')}`;
        times.push({
          label: `${timeString} AM`,
          value: `${timeString} AM`
        });
        times.push({
          label: `${timeString} PM`,
          value: `${timeString} PM`
        });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.routeName.trim()) {
      newErrors.routeName = 'Route name is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    // When editing an existing route, only validate the relevant time field
    if (route) {
      // Editing mode - only validate the time field for the current route type
      if (route.route_type === 'AM' && !formData.amCheckInTime.trim()) {
        newErrors.amCheckInTime = 'AM check-in time is required';
      }
      if (route.route_type === 'PM' && !formData.pmCheckInTime.trim()) {
        newErrors.pmCheckInTime = 'PM check-in time is required';
      }
    } else {
      // Creating new routes - require both times
      if (!formData.amCheckInTime.trim()) {
        newErrors.amCheckInTime = 'AM check-in time is required';
      }
      if (!formData.pmCheckInTime.trim()) {
        newErrors.pmCheckInTime = 'PM check-in time is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setErrors({});
      
      if (route) {
        // Add debugging and safety check
        console.log('Route object received:', route);
        console.log('Route ID:', route.id);
        
        if (!route.id) {
          Alert.alert('Error', 'Cannot update route: Route ID is missing');
          return;
        }
        
        const routeData = {
          route_name: formData.routeName,
          category_id: formData.categoryId,
          check_in_time: route.route_type === 'AM' ? formData.amCheckInTime : formData.pmCheckInTime,
          stops: processStops(formData.stops),
          distance: processNumericField(formData.distance),
          estimated_time: processNumericField(formData.estimatedTime),
          school_name: formData.schoolName,
          notes: formData.notes,
        };
        
        console.log('Route data being sent:', routeData);
        await updateRoute(route.id, routeData);
        Alert.alert('Success', 'Route updated successfully!');
      } else {
        // Create new routes (AM and PM)
        const baseRouteData = {
          route_name: formData.routeName,
          category_id: formData.categoryId,
          stops: processStops(formData.stops),
          distance: processNumericField(formData.distance),
          estimated_time: processNumericField(formData.estimatedTime),
          school_name: formData.schoolName,
          notes: formData.notes,
        };
        
        // Create AM route
        const amRouteData = {
          ...baseRouteData,
          route_type: 'AM',
          check_in_time: formData.amCheckInTime,
        };
        
        // Create PM route
        const pmRouteData = {
          ...baseRouteData,
          route_type: 'PM',
          check_in_time: formData.pmCheckInTime,
        };
        
        await addRoute(amRouteData);
        await addRoute(pmRouteData);
        Alert.alert('Success', 'Routes created successfully!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert('Error', `Failed to save route. Please try again.\n\nError: ${error.message}`);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route ? 'Edit Route' : 'Add New Route'}
        </Text>
      </View>
      
      <ScrollView style={styles.form}>
        <Input
          label="Route Number *"
          value={formData.routeName}
          onChangeText={(value) => updateField('routeName', value)}
          placeholder="e.g., 101"
          error={errors.routeName}
        />
        
        {/* Add Category Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category *</Text>
          <View style={[styles.pickerWrapper, errors.categoryId && styles.pickerError]}>
            <Picker
              selectedValue={formData.categoryId}
              onValueChange={(value) => updateField('categoryId', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a category" value="" />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
          {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
        </View>
        
        <View style={styles.row}>
          <View style={[styles.pickerContainer, styles.halfInput]}>
            <Text style={styles.pickerLabel}>AM Check-in Time *</Text>
            <View style={[styles.pickerWrapper, errors.amCheckInTime && styles.pickerError]}>
              <Picker
                selectedValue={formData.amCheckInTime}
                onValueChange={(value) => updateField('amCheckInTime', value)}
                style={styles.picker}
              >
                {timeOptions.filter(option => option.value === '' || option.value.includes('AM')).map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
            {formData.amCheckInTime === '' && (
              <Input
                value={formData.amCheckInTime}
                onChangeText={(value) => updateField('amCheckInTime', value)}
                placeholder="e.g., 7:30 AM"
                style={styles.manualInput}
              />
            )}
            {errors.amCheckInTime && <Text style={styles.errorText}>{errors.amCheckInTime}</Text>}
          </View>
          
          <View style={[styles.pickerContainer, styles.halfInput]}>
            <Text style={styles.pickerLabel}>PM Check-in Time *</Text>
            <View style={[styles.pickerWrapper, errors.pmCheckInTime && styles.pickerError]}>
              <Picker
                selectedValue={formData.pmCheckInTime}
                onValueChange={(value) => updateField('pmCheckInTime', value)}
                style={styles.picker}
              >
                {timeOptions.filter(option => option.value === '' || option.value.includes('PM')).map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
            {formData.pmCheckInTime === '' && (
              <Input
                value={formData.pmCheckInTime}
                onChangeText={(value) => updateField('pmCheckInTime', value)}
                placeholder="e.g., 2:30 PM"
                style={styles.manualInput}
              />
            )}
            {errors.pmCheckInTime && <Text style={styles.errorText}>{errors.pmCheckInTime}</Text>}
          </View>
        </View>
        
        <Input
          label="School Name"
          value={formData.schoolName}
          onChangeText={(value) => updateField('schoolName', value)}
          placeholder="e.g., Springfield Elementary"
        />
        
        <Input
          label="Stops (comma-separated)"
          value={formData.stops}
          onChangeText={(value) => updateField('stops', value)}
          placeholder="e.g., Mall, Hospital, University"
          multiline
          numberOfLines={2}
        />
        
        <View style={styles.row}>
          <Input
            label="Distance (km)"
            value={formData.distance}
            onChangeText={(value) => updateField('distance', value)}
            placeholder="e.g., 25.5"
            keyboardType="numeric"
            error={errors.distance}
            style={styles.halfInput}
          />
          <Input
            label="Estimated Time (minutes)"
            value={formData.estimatedTime}
            onChangeText={(value) => updateField('estimatedTime', value)}
            placeholder="e.g., 45"
            keyboardType="numeric"
            error={errors.estimatedTime}
            style={styles.halfInput}
          />
        </View>
        
        {/* Removed status picker section */}
        
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={route ? 'Update Route' : 'Add Route'}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
  },
  form: {
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    marginBottom: Spacing.lg,
  },
  pickerLabel: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  pickerError: {
    borderColor: Colors.error,
  },
  picker: {
    height: 50,
  },
  manualInput: {
    marginTop: Spacing.xs,
    marginBottom: 0,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default RouteForm;