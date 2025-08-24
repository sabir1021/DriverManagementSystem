import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const DriverCard = ({ driver, onEdit, onDelete }) => {
  const handleDelete = () => {
    console.log('Delete button pressed for driver:', driver.id); // Debug log
    
    // Use browser-compatible confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete ${driver.first_name} ${driver.last_name}?`
    );
    
    if (confirmed) {
      console.log('Delete confirmed for driver:', driver.id); // Debug log
      onDelete(driver.id);
    }
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Driver Name */}
        <View style={styles.columnPrimary}>
          <Text style={styles.driverName}>
            {driver.first_name} {driver.last_name}
          </Text>
          <Text style={styles.driverRole}>Driver</Text>
        </View>
        
        {/* License Number */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>License</Text>
          <Text style={styles.detailValue}>{driver.license_number}</Text>
        </View>
        
        {/* Phone */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{driver.phone}</Text>
        </View>
        
        {/* Email */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {driver.email || 'N/A'}
          </Text>
        </View>
        
        {/* Status */}
        <View style={styles.columnStatus}>
          <View style={[styles.statusBadge, styles[`status${driver.status}`]]}>
            <Text style={styles.statusText}>{driver.status}</Text>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.columnActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(driver)}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Notes row (if exists) */}
      {driver.notes && (
        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Notes: </Text>
          <Text style={styles.notesText} numberOfLines={2}>{driver.notes}</Text>
        </View>
      )}
    </View>
  );
};

const DriverList = ({ onAddDriver, onEditDriver }) => {
  const { drivers, deleteDriver, getFilteredDrivers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use filtered drivers from context instead of all drivers
  const contextFilteredDrivers = getFilteredDrivers();
  
  const filteredDrivers = contextFilteredDrivers.filter(driver => {
    const query = searchQuery.toLowerCase();
    return (
      driver.first_name.toLowerCase().includes(query) ||
      driver.last_name.toLowerCase().includes(query) ||
      driver.license_number.toLowerCase().includes(query) ||
      driver.phone.includes(query)
    );
  });
  
  const handleEdit = (driver) => {
    onEditDriver(driver);
  };
  
  const handleDelete = (driverId) => {
    console.log('DriverList handleDelete called with:', driverId); // Debug log
    deleteDriver(driverId);
  };
  
  if (contextFilteredDrivers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Drivers Yet</Text>
        <Text style={styles.emptySubtitle}>Add your first driver to get started</Text>
        <Button
          title="Add First Driver"
          onPress={onAddDriver}
          style={styles.emptyButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search drivers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>
      
      <FlatList
        data={filteredDrivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriverCard
            driver={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    padding: Spacing.md,
  },
  card: {
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
    marginBottom: 2,
  },
  driverRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.body,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
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
    fontSize: 11,
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  notesRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '30',
  },
  notesLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  notesText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default DriverList;