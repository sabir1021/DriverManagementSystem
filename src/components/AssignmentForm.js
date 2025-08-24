import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, Typography } from '../constants/theme';
import Input from './Input';
import Button from './Button';

const AssignmentForm = ({ assignment, onClose }) => {
  const { drivers, vehicles, routes, assignments, categories, addAssignment, updateAssignment } = useApp();
  const isEditing = !!assignment;
  
  const [formData, setFormData] = useState({
    driverId: assignment?.driver_id || '',
    vehicleId: assignment?.vehicle_id || '',
    routeId: assignment?.route_id || '',
    status: assignment?.status || 'assigned',
    notes: assignment?.notes || '',
    categoryId: assignment?.category_id || '', // Add category tracking
  });
  
  // Add the missing errors state
  const [errors, setErrors] = useState({});
  
  const statusOptions = [
    { label: 'Assigned', value: 'assigned' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Completed', value: 'completed' },
  ];
  
  // Add useEffect to update category when route changes
  useEffect(() => {
    if (formData.routeId) {
      const selectedRoute = routes.find(route => route.id === formData.routeId);
      if (selectedRoute && selectedRoute.category_id !== formData.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: selectedRoute.category_id || ''
        }));
      }
    } else {
      // Clear category if no route selected
      setFormData(prev => ({
        ...prev,
        categoryId: ''
      }));
    }
  }, [formData.routeId, routes]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.driverId) {
      newErrors.driverId = 'Driver is required';
    }
    
    if (!formData.vehicleId && !formData.routeId) {
      newErrors.general = 'Either vehicle or route must be assigned';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }
    
    const assignmentData = {
      driver_id: formData.driverId,
      vehicle_id: formData.vehicleId || null,
      route_id: formData.routeId || null,
      status: formData.status,
      notes: formData.notes?.trim() || null,
      category_id: formData.categoryId || null, // Include category_id
    };
    
    if (isEditing) {
      assignmentData.id = assignment.id;
      assignmentData.updated_at = new Date().toISOString();
    }
    
    try {
      if (isEditing) {
        await updateAssignment(assignmentData);
        Alert.alert('Success', 'Assignment updated successfully!');
      } else {
        await addAssignment(assignmentData);
        Alert.alert('Success', 'Assignment created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} assignment. Please try again.\n\nError: ${errorMessage}`);
    }
  };
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  // Get selected route for category display
  const selectedRoute = routes.find(route => route.id === formData.routeId);
  const selectedCategory = selectedRoute && selectedRoute.category_id 
    ? categories.find(cat => cat.id === selectedRoute.category_id)
    : null;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
        </Text>
      </View>
      
      <View style={styles.form}>
        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}
        
        {/* Driver Picker - unchanged */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Driver *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.driverId}
              onValueChange={(value) => updateField('driverId', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a driver" value="" />
              {drivers.map((driver) => (
                <Picker.Item 
                  key={driver.id} 
                  label={`${driver.first_name} ${driver.last_name}`} 
                  value={driver.id} 
                />
              ))}
            </Picker>
          </View>
          {errors.driverId && <Text style={styles.errorText}>{errors.driverId}</Text>}
        </View>
        
        {/* Vehicle Picker - unchanged */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Vehicle</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.vehicleId}
              onValueChange={(value) => updateField('vehicleId', value)}
              style={styles.picker}
            >
              <Picker.Item label="No vehicle assigned" value="" />
              {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                <Picker.Item 
                  key={vehicle.id} 
                  label={`${vehicle.vehicle_number} (${vehicle.type})`} 
                  value={vehicle.id} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Route Picker - with category inheritance */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Route</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.routeId}
              onValueChange={(value) => updateField('routeId', value)}
              style={styles.picker}
            >
              <Picker.Item label="No route assigned" value="" />
              {routes.filter(route => {
                const isAlreadyAssigned = assignments.some(assignmentItem => 
                  assignmentItem.route_id === route.id && 
                  assignmentItem.status === 'active' &&
                  (!isEditing || assignmentItem.id !== assignment?.id)
                );
                
                return !isAlreadyAssigned;
              }).map((route) => {
                // Get category name for this route
                const category = route.category_id 
                  ? categories.find(cat => cat.id === route.category_id)
                  : null;
                const categoryName = category ? category.name : 'No Category';
                
                return (
                  <Picker.Item 
                    key={route.id} 
                    label={`${route.route_name} (${categoryName})`} 
                    value={route.id} 
                  />
                );
              })}
            </Picker>
          </View>
          {/* Show inherited category */}
          {selectedCategory && (
            <Text style={styles.categoryInfo}>
              Category will be inherited from route: {selectedCategory.name}
            </Text>
          )}
        </View>
        
        {/* Status Picker - unchanged */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Status</Text>
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
          placeholder="Additional notes about this assignment..."
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
            title={isEditing ? 'Update Assignment' : 'Create Assignment'}
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
    ...Typography.label,
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
  dateTimeSection: {
    marginBottom: Spacing.lg,
  },
  dateTimeContainer: {
    marginBottom: Spacing.md,
  },
  dateTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
  },
  quickButtonText: {
    color: Colors.surface,
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.small,
    marginTop: Spacing.xs,
  },
  categoryInfo: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});

export default AssignmentForm;