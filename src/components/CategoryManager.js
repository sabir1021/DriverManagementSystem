import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useApp } from '../context/AppContext';

const CategoryManager = ({ visible, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007AFF', // Default blue color
  });
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#007AFF',
    });
    setErrors({});
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#007AFF',
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    // Check for duplicate names (excluding current category when editing)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== editingCategory?.id
    );
    
    if (existingCategory) {
      newErrors.name = 'Category name already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
      };
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (error) {
              console.error('Error deleting category:', error);
            }
          },
        },
      ]
    );
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.categoryDescription}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
        >
          <Ionicons name="pencil" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
        >
          <Ionicons name="trash" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const colorOptions = [
    '#007AFF', '#FF3B30', '#FF9500', '#FFCC00',
    '#34C759', '#5AC8FA', '#AF52DE', '#FF2D92',
    '#8E8E93', '#000000'
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Categories</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {!showForm ? (
          <>
            <View style={styles.content}>
              <Button
                title="Add New Category"
                onPress={handleAddCategory}
                style={styles.addButton}
              />
              
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategoryItem}
                style={styles.categoryList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="folder-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyText}>No categories yet</Text>
                    <Text style={styles.emptySubtext}>Add your first category to get started</Text>
                  </View>
                }
              />
            </View>
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>
            
            <Input
              label="Category Name *"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="e.g., School Routes, Special Events"
              error={errors.name}
            />
            
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Optional description"
              multiline
              numberOfLines={2}
            />
            
            <View style={styles.colorSection}>
              <Text style={styles.colorLabel}>Color</Text>
              <View style={styles.colorOptions}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.selectedColor
                    ]}
                    onPress={() => updateField('color', color)}
                  >
                    {formData.color === color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowForm(false);
                  resetForm();
                }}
                variant="secondary"
                style={styles.formButton}
              />
              <Button
                title={editingCategory ? 'Update' : 'Add'}
                onPress={handleSubmit}
                style={styles.formButton}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  addButton: {
    marginBottom: Spacing.lg,
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.xs,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.md,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...Typography.body,
    fontWeight: Typography.weights.medium,
  },
  categoryDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
    padding: Spacing.lg,
  },
  formTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  colorSection: {
    marginBottom: Spacing.lg,
  },
  colorLabel: {
    ...Typography.body,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: Colors.primary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  formButton: {
    flex: 1,
  },
});

export default CategoryManager;