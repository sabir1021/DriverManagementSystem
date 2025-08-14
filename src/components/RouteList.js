import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const RouteCard = ({ route, onEdit, onDelete }) => {
  const handleDelete = () => {
    console.log('Delete button pressed for route:', route.id);
    
    // Use browser-compatible confirmation
    const confirmed = typeof window !== 'undefined' && window.confirm 
      ? window.confirm(`Are you sure you want to delete ${route.route_name}?`)
      : true; // Fallback for non-web environments
    
    if (confirmed) {
      console.log('Delete confirmed for route:', route.id);
      onDelete(route.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'inactive': return Colors.textSecondary;
      case 'maintenance': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const formatStops = (stops) => {
    if (!stops || stops.length === 0) return 'Direct route';
    if (stops.length <= 2) return stops.join(', ');
    return `${stops.slice(0, 2).join(', ')} +${stops.length - 2} more`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Route Name */}
        <View style={styles.columnPrimary}>
          <Text style={styles.routeName}>{route.route_name}</Text>
          <Text style={styles.routeLocations}>
            {route.start_location} → {route.end_location}
          </Text>
        </View>
        
        {/* Stops */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Stops</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {formatStops(route.stops)}
          </Text>
        </View>
        
        {/* Distance & Time */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>
            {route.distance ? `${route.distance} km` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Est. Time</Text>
          <Text style={styles.detailValue}>
            {route.estimated_time ? `${route.estimated_time} min` : 'N/A'}
          </Text>
        </View>
        
        {/* Status */}
        <View style={styles.columnStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(route.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(route.status) }]}>
              {route.status}
            </Text>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.columnActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(route)}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Notes row (if exists) */}
      {route.notes && (
        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Notes: </Text>
          <Text style={styles.notesText} numberOfLines={2}>{route.notes}</Text>
        </View>
      )}
    </View>
  );
};

const RouteList = ({ onAddRoute, onEditRoute }) => {
  const { routes, deleteRoute } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredRoutes = routes.filter(route => {
    const query = searchQuery.toLowerCase();
    return (
      route.route_name.toLowerCase().includes(query) ||
      route.start_location.toLowerCase().includes(query) ||
      route.end_location.toLowerCase().includes(query) ||
      (route.stops && route.stops.some(stop => stop.toLowerCase().includes(query)))
    );
  });
  
  const handleEdit = (route) => {
    onEditRoute(route);
  };
  
  const handleDelete = (routeId) => {
    console.log('RouteList handleDelete called with:', routeId);
    deleteRoute(routeId);
  };
  
  if (routes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Routes Yet</Text>
        <Text style={styles.emptySubtitle}>Add your first route to get started</Text>
        <Button
          title="Add First Route"
          onPress={onAddRoute}
          style={styles.emptyButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search routes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>
      
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
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
    flex: 2.5,
    paddingRight: Spacing.sm,
  },
  columnSecondary: {
    flex: 1.2,
    paddingHorizontal: Spacing.xs,
  },
  columnStatus: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
  },
  columnActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  routeName: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  routeLocations: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  },
  detailLabel: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.sizes.small,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  statusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.medium,
    textTransform: 'capitalize',
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  notesRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesLabel: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  notesText: {
    flex: 1,
    fontSize: Typography.sizes.small,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.large,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default RouteList;