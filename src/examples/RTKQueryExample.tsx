/**
 * Example component demonstrating RTK Query usage
 * This file shows how to use the tasksApi hooks in components
 */

import React from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useTasks } from '../hooks/useTasks';

export const RTKQueryExample = () => {
  const {
    tasks,
    isLoading,
    isError,
    createTask,
    deleteTask,
    toggleStatus,
    refetch,
  } = useTasks();

  const handleAddTask = async () => {
    try {
      await createTask({
        title: 'New Task from RTK Query',
        description: 'Created using RTK Query',
        status: 'pending',
        priority: 'medium',
      });
      console.log('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleStatus(id);
      console.log('Task status toggled');
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      console.log('Task deleted');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error loading tasks</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        RTK Query Example
      </Text>
      <Button title="Add New Task" onPress={handleAddTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Sync: {item.syncStatus || 'synced'}</Text>
            <View style={styles.buttonRow}>
              <Button title="Toggle" onPress={() => handleToggleTask(item.id)} />
              <Button title="Delete" onPress={() => handleDeleteTask(item.id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    padding: 8,
    borderBottomWidth: 1,
  },
  taskTitle: {
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
