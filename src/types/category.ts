export type CategoryColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange';

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
  description?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface TaskFilter {
  status?: 'pending' | 'completed' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  category?: string; // category ID or 'all'
  searchText?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
