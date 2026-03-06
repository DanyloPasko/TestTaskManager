import {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {Category, Priority, Status} from '../types/task';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Palette, useTheme} from '../theme/designSystem.ts';
import {useTasks} from '../hooks/useTasks';
import {useImagePicker} from '../hooks/useImagePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

type PriorityButtonProps = {
  value: Priority;
  current: Priority;
  onPress: (value: Priority) => void;
  styles: ReturnType<typeof createStyles>;
};

const PriorityButton = ({
  value,
  current,
  onPress,
  styles,
}: PriorityButtonProps) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={[
      styles.priorityButton,
      current === value && styles.priorityButtonActive,
    ]}>
    <Text
      style={[
        styles.priorityText,
        current === value && styles.priorityTextActive,
      ]}>
      {value.toUpperCase()}
    </Text>
  </TouchableOpacity>
);

type CategoryButtonProps = {
  value: Category;
  current: Category;
  onPress: (value: Category) => void;
  styles: ReturnType<typeof createStyles>;
};

const CategoryButton = ({
  value,
  current,
  onPress,
  styles,
}: CategoryButtonProps) => (
  <TouchableOpacity
    onPress={() => onPress(value)}
    style={[
      styles.categoryButton,
      current === value && styles.categoryButtonActive,
    ]}>
    <Text
      style={[
        styles.categoryText,
        current === value && styles.categoryTextActive,
      ]}>
      {value.toUpperCase()}
    </Text>
  </TouchableOpacity>
);

type ImageSectionProps = {
  imageUri: string;
  onPick: () => void;
  onRemove: () => void;
  styles: ReturnType<typeof createStyles>;
};

const ImageSection = ({
  imageUri,
  onPick,
  onRemove,
  styles,
}: ImageSectionProps) =>
  imageUri ? (
    <View style={styles.imageContainer}>
      <Image source={{uri: imageUri}} style={styles.image} />
      <TouchableOpacity style={styles.removeImageButton} onPress={onRemove}>
        <Text style={styles.removeImageText}>✕ Remove</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity style={styles.imagePickerButton} onPress={onPick}>
      <Text style={styles.imagePickerText}>📸 Add Image</Text>
    </TouchableOpacity>
  );

