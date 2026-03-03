import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Palette, useTheme} from '../theme/designSystem';
import {useCategories} from '../hooks/useCategories';
import {CategoryColor} from '../types/category';

const COLORS: CategoryColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];

const CATEGORY_COLORS: Record<CategoryColor, string> = {
  red: '#f44336',
  blue: '#2196f3',
  green: '#4caf50',
  yellow: '#ffc107',
  purple: '#9c27b0',
  pink: '#e91e63',
  orange: '#ff9800',
};

export default function CategoryManagementScreen() {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState<CategoryColor>('blue');
  const [newDescription, setNewDescription] = useState('');

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Category name is required');
      return;
    }

    try {
      await addCategory({
        name: newName,
        color: selectedColor,
        description: newDescription,
      });
      setNewName('');
      setNewDescription('');
      setSelectedColor('blue');
      Alert.alert('Success', 'Category added');
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Category Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter category name"
          placeholderTextColor={palette.text + '66'}
          value={newName}
          onChangeText={setNewName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Enter description"
          placeholderTextColor={palette.text + '66'}
          value={newDescription}
          onChangeText={setNewDescription}
          multiline
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: CATEGORY_COLORS[color] },
                selectedColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCategory}
        >
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>Categories ({categories.length})</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryContent}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: CATEGORY_COLORS[item.color] },
                ]}
              />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.categoryDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCategory(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    form: {
      padding: 16,
      backgroundColor: palette.secondary,
      borderBottomColor: palette.text + '10',
      borderBottomWidth: 1,
    },
    label: {
      fontSize: 14,
      marginTop: 12,
      marginBottom: 8,
      fontWeight: '600',
      color: palette.text,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.text + '20',
      padding: 12,
      borderRadius: 8,
      backgroundColor: palette.background,
      fontSize: 14,
      marginBottom: 12,
      color: palette.text,
    },
    multilineInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    colorOption: {
      width: '15%',
      aspectRatio: 1,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorOptionSelected: {
      borderWidth: 3,
      borderColor: palette.text,
    },
    checkmark: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    addButton: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      paddingHorizontal: 16,
      paddingTop: 16,
      marginBottom: 8,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.secondary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: palette.text + '10',
    },
    categoryContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 2,
    },
    categoryDescription: {
      fontSize: 12,
      color: palette.text + '88',
    },
    deleteButton: {
      padding: 8,
    },
    deleteButtonText: {
      fontSize: 18,
    },
  });
