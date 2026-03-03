import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Task } from '../types/task';
import { FIRESTORE_COLLECTIONS } from '../config/firebase';

export interface FirestoreTask extends Omit<Task, 'createdAt' | 'updatedAt'> {
  createdAt: any;
  updatedAt: any;
  syncStatus?: 'synced' | 'pending' | 'error';
}

class FirestoreService {
  private tasksCollection = firestore().collection(FIRESTORE_COLLECTIONS.TASKS);

  // Convert Firestore timestamp to ISO string
  private convertTimestamp(timestamp: any): string {
    if (timestamp?.toDate) {
      return timestamp.toDate().toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  // Convert Task to Firestore format
  private toFirestoreTask(task: Task): FirestoreTask {
    return {
      ...task,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      syncStatus: 'synced',
    };
  }

  // Convert Firestore task to app Task format
  private fromFirestoreTask(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>): Task {
    const data = doc.data() as FirestoreTask;
    return {
      ...data,
      id: doc.id,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    } as Task;
  }

  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const docRef = await this.tasksCollection.add({
        ...task,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        syncStatus: 'synced',
      });

      const doc = await docRef.get();
      return this.fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const snapshot = await this.tasksCollection
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => this.fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const doc = await this.tasksCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return this.fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Update task
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      await this.tasksCollection.doc(id).update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        syncStatus: 'synced',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      await this.tasksCollection.doc(id).delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Subscribe to tasks changes (real-time updates)
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    const unsubscribe = this.tasksCollection
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const tasks = snapshot.docs.map(doc =>
            this.fromFirestoreTask(doc as FirebaseFirestoreTypes.QueryDocumentSnapshot)
          );
          callback(tasks);
        },
        error => {
          console.error('Error in tasks subscription:', error);
        }
      );

    return unsubscribe;
  }

  // Upload image to Firebase Storage
  async uploadImage(taskId: string, imageUri: string): Promise<string> {
    try {
      const filename = `tasks/${taskId}/${Date.now()}.jpg`;
      const reference = storage().ref(filename);

      await reference.putFile(imageUri);
      const url = await reference.getDownloadURL();

      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const reference = storage().refFromURL(imageUrl);
      await reference.delete();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Batch operations for offline sync
  async batchUpdateTasks(tasks: { id: string; updates: Partial<Task> }[]): Promise<void> {
    try {
      const batch = firestore().batch();

      tasks.forEach(({ id, updates }) => {
        const docRef = this.tasksCollection.doc(id);
        batch.update(docRef, {
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          syncStatus: 'synced',
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}

export default new FirestoreService();