export default function TaskFormScreen({navigation, route}: Props) {
  const {palette} = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const editingTask = route.params?.task;
  const {createTask, updateTask, isCreating, isUpdating} = useTasks();
  const {pickImage} = useImagePicker();

  const DRAFT_KEY = 'task_form_draft';

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(
    editingTask?.description || '',
  );
  const [priority, setPriority] = useState<Priority>(
    editingTask?.priority || Priority.Medium,
  );
  const [category, setCategory] = useState<Category>(
    editingTask?.category || Category.Other,
  );
  const [deadline, setDeadline] = useState<string>(
    editingTask?.deadline || '',
  );
  const [imageUri, setImageUri] = useState(editingTask?.imageUri || '');

  useEffect(() => {
    if (editingTask) {
      navigation.setOptions({title: 'Edit Task'});
    }
  }, [editingTask, navigation]);

  // load draft for new task
  useEffect(() => {
    if (editingTask) {
      return;
    }
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (!raw) {
          return;
        }
        const draft = JSON.parse(raw) as {
          title?: string;
          description?: string;
          priority?: Priority;
          category?: Category;
          deadline?: string;
          imageUri?: string;
        };
        if (draft.title) {
          setTitle(draft.title);
        }
        if (draft.description) {
          setDescription(draft.description);
        }
        if (draft.priority) {
          setPriority(draft.priority);
        }
        if (draft.category) {
          setCategory(draft.category);
        }
        if (draft.deadline) {
          setDeadline(draft.deadline);
        }
        if (draft.imageUri) {
          setImageUri(draft.imageUri);
        }
      } catch {
        // ignore draft load errors
      }
    })();
  }, [editingTask]);

  // autosave draft for new task
  useEffect(() => {
    if (editingTask) {
      return;
    }
    const saveDraft = async () => {
      try {
        const payload = JSON.stringify({
          title,
          description,
          priority,
          category,
          deadline,
          imageUri,
        });
        await AsyncStorage.setItem(DRAFT_KEY, payload);
      } catch {
        // ignore draft save errors
      }
    };
    saveDraft();
  }, [editingTask, title, description, priority, category, deadline, imageUri]);

  const handleImagePick = async () => {
    try {
      const result = await pickImage();
      if (result) {setImageUri(result.uri);}
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => setImageUri('');

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }
    try {
      const taskData = {
        title,
        description,
        priority,
        status: editingTask?.status || Status.Pending,
        category,
        deadline: deadline || undefined,
        imageUri: imageUri || undefined,
      };
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
        await AsyncStorage.removeItem(DRAFT_KEY);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save task');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          placeholder="Task title"
          placeholderTextColor={palette.text + '66'}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Task description"
          placeholderTextColor={palette.text + '66'}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multilineInput]}
          multiline
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {[Priority.Low, Priority.Medium, Priority.High].map(p => (
            <PriorityButton
              key={p}
              value={p}
              current={priority}
              onPress={setPriority}
              styles={styles}
            />
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.priorityRow}>
          {[Category.Work, Category.Personal, Category.Shopping, Category.Other].map(
            c => (
              <CategoryButton
                key={c}
                value={c}
                current={category}
                onPress={setCategory}
                styles={styles}
              />
            ),
          )}
        </View>

        <Text style={styles.label}>Deadline (optional)</Text>
        <TextInput
          placeholder="YYYY-MM-DD or any text"
          placeholderTextColor={palette.text + '66'}
          value={deadline}
          onChangeText={setDeadline}
          style={styles.input}
        />

        <Text style={styles.label}>Image</Text>
        <ImageSection
          imageUri={imageUri}
          onPick={handleImagePick}
          onRemove={handleRemoveImage}
          styles={styles}
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSave}
        disabled={isCreating || isUpdating}>
        <Text style={styles.saveButtonText}>
          {isCreating || isUpdating ? 'Saving...' : 'Save Task'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {padding: 16, flex: 1, backgroundColor: palette.background},
    input: {
      borderWidth: 1,
      borderColor: palette.text + '20',
      padding: 12,
      borderRadius: 8,
      backgroundColor: palette.secondary,
      fontSize: 16,
      marginBottom: 12,
      color: palette.text,
    },
    multilineInput: {height: 100, textAlignVertical: 'top'},
    label: {
      fontSize: 14,
      marginTop: 12,
      marginBottom: 8,
      fontWeight: '600',
      color: palette.text,
    },
    priorityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 8,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.text + '20',
      alignItems: 'center',
      backgroundColor: palette.secondary,
    },
    priorityButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    priorityText: {fontSize: 12, color: palette.text, fontWeight: '600'},
    priorityTextActive: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontWeight: '700',
    },
    categoryButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.text + '20',
      alignItems: 'center',
      backgroundColor: palette.secondary,
    },
    categoryButtonActive: {
      backgroundColor: palette.primary + '10',
      borderColor: palette.primary,
    },
    categoryText: {
      fontSize: 12,
      color: palette.text,
      fontWeight: '600',
    },
    categoryTextActive: {
      color: palette.primary,
      fontWeight: '700',
    },
    imageContainer: {
      marginBottom: 12,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: palette.secondary,
    },
    image: {width: '100%', height: 200, borderRadius: 8},
    removeImageButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f44336' + '20',
      alignItems: 'center',
    },
    removeImageText: {color: '#f44336', fontWeight: '600', fontSize: 14},
    imagePickerButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: palette.primary + '20',
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: palette.primary,
      borderStyle: 'dashed',
    },
    imagePickerText: {color: palette.primary, fontWeight: '600', fontSize: 16},
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
  });
