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
import {useImagePicker} from '../hooks/useImagePicker';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

type PriorityButtonProps = {
  value: Priority;
  current: Priority;
  onPress: (value: Priority) => void;
  styles: ReturnType<typeof useStyles>;
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

type ImageSectionProps = {
  imageUri: string;
  onPick: () => void;
  onRemove: () => void;
  styles: ReturnType<typeof useStyles>;
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
  const styles = useStyles(palette);
  const editingTask = route.params?.task;
  const {createTask, updateTask, isCreating, isUpdating} = useTasks();
  const {pickImage} = useImagePicker();

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(
    editingTask?.description || '',
  );
  const [priority, setPriority] = useState<Priority>(
    editingTask?.priority || 'medium',
  );
  const [imageUri, setImageUri] = useState(editingTask?.imageUri || '');

  useEffect(() => {
    if (editingTask) {navigation.setOptions({title: 'Edit Task'});}
  }, [editingTask, navigation]);

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
        status: editingTask?.status || 'pending',
        imageUri: imageUri || undefined,
      };
      if (editingTask) {await updateTask(editingTask.id, taskData);}
      else {await createTask(taskData);}
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
          {(['low', 'medium', 'high'] as Priority[]).map(p => (
            <PriorityButton
              key={p}
              value={p}
              current={priority}
              onPress={setPriority}
              styles={styles}
            />
          ))}
        </View>

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

const useStyles = (palette: Palette) =>
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
