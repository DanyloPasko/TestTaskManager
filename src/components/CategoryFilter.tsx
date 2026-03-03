import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Palette, useTheme } from '../theme/designSystem';
import { useCategories } from '../hooks/useCategories';
import { useFilters } from '../hooks/useFilters';

interface CategoryFilterProps {
  onCategorySelect?: (categoryId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  red: '#f44336',
  blue: '#2196f3',
  green: '#4caf50',
  yellow: '#ffc107',
  purple: '#9c27b0',
  pink: '#e91e63',
  orange: '#ff9800',
};

export default function CategoryFilter({ onCategorySelect }: CategoryFilterProps) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const { categories } = useCategories();
  const { filters, onCategoryFilterChange } = useFilters();

  const handleCategoryPress = (categoryId: string) => {
    const newCategory = filters.category === categoryId ? 'all' : categoryId;
    onCategoryFilterChange(newCategory);
    onCategorySelect?.(newCategory);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            filters.category === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => handleCategoryPress('all')}
        >
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: palette.primary },
            ]}
          />
          <Text
            style={[
              styles.categoryText,
              filters.category === 'all' && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              filters.category === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: CATEGORY_COLORS[category.color] || palette.primary },
              ]}
            />
            <Text
              style={[
                styles.categoryText,
                filters.category === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.secondary,
      borderBottomColor: palette.text + '10',
      borderBottomWidth: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text + '88',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    scrollView: {
      flexGrow: 0,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.text + '20',
    },
    categoryButtonActive: {
      backgroundColor: palette.primary + '20',
      borderColor: palette.primary,
    },
    colorIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '500',
      color: palette.text,
    },
    categoryTextActive: {
      fontWeight: '700',
      color: palette.primary,
    },
  });
