import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Palette, useTheme } from '../theme/designSystem';
import { useFilters } from '../hooks/useFilters';

export default function SearchBar() {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { filters, onSearchChange, onResetFilters } = useFilters();
  const [searchText, setSearchText] = useState(filters.searchText);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearchChange(text);
  };

  const handleClear = () => {
    setSearchText('');
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search tasks..."
          placeholderTextColor={palette.text + '66'}
          value={searchText}
          onChangeText={handleSearchChange}
        />
        {searchText ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {(filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.category !== 'all' ||
        filters.searchText) && (
        <TouchableOpacity style={styles.resetButton} onPress={onResetFilters}>
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.secondary,
      gap: 8,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: palette.text + '20',
    },
    searchIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    input: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      color: palette.text,
    },
    clearIcon: {
      fontSize: 18,
      color: palette.text + '66',
      marginLeft: 8,
    },
    resetButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: palette.primary + '20',
      borderRadius: 4,
      alignItems: 'center',
    },
    resetButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.primary,
    },
  });
