import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Palette, useTheme} from '../theme/designSystem';
import {useFilters} from '../hooks/useFilters';

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: palette.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text + '88',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipsRow: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'flex-end',
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.text + '20',
      backgroundColor: palette.background,
    },
    chipActive: {
      backgroundColor: palette.primary + '20',
      borderColor: palette.primary,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '500',
      color: palette.text,
    },
    chipTextActive: {
      color: palette.primary,
      fontWeight: '700',
    },
    orderButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.text + '20',
      backgroundColor: palette.background,
    },
    orderText: {
      fontSize: 11,
      fontWeight: '600',
      color: palette.text,
    },
  });

export default function SortBar() {
  const {palette} = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {
    sort,
    onSortByChange,
    onSortOrderChange,
  } = useFilters();

  const toggleOrder = () => {
    onSortOrderChange(sort.order === 'asc' ? 'desc' : 'asc');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by</Text>
      <View style={styles.chipsRow}>
        {[
          {label: 'Created', value: 'createdAt' as const},
          {label: 'Deadline', value: 'deadline' as const},
          {label: 'Priority', value: 'priority' as const},
          {label: 'Status', value: 'status' as const},
        ].map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              sort.by === option.value && styles.chipActive,
            ]}
            onPress={() => onSortByChange(option.value)}>
            <Text
              style={[
                styles.chipText,
                sort.by === option.value && styles.chipTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.orderButton}
          onPress={toggleOrder}>
          <Text style={styles.orderText}>
            {sort.order === 'asc' ? 'Asc' : 'Desc'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

