import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import CategoryManager from './CategoryManager';

const AppHeader = ({ title, subtitle, showCategoryFilter = false }) => {
  const { user, signOut } = useAuth();
  const { categories, selectedCategory, setSelectedCategory } = useApp();
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleLogout = async () => {
    console.log('Logout button pressed!');
    
    try {
      // Try to show alert, but handle potential browser extension conflicts
      const shouldLogout = window.confirm('Are you sure you want to logout?');
      
      if (shouldLogout) {
        console.log('User confirmed logout, attempting to sign out...');
        await signOut();
        console.log('Sign out successful');
      } else {
        console.log('User cancelled logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: try to logout anyway if there's an error with the confirmation
      try {
        console.log('Attempting fallback logout...');
        await signOut();
        console.log('Fallback logout successful');
      } catch (fallbackError) {
        console.error('Fallback logout also failed:', fallbackError);
        // Show a simple alert as last resort
        window.alert('There was an error logging out. Please refresh the page and try again.');
      }
    }
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'All Categories';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : 'All Categories';
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId || null);
    setShowCategoryDropdown(false);
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {/* Category Filter Section */}
        {showCategoryFilter && (
          <View style={styles.categorySection}>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryDropdown(true)}
            >
              <View style={styles.categoryInfo}>
                {selectedCategory && (
                  <View 
                    style={[
                      styles.categoryColorDot, 
                      { backgroundColor: categories.find(cat => cat.id === selectedCategory)?.color || Colors.primary }
                    ]} 
                  />
                )}
                <Text style={styles.categoryText}>{getSelectedCategoryName()}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.manageCategoriesButton}
              onPress={() => setShowCategoryManager(true)}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.username}>{getUserDisplayName()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleCategoryChange(null)}
            >
              <Text style={[styles.dropdownText, !selectedCategory && styles.selectedDropdownText]}>
                All Categories
              </Text>
              {!selectedCategory && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.dropdownItem}
                onPress={() => handleCategoryChange(category.id)}
              >
                <View style={styles.dropdownItemContent}>
                  <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
                  <Text style={[
                    styles.dropdownText,
                    selectedCategory === category.id && styles.selectedDropdownText
                  ]}>
                    {category.name}
                  </Text>
                </View>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Manager Modal */}
      <CategoryManager
        visible={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.md,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 150,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    ...Typography.body,
    color: Colors.text,
  },
  manageCategoriesButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  username: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    backgroundColor: Colors.error + '10',
    minHeight: 36,
    minWidth: 80,
  },
  logoutText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  dropdownContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 200,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.text,
  },
  selectedDropdownText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default AppHeader;