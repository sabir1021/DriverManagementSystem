import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import VehicleList from '../../components/VehicleList';
import VehicleForm from '../../components/VehicleForm';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing } from '../../constants/theme';

const VehiclesScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };
  
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };
  
  return (
    <View style={styles.container}>
      <AppHeader title="Vehicles" />
      
      <View style={styles.header}>
        <Button
          title="+ Add Vehicle"
          onPress={handleAddVehicle}
          style={styles.addButton}
        />
      </View>
      
      <VehicleList
        onAddVehicle={handleAddVehicle}
        onEditVehicle={handleEditVehicle}
      />
      
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleCloseForm}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'flex-end',
  },
  addButton: {
    minWidth: 120,
  },
});

export default VehiclesScreen;