import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const RouteCard = ({ route, onEdit, onDelete, categories }) => {
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

  // Remove getStatusColor function entirely

  const formatStops = (stops) => {
    if (!stops || stops.length === 0) return 'Direct route';
    if (stops.length <= 2) return stops.join(', ');
    return `${stops.slice(0, 2).join(', ')} +${stops.length - 2} more`;
  };

  // Get route period from route_type field
  const getRoutePeriod = () => {
    return route.route_type || 'N/A';
  };

  const getPeriodColor = (period) => {
    switch (period) {
      case 'AM': return Colors.primary;
      case 'PM': return Colors.secondary || '#FF6B35';
      default: return Colors.textSecondary;
    }
  };

  // Helper function to get category info
  const getCategoryInfo = () => {
    if (!route.category_id || !categories) return 'No Category';
    const category = categories.find(cat => cat.id === route.category_id);
    return category ? category.name : 'Unknown Category';
  };

  const routePeriod = getRoutePeriod();

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {/* Route Name & Period */}
        <View style={styles.columnPrimary}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeName}>{route.route_name || 'Unnamed Route'}</Text>
            <View style={[styles.periodBadge, { backgroundColor: getPeriodColor(routePeriod) + '20' }]}>
              <Text style={[styles.periodText, { color: getPeriodColor(routePeriod) }]}>
                {routePeriod}
              </Text>
            </View>
          </View>
          <Text style={styles.routeLocations}>
            {route.school_name || 'No school assigned'}
          </Text>
        </View>
        
        {/* Category */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>
            {getCategoryInfo()}
          </Text>
        </View>
        
        {/* Check-in Time */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Check-in Time</Text>
          <Text style={styles.detailValue}>
            {route.check_in_time || 'Not set'}
          </Text>
        </View>
        
        {/* Stops */}
        <View style={styles.columnSecondary}>
          <Text style={styles.detailLabel}>Stops</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {formatStops(route.stops)}
          </Text>
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
  const { routes, deleteRoute, getFilteredRoutes, categories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use filtered routes from context instead of all routes
  const contextFilteredRoutes = getFilteredRoutes();
  
  const filteredRoutes = contextFilteredRoutes.filter(route => {
    if (!route) return false;
    
    const query = searchQuery.toLowerCase();
    const routeName = route.route_name || '';
    const schoolName = route.school_name || '';
    const checkInTime = route.check_in_time || '';
    const routeType = route.route_type || '';
    const notes = route.notes || '';
    
    // Get category name for search
    const category = categories?.find(cat => cat.id === route.category_id);
    const categoryName = category ? category.name : '';
    
    // Search in route name, school name, check-in time, route type, notes, category, and stops
    return (
      routeName.toLowerCase().includes(query) ||
      schoolName.toLowerCase().includes(query) ||
      checkInTime.toLowerCase().includes(query) ||
      routeType.toLowerCase().includes(query) ||
      notes.toLowerCase().includes(query) ||
      categoryName.toLowerCase().includes(query) ||
      (route.stops && Array.isArray(route.stops) && 
       route.stops.some(stop => stop && stop.toLowerCase().includes(query)))
    );
  });
  
  const handleEdit = (route) => {
    onEditRoute(route);
  };
  
  const handleDelete = (routeId) => {
    console.log('RouteList handleDelete called with:', routeId);
    deleteRoute(routeId);
  };
  
  if (contextFilteredRoutes.length === 0) {
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
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categories={categories}
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
  // Remove columnStatus entirely
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
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  periodBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: Spacing.xs,
  },
  periodText: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.bold,
  },
  timeContainer: {
    gap: 2,
  },
  timeText: {
    fontSize: Typography.sizes.small,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
});

export default RouteList;