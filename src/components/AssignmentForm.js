import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../context/AppContext';
import { Colors, Spacing, Typography } from '../constants/theme';
import Input from './Input';
import Button from './Button';

const AssignmentForm = ({ assignment, onClose }) => {
  const { drivers, vehicles, routes, assignments, addAssignment, updateAssignment } = useApp();
  const isEditing = !!assignment;
  
  // Helper function to format datetime for display
  const formatDateTimeForDisplay = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  };
  
  // Helper function to get current datetime in local timezone
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
  };
  
  const [formData, setFormData] = useState({
    driverId: assignment?.driver_id || '',
    vehicleId: assignment?.vehicle_id || '',
    routeId: assignment?.route_id || '',
    startDateTime: formatDateTimeForDisplay(assignment?.start_date) || '',
    endDateTime: formatDateTimeForDisplay(assignment?.end_date) || '',
    status: assignment?.status || 'active',
    priority: assignment?.priority?.toString() || '1',
    notes: assignment?.notes || '',
  });
  
  const [errors, setErrors] = useState({});
  
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];
  
  const priorityOptions = [
    { label: 'Low (1)', value: '1' },
    { label: 'Normal (2)', value: '2' },
    { label: 'Medium (3)', value: '3' },
    { label: 'High (4)', value: '4' },
    { label: 'Critical (5)', value: '5' },
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.driverId) {
      newErrors.driverId = 'Driver is required';
    }
    
    if (!formData.vehicleId && !formData.routeId) {
      newErrors.general = 'Either vehicle or route must be assigned';
    }
    
    if (formData.startDateTime && formData.endDateTime && new Date(formData.startDateTime) > new Date(formData.endDateTime)) {
      newErrors.endDateTime = 'End date/time must be after start date/time';
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
      start_date: formData.startDateTime ? new Date(formData.startDateTime).toISOString() : null,
      end_date: formData.endDateTime ? new Date(formData.endDateTime).toISOString() : null,
      status: formData.status,
      priority: parseInt(formData.priority),
      notes: formData.notes?.trim() || null,
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
  
  // Quick set functions for common datetime scenarios
  const setStartToNow = () => {
    updateField('startDateTime', getCurrentDateTime());
  };
  
  const setEndToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const offset = tomorrow.getTimezoneOffset() * 60000;
    const localTime = new Date(tomorrow.getTime() - offset);
    updateField('endDateTime', localTime.toISOString().slice(0, 16));
  };
  
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
                // Only show active routes that aren't already assigned to an active assignment
                if (route.status !== 'active') return false;
                
                const isAlreadyAssigned = assignments.some(assignmentItem => 
                  assignmentItem.route_id === route.id && 
                  assignmentItem.status === 'active' &&
                  (!isEditing || assignmentItem.id !== assignment?.id)
                );
                
                return !isAlreadyAssigned;
              }).map((route) => (
                <Picker.Item 
                  key={route.id} 
                  label={route.route_name} 
                  value={route.id} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Simple DateTime Inputs */}
        <View style={styles.dateTimeSection}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeHeader}>
              <Text style={styles.pickerLabel}>Start Date & Time</Text>
              <TouchableOpacity onPress={setStartToNow} style={styles.quickButton}>
                <Text style={styles.quickButtonText}>Now</Text>
              </TouchableOpacity>
            </View>
            <Input
              value={formData.startDateTime}
              onChangeText={(value) => updateField('startDateTime', value)}
              placeholder="YYYY-MM-DDTHH:MM"
              helperText="Format: 2024-01-15T14:30"
            />
          </View>
          
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeHeader}>
              <Text style={styles.pickerLabel}>End Date & Time</Text>
              <TouchableOpacity onPress={setEndToTomorrow} style={styles.quickButton}>
                <Text style={styles.quickButtonText}>Tomorrow</Text>
              </TouchableOpacity>
            </View>
            <Input
              value={formData.endDateTime}
              onChangeText={(value) => updateField('endDateTime', value)}
              placeholder="YYYY-MM-DDTHH:MM"
              helperText="Format: 2024-01-15T14:30"
              error={errors.endDateTime}
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
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
          
          <View style={styles.halfInput}>
            <Text style={styles.pickerLabel}>Priority</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.priority}
                onValueChange={(value) => updateField('priority', value)}
                style={styles.picker}
              >
                {priorityOptions.map((priority) => (
                  <Picker.Item key={priority.value} label={priority.label} value={priority.value} />
                ))}
              </Picker>
            </View>
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
});

export default AssignmentForm;