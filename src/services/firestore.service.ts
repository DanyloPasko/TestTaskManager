import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {CreateTaskInput, Task} from '../types/task';
import {FIRESTORE_COLLECTIONS} from '../config/firebase';

const tasksCollection = firestore().collection(FIRESTORE_COLLECTIONS.TASKS);

const convertTimestamp = (timestamp: any): string =>
  timestamp?.toDate
    ? timestamp.toDate().toISOString()
    : timestamp || new Date().toISOString();

const fromFirestoreTask = (
  doc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
): Task => {
  const data = doc.data() as any;
  return {
    ...data,
    id: doc.id,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    syncStatus: 'synced',
  } as Task;
};

const buildSafeUpdates = (
  updates: Partial<CreateTaskInput>,
): Record<string, any> => {
  const safeUpdates: Record<string, any> = {};
  if (updates.title !== undefined) {safeUpdates.title = updates.title;}
  if (updates.description !== undefined)
    {safeUpdates.description = updates.description;}
  if (updates.status !== undefined) {safeUpdates.status = updates.status;}
  if (updates.priority !== undefined) {safeUpdates.priority = updates.priority;}
  if (updates.category !== undefined) {safeUpdates.category = updates.category;}
  if (updates.imageUri !== undefined) {safeUpdates.imageUri = updates.imageUri;}
  safeUpdates.updatedAt = firestore.FieldValue.serverTimestamp();
  return safeUpdates;
};

const createTask = async (taskData: CreateTaskInput): Promise<Task> => {
  if (!taskData.title?.trim()) {throw new Error('Task title is required');}
  if (!taskData.priority) {throw new Error('Task priority is required');}
  if (!taskData.status) {throw new Error('Task status is required');}

  const docRef = await tasksCollection.add({
    title: taskData.title,
    description: taskData.description || '',
    priority: taskData.priority,
    status: taskData.status,
    category: taskData.category || '',
    imageUri: taskData.imageUri || '',
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot);
};

const getTasks = async (): Promise<Task[]> => {
  const snapshot = await tasksCollection.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc =>
    fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot),
  );
};

const getTaskById = async (id: string): Promise<Task | null> => {
  const doc = await tasksCollection.doc(id).get();
  if (!doc.exists) {return null;}
  return fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot);
};

const updateTask = async (
  id: string,
  updates: Partial<CreateTaskInput>,
): Promise<void> => {
  await tasksCollection.doc(id).update(buildSafeUpdates(updates));
};

const deleteTask = async (id: string): Promise<void> => {
  const doc = await tasksCollection.doc(id).get();
  if (!doc.exists) {return;}
  await tasksCollection.doc(id).delete();
};

const subscribeToTasks = (callback: (tasks: Task[]) => void): (() => void) => {
  return tasksCollection.orderBy('createdAt', 'desc').onSnapshot(
    snapshot => {
      const tasks = snapshot.docs.map(doc =>
        fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot),
      );
      callback(tasks);
    },
    error => console.error('Error in tasks subscription:', error),
  );
};

const uploadImage = async (
  taskId: string,
  imageUri: string,
): Promise<string> => {
  const filename = `tasks/${taskId}/${Date.now()}.jpg`;
  const reference = storage().ref(filename);
  await reference.putFile(imageUri);
  return reference.getDownloadURL();
};

const deleteImage = async (imageUrl: string): Promise<void> => {
  const reference = storage().refFromURL(imageUrl);
  await reference.delete();
};

const batchUpdateTasks = async (
  tasks: {id: string; updates: Partial<CreateTaskInput>}[],
): Promise<void> => {
  const batch = firestore().batch();
  tasks.forEach(({id, updates}) => {
    const docRef = tasksCollection.doc(id);
    batch.update(docRef, buildSafeUpdates(updates));
  });
  await batch.commit();
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  subscribeToTasks,
  uploadImage,
  deleteImage,
  batchUpdateTasks,
};
