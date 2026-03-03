import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Palette, useTheme } from '../theme/designSystem';
import { useFilters } from '../hooks/useFilters';

export default function Pagination() {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const { pagination, totalPages, onPageChange } = useFilters();

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.page < totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          pagination.page === 1 && styles.buttonDisabled,
        ]}
        onPress={handlePrevious}
        disabled={pagination.page === 1}
      >
        <Text
          style={[
            styles.buttonText,
            pagination.page === 1 && styles.buttonTextDisabled,
          ]}
        >
          ← Previous
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageInfo}>
        Page {pagination.page} of {totalPages}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          pagination.page === totalPages && styles.buttonDisabled,
        ]}
        onPress={handleNext}
        disabled={pagination.page === totalPages}
      >
        <Text
          style={[
            styles.buttonText,
            pagination.page === totalPages && styles.buttonTextDisabled,
          ]}
        >
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.secondary,
      borderTopColor: palette.text + '10',
      borderTopWidth: 1,
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: palette.primary,
      borderRadius: 6,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: palette.text + '20',
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text === '#fff' ? '#121212' : '#fff',
    },
    buttonTextDisabled: {
      color: palette.text + '66',
    },
    pageInfo: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '500',
      color: palette.text,
    },
  });
