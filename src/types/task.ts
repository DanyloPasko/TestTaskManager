export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: string;
  createdAt: string;
  updatedAt: string;
  imageUri?: string; // Local image path
  syncStatus?: SyncStatus;
}
