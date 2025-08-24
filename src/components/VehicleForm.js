import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const VehicleForm = ({ vehicle = null, onClose }) => {
  const { addVehicle, updateVehicle } = useApp();
  const isEditing = !!vehicle;
  
  const [formData, setFormData] = useState({
    vehicleNumber: vehicle?.vehicle_number || '',
    type: vehicle?.type || 'bus',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    licensePlate: vehicle?.license_plate || '',
    status: vehicle?.status || 'available',
    notes: vehicle?.notes || '',
  });
  
  const [errors, setErrors] = useState({});
  
  const vehicleTypes = [
    { label: 'Bus', value: 'bus' },
    { label: 'Mini Bus', value: 'mini-bus' },
    { label: 'Van', value: 'van' },
    { label: 'Type III', value: 'type-iii' },
    { label: 'Truck', value: 'truck' },
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleNumber?.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }
    
    if (!formData.type?.trim()) {
      newErrors.type = 'Vehicle type is required';
    }
    
    // Fix: Check year properly without calling trim() on numbers
    if (formData.year && (isNaN(formData.year) || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update the handleSubmit function to be async and handle errors properly
  const handleSubmit = async () => {
    console.log('=== VEHICLE FORM DEBUG ===');
    console.log('isEditing:', isEditing);
    console.log('vehicle prop:', vehicle);
    console.log('formData:', formData);
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }
    
    const vehicleData = {
      vehicle_number: formData.vehicleNumber?.trim() || '',
      type: formData.type?.trim() || '',
      make: formData.make?.trim() || null,
      model: formData.model?.trim() || null,
      year: formData.year ? parseInt(formData.year) : null,
      license_plate: formData.licensePlate?.trim() || null,
      status: formData.status || 'available',
      notes: formData.notes?.trim() || null,
    };
    
    if (isEditing) {
      vehicleData.id = vehicle?.id;
      vehicleData.updated_at = new Date().toISOString();
    }
    
    console.log('Vehicle data to submit:', vehicleData);
    
    try {
      if (isEditing) {
        console.log('Calling updateVehicle with:', vehicleData);
        const result = await updateVehicle(vehicleData);
        console.log('updateVehicle result:', result);
        Alert.alert('Success', 'Vehicle updated successfully!');
      } else {
        console.log('Calling addVehicle with:', vehicleData);
        const result = await addVehicle(vehicleData);
        console.log('addVehicle result:', result);
        Alert.alert('Success', 'Vehicle added successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} vehicle. Please try again.\n\nError: ${error.message}`);
    }
  };
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const getCapacityLabel = () => {
    switch (formData.type) {
      case 'bus':
      case 'van':
        return 'Passenger Capacity *';
      case 'truck':
      case 'pickup':
        return 'Cargo Capacity (tons) *';
      case 'motorcycle':
        return 'Passenger Capacity *';
      default:
        return 'Capacity *';
    }
  };
  
  const getCapacityPlaceholder = () => {
    switch (formData.type) {
      case 'bus':
      case 'van':
        return 'Number of passengers';
      case 'truck':
      case 'pickup':
        return 'Weight in tons';
      case 'motorcycle':
        return 'Number of passengers';
      case 'car':
      case 'suv':
        return 'Number of passengers';
      default:
        return 'Enter capacity';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.row}>
          <Input
            label="Vehicle Number *"
            value={formData.vehicleNumber}
            onChangeText={(value) => updateField('vehicleNumber', value)}
            placeholder="e.g., VEH-001"
            error={errors.vehicleNumber}
            style={styles.halfInput}
          />
          <View style={styles.halfInput}>
            <Text style={styles.pickerLabel}>Vehicle Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => updateField('type', value)}
                style={styles.picker}
              >
                {vehicleTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        <View style={styles.row}>
          <Input
            label="Make"
            value={formData.make}
            onChangeText={(value) => updateField('make', value)}
            placeholder="e.g., Toyota, Ford, Honda"
            style={styles.halfInput}
          />
          <Input
            label="Model"
            value={formData.model}
            onChangeText={(value) => updateField('model', value)}
            placeholder="e.g., Camry, F-150, Civic"
            style={styles.halfInput}
          />
        </View>
        
        <View style={styles.row}>
          <Input
            label="Year"
            value={formData.year}
            onChangeText={(value) => updateField('year', value)}
            placeholder="e.g., 2020"
            keyboardType="numeric"
            error={errors.year}
            style={styles.halfInput}
          />
          <Input
            label="License Plate"
            value={formData.licensePlate}
            onChangeText={(value) => updateField('licensePlate', value)}
            placeholder="e.g., ABC-123"
            autoCapitalize="characters"
            style={styles.halfInput}
          />
        </View>
        
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Additional notes about the vehicle"
          multiline
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            style={styles.button}
          />
          <Button
            title={isEditing ? 'Update Vehicle' : 'Add Vehicle'}
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
  pickerLabel: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius,
    backgroundColor: Colors.inputBackground,
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

export default VehicleForm;