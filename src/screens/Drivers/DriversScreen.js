import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import DriverList from '../../components/DriverList';
import DriverForm from '../../components/DriverForm';
import Button from '../../components/Button';
import { Colors, Spacing } from '../../constants/theme';

const DriversScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  const handleAddDriver = () => {
    setEditingDriver(null);
    setShowForm(true);
  };
  
  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDriver(null);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="+ Add Driver"
          onPress={handleAddDriver}
          style={styles.addButton}
        />
      </View>
      
      <DriverList
        onAddDriver={handleAddDriver}
        onEditDriver={handleEditDriver}
      />
      
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <DriverForm
          driver={editingDriver}
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

export default DriversScreen;