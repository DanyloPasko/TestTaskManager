import React from 'react';
import { FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigation';
import TaskItem from '../components/TaskItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, useTheme } from '../theme/designSystem';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const tasks = useSelector((state: RootState) => state.tasks.list);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => navigation.navigate('TaskForm', { task: item })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet</Text>}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TaskForm', {})}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: palette.background },
    empty: {
      textAlign: 'center',
      marginTop: 32,
      fontSize: 16,
      color: palette.text,
    },
    addButton: {
      position: 'absolute',
      bottom: 32,
      right: 32,
      backgroundColor: palette.primary,
      borderRadius: 16,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      marginTop: -4,
      color: '#fff',
      fontSize: 32,
      lineHeight: 32,
      fontWeight: '600',
    },
  });
