import React, {useMemo} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Status, Task} from '../types/task';
import {Palette, useTheme} from '../theme/designSystem';

type Props = {
  task: Task;
  onPress: () => void;
  onDelete: (id: string) => Promise<void> | void;
  onToggleStatus: (id: string) => Promise<void> | void;
};

type PriorityKey = 'priority_low' | 'priority_medium' | 'priority_high';

export default function TaskItem({task, onPress, onDelete, onToggleStatus}: Props) {
  const {palette} = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await onDelete(task.id);
              console.log('✅ Task deleted:', task.id);
            } catch (error) {
              console.error('❌ Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleToggleStatus = async () => {
    try {
      await onToggleStatus(task.id);
      console.log('✅ Task status toggled:', task.id);
    } catch (error) {
      console.error('❌ Failed to toggle task status:', error);
      Alert.alert('Error', 'Failed to toggle task status');
    }
  };

  const isCompleted = task.status === Status.Completed;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.contentArea}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text
              style={[
                styles.description,
                isCompleted && styles.descriptionCompleted,
              ]}>
              {task.description}
            </Text>
          ) : null}

          {task.category && (
            <Text style={styles.metaText}>
              Category: {task.category.toUpperCase()}
            </Text>
          )}
          {task.deadline && (
            <Text style={styles.metaText}>Deadline: {task.deadline}</Text>
          )}
        </View>

        <Text
          style={[
            styles.priority,
            styles[`priority_${task.priority}` as PriorityKey],
          ]}
        >
          {task.priority.toUpperCase()}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={handleToggleStatus}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.buttonText}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.buttonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.secondary,
      borderWidth: 1,
      borderColor: palette.text + '33',
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    contentArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    content: {
      flex: 1,
    },
    title: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: palette.text + '88',
      fontStyle: 'italic',
    },
    description: {
      color: palette.text + 'aa',
      fontSize: 14,
    },
    descriptionCompleted: {
      textDecorationLine: 'line-through',
      color: palette.text + '66',
      fontStyle: 'italic',
    },
    metaText: {
      marginTop: 4,
      color: palette.text + '88',
      fontSize: 12,
    },
    priority: {
      fontSize: 12,
      fontWeight: '700',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      overflow: 'hidden',
      color: palette.background,
      textTransform: 'uppercase',
      marginRight: 12,
      alignSelf: 'center',
      minWidth: 80,
      textAlign: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.25,
      shadowRadius: 2,
      elevation: 2,
    },
    priority_low: {
      backgroundColor: '#34c759',
    },
    priority_medium: {
      backgroundColor: '#ff9500',
    },
    priority_high: {
      backgroundColor: '#ff3b30',
    },
    buttons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    buttonText: {
      padding: 8,
      fontWeight: '600',
      fontSize: 20,
      color: 'green',
    },
  });
