import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Palette, useTheme } from '../theme/designSystem';
import { useFilters } from '../hooks/useFilters';

interface StatusPriorityFilterProps {
  type: 'status' | 'priority';
}

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function StatusPriorityFilter({ type }: StatusPriorityFilterProps) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const {
    filters,
    onStatusFilterChange,
    onPriorityFilterChange,
  } = useFilters();

  const options = type === 'status' ? STATUS_OPTIONS : PRIORITY_OPTIONS;
  const currentValue = type === 'status' ? filters.status : filters.priority;
  const handleChange = type === 'status' ? onStatusFilterChange : onPriorityFilterChange;

  const getPriorityColor = (value: string) => {
    switch (value) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      default:
        return palette.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {type === 'status' ? 'Status' : 'Priority'}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              currentValue === option.value && styles.buttonActive,
            ]}
            onPress={() => handleChange(option.value as any)}
          >
            {type === 'priority' && option.value !== 'all' && (
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: getPriorityColor(option.value) },
                ]}
              />
            )}
            <Text
              style={[
                styles.buttonText,
                currentValue === option.value && styles.buttonTextActive,
              ]}
            >
              {option.label}
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
      paddingVertical: 8,
      backgroundColor: palette.secondary,
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
    button: {
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
    buttonActive: {
      backgroundColor: palette.primary + '20',
      borderColor: palette.primary,
    },
    colorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '500',
      color: palette.text,
    },
    buttonTextActive: {
      fontWeight: '700',
      color: palette.primary,
    },
  });
