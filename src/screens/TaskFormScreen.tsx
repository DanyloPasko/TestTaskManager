import {useEffect, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {useDispatch} from 'react-redux';
import {addTask, updateTask} from '../store/taskSlice';
import {Priority, Task} from '../types/Task';
import {v4 as uuid} from 'uuid';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Palette, useTheme} from '../theme/designSystem.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props) {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const editingTask = route.params?.task;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(
    editingTask?.description || ''
  );
  const [priority, setPriority] = useState<Priority>(
    editingTask?.priority || 'medium'
  );

  useEffect(() => {
    if (editingTask) {
      navigation.setOptions({ title: 'Edit Task' });
    }
  }, [editingTask, navigation]);

  const onSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    const task: Task = {
      id: editingTask?.id || uuid(),
      title,
      description,
      priority,
      status: editingTask?.status || 'pending',
    };

    if (editingTask) {
      dispatch(updateTask(task));
    } else {
      dispatch(addTask(task));
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        placeholder="Title"
        placeholderTextColor={'grey'}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Description"
        placeholderTextColor={'grey'}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multilineInput]}
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {(['low', 'medium', 'high'] as Priority[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p)}
            style={[
              styles.priorityButton,
              priority === p && styles.priorityButtonActive,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                priority === p && styles.priorityTextActive,
              ]}
            >
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { padding: 16, flex: 1, backgroundColor: palette.background },
    input: {
      borderWidth: 1,
      borderColor: 'grey',
      padding: 12,
      borderRadius: 8,
      backgroundColor: palette.background,
      fontSize: 16,
      marginBottom: 12,
      color: palette.text,
    },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 14,
      marginTop: 8,
      marginBottom: 4,
      fontWeight: '500',
      color: palette.text,
    },
    priorityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'grey',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
    priorityButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    priorityText: {
      fontSize: 14,
      color: palette.text,
      fontWeight: '500',
    },
    priorityTextActive: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontWeight: '700',
    },
    saveButton: {
      marginTop: 'auto',
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  },
);
