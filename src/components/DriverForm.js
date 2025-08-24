import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Input from './Input';
import DateInput from './DateInput'; // Add this import
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const DriverForm = ({ driver = null, onClose }) => {
  const { addDriver, updateDriver } = useApp();
  const isEditing = !!driver;
  
  const [formData, setFormData] = useState({
    firstName: driver?.first_name || '',
    lastName: driver?.last_name || '',
    licenseNumber: driver?.license_number || '',
    licenseExpiration: driver?.license_expiration || '',
    dotNumber: driver?.dot_number || '',
    dotExpiration: driver?.dot_expiration || '',
    phone: driver?.phone || '',
    email: driver?.email || '',
    address: driver?.address || '',
    emergencyContact: driver?.emergency_contact || '',
    emergencyPhone: driver?.emergency_phone || '',
    notes: driver?.notes || '',
    status: driver?.status || 'active',
  });
  
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }
    
    if (!formData.licenseExpiration.trim()) {
      newErrors.licenseExpiration = 'License expiration date is required';
    }
    
    if (!formData.dotNumber.trim()) {
      newErrors.dotNumber = 'DOT number is required';
    }
    
    if (!formData.dotExpiration.trim()) {
      newErrors.dotExpiration = 'DOT expiration date is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update the handleSubmit function to be async and handle errors properly
  const handleSubmit = async () => {
    console.log('=== DRIVER FORM DEBUG ===');
    console.log('isEditing:', isEditing);
    console.log('driver prop:', driver);
    console.log('formData:', formData);
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }
    
    const driverData = {
      first_name: formData.firstName?.trim() || '',
      last_name: formData.lastName?.trim() || '',
      license_number: formData.licenseNumber?.trim() || '',
      license_expiration: formData.licenseExpiration?.trim() || null,
      dot_number: formData.dotNumber?.trim() || null,
      dot_expiration: formData.dotExpiration?.trim() || null,
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      emergency_contact: formData.emergencyContact?.trim() || null,
      emergency_phone: formData.emergencyPhone?.trim() || null,
      status: formData.status || 'active',
      notes: formData.notes?.trim() || null,
    };
    
    if (isEditing) {
      driverData.id = driver?.id;
      driverData.updated_at = new Date().toISOString();
    }
    
    console.log('Driver data to submit:', driverData);
    
    try {
      if (isEditing) {
        console.log('Calling updateDriver with:', driverData);
        const result = await updateDriver(driverData);
        console.log('updateDriver result:', result);
        Alert.alert('Success', 'Driver updated successfully!');
      } else {
        console.log('Calling addDriver with:', driverData);
        const result = await addDriver(driverData);
        console.log('addDriver result:', result);
        Alert.alert('Success', 'Driver added successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving driver:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} driver. Please try again.\n\nError: ${error.message}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Driver' : 'Add New Driver'}
        </Text>
      </View>
      
      <ScrollView style={styles.form}>
        <View style={styles.row}>
          <Input
            label="First Name *"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            placeholder="Enter first name"
            error={errors.firstName}
            style={styles.halfInput}
          />
          <Input
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            placeholder="Enter last name"
            error={errors.lastName}
            style={styles.halfInput}
          />
        </View>
        
        <View style={styles.row}>
          <Input
            label="License Number *"
            value={formData.licenseNumber}
            onChangeText={(value) => updateField('licenseNumber', value)}
            placeholder="Enter license number"
            error={errors.licenseNumber}
            style={styles.halfInput}
          />
          <DateInput
            label="License Expiration Date *"
            value={formData.licenseExpiration}
            onChangeText={(value) => updateField('licenseExpiration', value)}
            placeholder="MM-DD-YYYY"
            error={errors.licenseExpiration}
            style={styles.halfInput}
          />
        </View>
        
        <View style={styles.row}>
          <Input
            label="DOT Number *"
            value={formData.dotNumber}
            onChangeText={(value) => updateField('dotNumber', value)}
            placeholder="Enter DOT number"
            keyboardType="numeric"
            error={errors.dotNumber}
            style={styles.halfInput}
          />
          <DateInput
            label="DOT Expiration Date *"
            value={formData.dotExpiration}
            onChangeText={(value) => updateField('dotExpiration', value)}
            placeholder="MM-DD-YYYY"
            error={errors.dotExpiration}
            style={styles.halfInput}
          />
        </View>
        
        <View style={styles.row}>
          <Input
            label="Phone Number *"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            error={errors.phone}
            style={styles.halfInput}
          />
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="driver@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.halfInput}
          />
        </View>
        
        <Input
          label="Address"
          value={formData.address}
          onChangeText={(value) => updateField('address', value)}
          placeholder="Enter home address"
          multiline
        />
        
        <View style={styles.row}>
          <Input
            label="Emergency Contact"
            value={formData.emergencyContact}
            onChangeText={(value) => updateField('emergencyContact', value)}
            placeholder="Contact name"
            style={styles.halfInput}
          />
          <Input
            label="Emergency Phone"
            value={formData.emergencyPhone}
            onChangeText={(value) => updateField('emergencyPhone', value)}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            style={styles.halfInput}
          />
        </View>
        
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Additional notes about the driver"
          multiline
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title={isEditing ? 'Update Driver' : 'Add Driver'}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default DriverForm;