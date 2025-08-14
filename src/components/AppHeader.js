import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const AppHeader = ({ title, subtitle }) => {
  const { user, signOut } = useAuth();

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

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
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
});

export default AppHeader;