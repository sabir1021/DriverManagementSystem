import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Platform } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const handleDelete = () => {
    console.log('Delete button pressed for vehicle:', vehicle.id); // Debug log
    
    // Use browser-compatible confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.vehicle_number}?`
    );
    
    if (confirmed) {
      console.log('Delete confirmed for vehicle:', vehicle.id); // Debug log
      onDelete(vehicle.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return Colors.success;
      case 'in-use': return Colors.warning;
      case 'maintenance': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'bus':
        return 'bus';
      case 'mini-bus':
        return 'bus-alt';
      case 'van':
        return 'shipping-fast'; // Better van representation
      case 'type-iii':
        return 'car';
      case 'truck':
        return 'truck';
      default:
        return 'car';
    }
  };

  const getVehicleIconColor = (type) => {
    switch (type) {
      case 'bus':
        return '#FF6B35'; // Orange for bus
      case 'mini-bus':
        return '#F7931E'; // Light orange for mini bus
      case 'van':
        return '#4A90E2'; // Blue for van
      case 'type-iii':
        return '#7ED321'; // Green for type III
      case 'truck':
        return '#BD10E0'; // Purple for truck
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Vehicle Icon & Number & Type */}
        <View style={styles.columnPrimary}>
          <View style={styles.vehicleHeader}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={getVehicleIcon(vehicle.type)} 
                size={24} 
                color={getVehicleIconColor(vehicle.type)} 
                solid
              />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleNumber}>{vehicle.vehicle_number}</Text>
              <Text style={styles.vehicleType}>{vehicle.type}</Text>
            </View>
          </View>
        </View>
        
        {/* Make/Model/Year - Most important vehicle info */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Vehicle Info</Text>
          <Text style={styles.detailValue}>
            {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Not specified'}
          </Text>
        </View>
        
        {/* License Plate - Important for identification */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>License Plate</Text>
          <Text style={styles.detailValue}>{vehicle.license_plate || 'Not set'}</Text>
        </View>
        
        {/* Status - Critical for operations */}
        <View style={styles.columnStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
              {vehicle.status}
            </Text>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.columnActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(vehicle)}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Notes row (if exists) - Keep for important additional info */}
      {vehicle.notes && (
        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Notes: </Text>
          <Text style={styles.notesText} numberOfLines={2}>{vehicle.notes}</Text>
        </View>
      )}
    </View>
  );
};

const VehicleList = ({ onAddVehicle, onEditVehicle }) => {
  const { vehicles, deleteVehicle, getFilteredVehicles } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use filtered vehicles from context instead of all vehicles
  const contextFilteredVehicles = getFilteredVehicles();
  
  const filteredVehicles = contextFilteredVehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.vehicle_number.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    );
  });
  
  const handleEdit = (vehicle) => {
    onEditVehicle(vehicle);
  };
  
  const handleDelete = (vehicleId) => {
    console.log('VehicleList handleDelete called with:', vehicleId); // Debug log
    deleteVehicle(vehicleId);
  };
  
  if (contextFilteredVehicles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Vehicles Yet</Text>
        <Text style={styles.emptySubtitle}>Add your first vehicle to get started</Text>
        <Button
          title="Add First Vehicle"
          onPress={onAddVehicle}
          style={styles.emptyButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>
      
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
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

// Add these styles to the existing styles object
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
  vehicleNumber: {
    ...Typography.h3,
    marginBottom: 2,
  },
  vehicleType: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
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

export default VehicleList;


const getVehicleIcon = (type) => {
  switch (type) {
    case 'bus':
    case 'mini-bus':
      return 'truck'; // Clean truck-like icon
    case 'van':
      return 'package'; // Represents cargo/delivery
    case 'type-iii':
    case 'truck':
      return 'truck';
    default:
      return 'truck';
  }
};