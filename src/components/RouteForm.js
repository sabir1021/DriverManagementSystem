import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const RouteForm = ({ route = null, onClose }) => {
  const { addRoute, updateRoute } = useApp();
  const isEditing = !!route;
  
  const [formData, setFormData] = useState({
    routeName: route?.route_name || '',
    startLocation: route?.start_location || '',
    endLocation: route?.end_location || '',
    stops: route?.stops ? route.stops.join(', ') : '',
    distance: route?.distance || '',
    estimatedTime: route?.estimated_time || '',
    status: route?.status || 'active',
    notes: route?.notes || '',
  });
  
  const [errors, setErrors] = useState({});
  
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.routeName.trim()) {
      newErrors.routeName = 'Route name is required';
    }
    
    if (!formData.startLocation.trim()) {
      newErrors.startLocation = 'Start location is required';
    }
    
    if (!formData.endLocation.trim()) {
      newErrors.endLocation = 'End location is required';
    }
    
    if (formData.distance && (isNaN(formData.distance) || parseFloat(formData.distance) <= 0)) {
      newErrors.distance = 'Please enter a valid distance';
    }
    
    if (formData.estimatedTime && (isNaN(formData.estimatedTime) || parseInt(formData.estimatedTime) <= 0)) {
      newErrors.estimatedTime = 'Please enter a valid time in minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    console.log('=== ROUTE FORM DEBUG ===');
    console.log('isEditing:', isEditing);
    console.log('route prop:', route);
    console.log('formData:', formData);
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }
    
    // Convert stops string to array
    const stopsArray = formData.stops
      .split(',')
      .map(stop => stop.trim())
      .filter(stop => stop.length > 0);
    
    // Prepare data for Supabase
    const routeData = {
      route_name: formData.routeName?.trim() || '',
      start_location: formData.startLocation?.trim() || '',
      end_location: formData.endLocation?.trim() || '',
      stops: stopsArray.length > 0 ? stopsArray : null,
      distance: formData.distance ? parseFloat(formData.distance) : null,
      estimated_time: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
      status: formData.status || 'active',
      notes: formData.notes?.trim() || null,
    };
    
    // Add id and timestamps only for editing
    if (isEditing) {
      routeData.id = route?.id;
      routeData.updated_at = new Date().toISOString();
    }
    
    console.log('Route data to submit:', routeData);
    
    try {
      if (isEditing) {
        console.log('Calling updateRoute with:', routeData);
        const result = await updateRoute(routeData);
        console.log('updateRoute result:', result);
        Alert.alert('Success', 'Route updated successfully!');
      } else {
        console.log('Calling addRoute with:', routeData);
        const result = await addRoute(routeData);
        console.log('addRoute result:', result);
        Alert.alert('Success', 'Route added successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving route:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} route. Please try again.\n\nError: ${error.message}`);
    }
  };
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Route' : 'Add New Route'}
        </Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Route Name *"
          value={formData.routeName}
          onChangeText={(value) => updateField('routeName', value)}
          placeholder="e.g., Downtown to Airport"
          error={errors.routeName}
        />
        
        <View style={styles.row}>
          <Input
            label="Start Location *"
            value={formData.startLocation}
            onChangeText={(value) => updateField('startLocation', value)}
            placeholder="e.g., Downtown Terminal"
            error={errors.startLocation}
            style={styles.halfInput}
          />
          <Input
            label="End Location *"
            value={formData.endLocation}
            onChangeText={(value) => updateField('endLocation', value)}
            placeholder="e.g., Airport Terminal"
            error={errors.endLocation}
            style={styles.halfInput}
          />
        </View>
        
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
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Status *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => updateField('status', value)}
              style={styles.picker}
            >
              {statusOptions.map((status) => (
                <Picker.Item key={status.value} label={status.label} value={status.value} />
              ))}
            </Picker>
          </View>
        </View>
        
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Additional information about this route..."
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
            title={isEditing ? 'Update Route' : 'Add Route'}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
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
  picker: {
    height: 50,
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