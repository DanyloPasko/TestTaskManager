import {useEffect} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import TaskItem from '../components/TaskItem';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Palette, useTheme} from '../theme/designSystem';
import {useTasks} from '../hooks/useTasks';
import {SyncIndicator} from '../components/SyncIndicator';
import SearchBar from '../components/SearchBar';
import StatusPriorityFilter from '../components/StatusPriorityFilter';
import Pagination from '../components/Pagination';
import {useFilters} from '../hooks/useFilters';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const { tasks, isLoading, isOnline, refetch } = useTasks();
  const { paginatedTasks } = useFilters();

  useEffect(() => {
    return navigation.addListener('focus', () => {
      console.log('📱 TaskListScreen: Focus, isOnline:', isOnline);
      if (isOnline && refetch) {
        try {
          refetch();
        } catch (error) {
          console.log('📱 TaskListScreen: Refetch not available yet');
        }
      }
    });
  }, [navigation, isOnline, refetch]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh');
    if (refetch && isOnline) {
      try {
        refetch();
      } catch (error) {
        console.error('🔄 Refresh failed:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SyncIndicator showDetails={false} />
      <SearchBar />
      <StatusPriorityFilter type="status" />
      <StatusPriorityFilter type="priority" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onPress={() => navigation.navigate('TaskForm', { task: item })}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {tasks.length === 0
                  ? isOnline
                    ? 'No tasks in Firebase'
                    : 'No local tasks'
                  : 'No tasks match your filters'}
              </Text>
            }
            contentContainerStyle={styles.listContent}
            onRefresh={handleRefresh}
            refreshing={isLoading}
            scrollEnabled={true}
          />
          <Pagination />
        </>
      )}

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
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    listContent: {
      padding: 16,
      flexGrow: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: palette.text,
    },
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    addButtonText: {
      marginTop: -4,
      color: '#fff',
      fontSize: 32,
      lineHeight: 32,
      fontWeight: '600',
    },
  });
