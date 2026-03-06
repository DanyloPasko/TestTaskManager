export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum Status {
  Pending = 'pending',
  Completed = 'completed',
}

export enum SyncStatus {
  Synced = 'synced',
  Pending = 'pending',
  Error = 'error',
}

export enum Category {
  Work = 'work',
  Personal = 'personal',
  Shopping = 'shopping',
  Other = 'other',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: Category;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  imageUri?: string;
  syncStatus?: SyncStatus;
}

export type CreateTaskInput = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'syncStatus'
>;
