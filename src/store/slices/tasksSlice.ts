import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockTasks } from '../../seeds/tasksMock';
import { Task } from '../../types/task';
export interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}
export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  dueDateRange?: [string, string];
  sortBy?: 'title' | 'dueDate' | 'priority';
}
export interface TaskSliceState {
  tasks: Task[];
  filters: TaskFilters;
  pagination: Pagination;
}
const initialState: TaskSliceState = {
  tasks: mockTasks,
  filters: {},
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: mockTasks.length,
  },
};
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
      state.pagination.total = state.tasks.length;
    },
    updateTask(state, action: PayloadAction<Task>) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.pagination.total = state.tasks.length;
    },
    deleteManyTasks(state, action: PayloadAction<string[]>) {
      const toDelete = new Set(action.payload);
      state.tasks = state.tasks.filter(t => !toDelete.has(t.id));
      state.pagination.total = state.tasks.length;
    },
    updateTaskStatus(
      state,
      action: PayloadAction<{ id: string; status: Task['status'] }>
    ) {
      const { id, status } = action.payload;
      const t = state.tasks.find(s => s.id === id);
      if (t) t.status = status;
    },
    setFilter(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    resetFilters(state) {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  deleteManyTasks,
  updateTaskStatus,
  setFilter,
  resetFilters,
  setPage,
} = taskSlice.actions;

export default taskSlice.reducer;
