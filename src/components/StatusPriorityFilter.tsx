import React, {useMemo} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Palette, useTheme } from '../theme/designSystem';
import { useFilters } from '../hooks/useFilters';
import { Category, Priority, Status } from '../types/task';

interface StatusPriorityFilterProps {
  type: 'status' | 'priority' | 'category';
}

type StatusFilterValue = Status | 'all';
type PriorityFilterValue = Priority | 'all';
type CategoryFilterValue = Category | 'all';

const STATUS_OPTIONS: { label: string; value: StatusFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: Status.Pending },
  { label: 'Completed', value: Status.Completed },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: Priority.Low },
  { label: 'Medium', value: Priority.Medium },
  { label: 'High', value: Priority.High },
];

const CATEGORY_OPTIONS: { label: string; value: CategoryFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Work', value: Category.Work },
  { label: 'Personal', value: Category.Personal },
  { label: 'Shopping', value: Category.Shopping },
  { label: 'Other', value: Category.Other },
];

export default function StatusPriorityFilter({ type }: StatusPriorityFilterProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    filters,
    onStatusFilterChange,
    onPriorityFilterChange,
    onCategoryFilterChange,
  } = useFilters();

  const options =
    type === 'status'
      ? STATUS_OPTIONS
      : type === 'priority'
      ? PRIORITY_OPTIONS
      : CATEGORY_OPTIONS;

  const currentValue =
    type === 'status'
      ? filters.status
      : type === 'priority'
      ? filters.priority
      : filters.category;

  const getPriorityColor = (value: PriorityFilterValue) => {
    switch (value) {
      case Priority.Low:
        return '#4caf50';
      case Priority.Medium:
        return '#ff9800';
      case Priority.High:
        return '#f44336';
      default:
        return palette.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {type === 'status'
          ? 'Status'
          : type === 'priority'
          ? 'Priority'
          : 'Category'}
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
            onPress={() => {
              if (type === 'status') {
                onStatusFilterChange(option.value as StatusFilterValue);
              } else if (type === 'priority') {
                onPriorityFilterChange(option.value as PriorityFilterValue);
              } else {
                onCategoryFilterChange(option.value as CategoryFilterValue);
              }
            }}
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

const createStyles = (palette: Palette) =>
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
