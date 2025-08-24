import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import AssignmentForm from '../../components/AssignmentForm';
import AppHeader from '../../components/AppHeader';

const DashboardScreen = ({ navigation }) => {
  const { 
    drivers, 
    vehicles, 
    routes, 
    assignments, 
    categories, // Add categories to destructuring
    getFilteredAssignments, 
    getFilteredRoutes, 
    getFilteredDrivers, 
    getFilteredVehicles 
  } = useApp();
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  // Use filtered data based on selected category
  const filteredAssignments = getFilteredAssignments();
  const filteredRoutes = getFilteredRoutes();
  const filteredDrivers = getFilteredDrivers();
  const filteredVehicles = getFilteredVehicles();
  
  // Move helper functions inside the component
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
  
  // Calculate stats based on filtered data
  const activeDrivers = filteredDrivers.filter(driver => driver.status === 'active').length;
  const totalVehicles = filteredVehicles.length;
  const availableVehicles = filteredVehicles.filter(vehicle => vehicle.status === 'available').length;
  const activeAssignments = filteredAssignments.filter(assignment => 
    assignment.status === 'assigned' || assignment.status === 'accepted'
  ).length;
  
  return (
    <View style={styles.container}>
      <AppHeader 
        title="Driver Management Dashboard" 
        showCategoryFilter={true}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeDrivers}</Text>
            <Text style={styles.statLabel}>Active Drivers</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalVehicles}</Text>
            <Text style={styles.statLabel}>Total Vehicles</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeAssignments}</Text>
            <Text style={styles.statLabel}>Active Assignments</Text>
          </View>
        </View>
        
        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Assignments</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAssignmentForm(true)}
            >
              <Ionicons name="add" size={20} color={Colors.surface} />
              <Text style={styles.addButtonText}>Add Assignment</Text>
            </TouchableOpacity>
          </View>
          
          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No assignments yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add Assignment" to create your first assignment</Text>
            </View>
          ) : (
            filteredAssignments.slice(0, 3).map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.cardRow}>
                  {/* Driver Info */}
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
                  
                  {/* Category Info - NEW */}
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
        </View>
      </ScrollView>
      
      <Modal
        visible={showAssignmentForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AssignmentForm
          assignment={null}
          onClose={() => setShowAssignmentForm(false)}
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
  },
  recentActivity: {
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: Colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusassigned: {
    backgroundColor: Colors.primary + '20',
  },
  statusaccepted: {
    backgroundColor: Colors.success + '20',
  },
  statuscompleted: {
    backgroundColor: Colors.textSecondary + '20',
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
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  activitySubtitle: {
    ...Typography.caption,
  },
});

// Remove the functions that are currently defined after export default DashboardScreen
// Delete lines 333-371 (the getVehicleIcon and getVehicleIconColor functions)

export default DashboardScreen;