import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import RouteList from '../../components/RouteList';
import RouteForm from '../../components/RouteForm';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader';
import { Colors, Spacing } from '../../constants/theme';

const RoutesScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowForm(true);
  };
  
  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoute(null);
  };
  
  return (
    <View style={styles.container}>
      <AppHeader title="Routes" showCategoryFilter={true} />
      
      <View style={styles.header}>
        <Button
          title="+ Add Route"
          onPress={handleAddRoute}
          style={styles.addButton}
        />
      </View>
      
      <RouteList
        onAddRoute={handleAddRoute}
        onEditRoute={handleEditRoute}
      />
      
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <RouteForm
          route={editingRoute}
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

export default RoutesScreen;