import {useEffect, useState} from 'react';
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
import {Priority} from '../types/task';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Palette, useTheme} from '../theme/designSystem.ts';
import {useTasks} from '../hooks/useTasks';
import {useCategories} from '../hooks/useCategories';
import {useImagePicker} from '../hooks/useImagePicker';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

export default function TaskFormScreen({ navigation, route }: Props) {
  const { palette } = useTheme();
  const styles = useStyles(palette);
  const editingTask = route.params?.task;
  const { createTask, updateTask, isCreating, isUpdating } = useTasks();
  const { categories } = useCategories();
  const { pickImage } = useImagePicker();

  console.log('🏗️ TaskFormScreen: categories count:', categories.length, 'categories:', categories);

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(
    editingTask?.description || ''
  );
  const [priority, setPriority] = useState<Priority>(
    editingTask?.priority || 'medium'
  );
  const [category, setCategory] = useState(editingTask?.category || '');
  const [imageUri, setImageUri] = useState(editingTask?.imageUri || '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (editingTask) {
      navigation.setOptions({ title: 'Edit Task' });
    }
  }, [editingTask, navigation]);

  const handleImagePick = async () => {
    try {
      console.log('🖼️ TaskFormScreen: handleImagePick called');
      const result = await pickImage();
      console.log('🖼️ TaskFormScreen: pickImage result:', result);
      if (result) {
        console.log('🖼️ TaskFormScreen: Setting image URI:', result.uri);
        setImageUri(result.uri);
      } else {
        console.log('🖼️ TaskFormScreen: pickImage returned null');
      }
    } catch (error) {
      console.error('❌ TaskFormScreen: Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    setImageUri('');
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    try {
      if (editingTask) {
        // Обновляем существующую задачу
        await updateTask(editingTask.id, {
          title,
          description,
          priority,
          status: editingTask.status,
          category: category || undefined,
          imageUri: imageUri || undefined,
        });
      } else {
        // Создаем новую задачу
        await createTask({
          title,
          description,
          priority,
          status: 'pending',
          category: category || undefined,
          imageUri: imageUri || undefined,
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save task:', error);
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

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={[styles.input, styles.categoryPicker]}
          onPress={() => {
            console.log('📂 TaskFormScreen: Category button pressed, current categories:', categories.length);
            setShowCategoryPicker(!showCategoryPicker);
          }}
        >
          <Text style={styles.categoryPickerText}>
            {category
              ? categories.find((c) => c.id === category)?.name || 'Select category'
              : 'Select category'}
          </Text>
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.categoryDropdown}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryOption}
                onPress={() => {
                  setCategory(cat.id);
                  setShowCategoryPicker(false);
                }}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: cat.color },
                  ]}
                />
                <Text style={styles.categoryOptionText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Image</Text>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePick}
          >
            <Text style={styles.imagePickerText}>📸 Add Image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSave}
        disabled={isCreating || isUpdating}
      >
        <Text style={styles.saveButtonText}>
          {isCreating || isUpdating ? 'Saving...' : 'Save Task'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const useStyles = (palette: Palette) =>
  StyleSheet.create({
    container: { padding: 16, flex: 1, backgroundColor: palette.background },
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
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
    },
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
    priorityText: {
      fontSize: 12,
      color: palette.text,
      fontWeight: '600',
    },
    priorityTextActive: {
      color: palette.text === '#fff' ? '#121212' : '#fff',
      fontWeight: '700',
    },
    categoryPicker: {
      justifyContent: 'center',
    },
    categoryPickerText: {
      color: palette.text,
      fontSize: 16,
    },
    categoryDropdown: {
      backgroundColor: palette.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.text + '20',
      marginBottom: 12,
      overflow: 'hidden',
    },
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.text + '10',
    },
    categoryDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    categoryOptionText: {
      fontSize: 14,
      color: palette.text,
    },
    imageContainer: {
      marginBottom: 12,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: palette.secondary,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    removeImageButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f44336' + '20',
      alignItems: 'center',
    },
    removeImageText: {
      color: '#f44336',
      fontWeight: '600',
      fontSize: 14,
    },
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
    imagePickerText: {
      color: palette.primary,
      fontWeight: '600',
      fontSize: 16,
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
  });
