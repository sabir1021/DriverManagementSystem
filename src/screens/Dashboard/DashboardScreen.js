import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import AssignmentForm from '../../components/AssignmentForm';
import AppHeader from '../../components/AppHeader';

const DashboardScreen = ({ navigation }) => {
  const { drivers, vehicles, assignments } = useApp();
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  const activeDrivers = drivers.filter(driver => driver.status === 'active').length;
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'available').length;
  const activeAssignments = assignments.filter(assignment => assignment.status === 'active').length;
  
  return (
    <View style={styles.container}>
      <AppHeader 
        title="Driver Management Dashboard" 
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
          
          {assignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No assignments yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add Assignment" to create your first assignment</Text>
            </View>
          ) : (
            assignments.slice(0, 3).map((assignment) => {
              const driver = drivers.find(d => d.id === assignment.driver_id);
              const vehicle = vehicles.find(v => v.id === assignment.vehicle_id);
              const route = assignment.route ? assignment.route : null;
              
              return (
                <View key={assignment.id} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver'}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      Vehicle: {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                      {route && ` • Route: ${route.name}`}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {assignment.start_date} - {assignment.end_date || 'Ongoing'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status${assignment.status}`]]}>
                    <Text style={styles.statusText}>{assignment.status}</Text>
                  </View>
                </View>
              );
            })
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
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default DashboardScreen;