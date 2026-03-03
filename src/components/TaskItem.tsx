import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../types/Task';
import { Palette, useTheme } from '../theme/designSystem';
import { useDispatch } from 'react-redux';
import { deleteTask, toggleStatus } from '../store/taskSlice';

type Props = {
  task: Task;
  onPress: () => void;
};

type PriorityKey = 'priority_low' | 'priority_medium' | 'priority_high';

export default function TaskItem({ task, onPress }: Props) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteTask(task.id));
  };

  const handleToggleStatus = () => {
    dispatch(toggleStatus(task.id));
  };

  const isCompleted = task.status !== 'pending';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
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
          <Text style={[styles.description, isCompleted && styles.descriptionCompleted]}>
            {task.description}
          </Text>
        ) : null}
      </View>

      <Text
        style={[
          styles.priority,
          styles[`priority_${task.priority}` as PriorityKey],
        ]}
      >
        {task.priority.toUpperCase()}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity onPress={handleToggleStatus} activeOpacity={0.7}>
          <Text style={[styles.buttonText, { color: 'green' }]}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const useStyles = (palette: Palette) =>
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    content: {
      flex: 1,
      marginRight: 12,
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
      shadowOffset: { width: 0, height: 1 },
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
    },
    button: {
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 8,
    },
    buttonText: {
      padding: 4,
      fontWeight: '600',
      fontSize: 18,
      color: 'white',
    },
  });
