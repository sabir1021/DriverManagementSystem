import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import AppHeader from '../../components/AppHeader';
import AssignmentForm from '../../components/AssignmentForm';
import Button from '../../components/Button';

const AssignmentsScreen = () => {
  const { assignments, drivers, vehicles, routes, categories, deleteAssignment, getFilteredAssignments } = useApp(); // Add categories
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    // Use the same pattern as other screens
    const confirmed = window.confirm(
      'Are you sure you want to delete this assignment? This action cannot be undone.'
    );
    
    if (confirmed) {
      console.log('Delete confirmed for assignment:', id);
      deleteAssignment(id); // Let the context handle success/error alerts
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver';
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'No Vehicle';
    
    const make = vehicle.make || '';
    const model = vehicle.model || '';
    const vehicleNumber = vehicle.vehicle_number || '';
    
    // Build the display string, filtering out empty parts
    const parts = [make, model].filter(part => part.trim()).join(' ');
    return parts ? `${parts} (${vehicleNumber})` : `Vehicle ${vehicleNumber}`;
  };

  const getVehicleIcon = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'car';
    
    switch (vehicle.type) {
      case 'bus':
        return 'bus';
      case 'mini-bus':
        return 'bus-alt';
      case 'van':
        return 'shipping-fast';
      case 'type-iii':
        return 'car';
      case 'truck':
        return 'truck';
      default:
        return 'car';
    }
  };

  const getVehicleIconColor = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return Colors.primary;
    
    switch (vehicle.type) {
      case 'bus':
        return '#FF6B35';
      case 'mini-bus':
        return '#F7931E';
      case 'van':
        return '#4A90E2';
      case 'type-iii':
        return '#7ED321';
      case 'truck':
        return '#BD10E0';
      default:
        return Colors.primary;
    }
  };
  const getRouteInfo = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.route_name : 'No Route';
  };

  // Add helper function to get category name for assignment
  const getCategoryInfo = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment || !assignment.route_id) return 'No Category';
    
    const route = routes.find(r => r.id === assignment.route_id);
    if (!route || !route.category_id) return 'No Category';
    
    const category = categories.find(c => c.id === route.category_id);
    return category ? category.name : 'No Category';
  };

  // Use filtered assignments from context instead of all assignments
  const contextFilteredAssignments = getFilteredAssignments();
  
  // Filter assignments based on search query
  const filteredAssignments = contextFilteredAssignments.filter(assignment => {
    if (!searchQuery.trim()) return true;
    
    const driverName = getDriverName(assignment.driver_id).toLowerCase();
    const vehicleInfo = getVehicleInfo(assignment.vehicle_id).toLowerCase();
    const routeInfo = getRouteInfo(assignment.route_id).toLowerCase();
    const status = assignment.status.toLowerCase();
    const notes = assignment.notes ? assignment.notes.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    
    return driverName.includes(query) || 
           vehicleInfo.includes(query) || 
           routeInfo.includes(query) || 
           status.includes(query) || 
           notes.includes(query);
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Assignments" showCategoryFilter={true} />
      
      <View style={styles.header}>
        <Button
          title="+ Add Assignment"
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assignments..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No assignments found' : 'No assignments yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() ? 'Try adjusting your search terms' : 'Tap the + button to create your first assignment'}
            </Text>
          </View>
        ) : (
          filteredAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.cardRow}>
                {/* Driver Name */}
                <View style={styles.columnPrimary}>
                  <Text style={styles.driverName}>
                    {getDriverName(assignment.driver_id)}
                  </Text>
                  <Text style={styles.assignmentRole}>Assignment</Text>
                </View>
                
                {/* Vehicle Info */}
                <View style={styles.columnSecondary}>
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <View style={styles.vehicleIconContainer}>
                    <FontAwesome5 
                      name={getVehicleIcon(assignment.vehicle_id)} 
                      size={20} 
                      color={getVehicleIconColor(assignment.vehicle_id)} 
                      solid
                    />
                    <Text style={styles.vehicleNumber}>
                      {vehicles.find(v => v.id === assignment.vehicle_id)?.vehicle_number || 'N/A'}
                    </Text>
                  </View>
                </View>
                
                {/* Route Info */}
                <View style={styles.columnSecondary}>
                  <Text style={styles.detailLabel}>Route</Text>
                  <Text style={styles.detailValue}>
                    {assignment.route_id ? getRouteInfo(assignment.route_id) : 'No Route'}
                  </Text>
                </View>
                
                {/* Category Info - CHANGED FROM DURATION */}
                <View style={styles.columnSecondary}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>
                    {getCategoryInfo(assignment.id)}
                  </Text>
                </View>
                
                {/* Status */}
                <View style={styles.columnStatus}>
                  <View style={[styles.statusBadge, styles[`status${assignment.status}`]]}>
                    <Text style={styles.statusText}>{assignment.status}</Text>
                  </View>
                </View>
                
                {/* Actions */}
                <View style={styles.columnActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(assignment)}>
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(assignment.id)}>
                    <Ionicons name="trash" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Notes row (if exists) */}
              {assignment.notes && (
                <View style={styles.notesRow}>
                  <Text style={styles.notesLabel}>Notes: </Text>
                  <Text style={styles.notesText} numberOfLines={2}>{assignment.notes}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AssignmentForm
          assignment={editingAssignment}
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
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.h3,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    textAlign: 'center',
  },
  assignmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnPrimary: {
    flex: 2,
    paddingRight: Spacing.sm,
  },
  columnSecondary: {
    flex: 1.5,
    paddingHorizontal: Spacing.xs,
  },
  columnStatus: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  columnActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
  },
  driverName: {
    ...Typography.h3,
    flex: 1,
  },
  assignmentRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.body,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusactive: {
    backgroundColor: Colors.success + '20',
  },
  statusinactive: {
    backgroundColor: Colors.textSecondary + '20',
  },
  // Updated status styles for new values
  statusassigned: {
    backgroundColor: Colors.primary + '20',
  },
  statusaccepted: {
    backgroundColor: Colors.success + '20', 
  },
  statuscompleted: {
    backgroundColor: Colors.textSecondary + '20',
  },
  // Removed old status styles (statusactive, statusinactive, statuscancelled)
  statuscancelled: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notesRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  notesText: {
    ...Typography.caption,
    flex: 1,
  },
  assignmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  vehicleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vehicleNumber: {
    ...Typography.body,
    fontWeight: '500',
  },
});

export default AssignmentsScreen;