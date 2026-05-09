import { createSelector } from '@reduxjs/toolkit';
import { useAppSelector } from '../hooks';
import { RootState } from '../index';
import { TaskSliceState } from '../slices/tasksSlice';

// Base selector
const selectTasksState = (state: RootState): TaskSliceState => state.tasks;

// Basic selectors
const selectAllTasks = createSelector(
  [selectTasksState],
  tasksState => tasksState.tasks
);

const selectTaskFilters = createSelector(
  [selectTasksState],
  tasksState => tasksState.filters
);

const selectPagination = createSelector(
  [selectTasksState],
  tasksState => tasksState.pagination
);

// Filtered tasks
const selectFilteredTasks = createSelector(
  [selectAllTasks, selectTaskFilters],
  (tasks, filters) => {
    const filtered = tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignee?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Handle multi-select status filter
      if (filters.status) {
        const statuses = filters.status.split(',');
        if (!statuses.includes(task.status)) {
          return false;
        }
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.dueDateRange) {
        const [startDate, endDate] = filters.dueDateRange;
        if (task.dueDate) {
          if (task.dueDate < startDate || task.dueDate > endDate) {
            return false;
          }
        } else {
          // Nếu task không có due date, loại bỏ nó khỏi filter
          return false;
        }
      }

      return true;
    });

    //   Apply sorting
    if (filters.sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'dueDate') {
      filtered.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    } else if (filters.sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      filtered.sort(
        (a, b) =>
          (priorityOrder[a.priority] || 999) -
          (priorityOrder[b.priority] || 999)
      );
    }
    return filtered;
  }
);

// Paginated tasks
const selectPaginatedTasks = createSelector(
  [selectFilteredTasks, selectPagination],
  (filteredTasks, pagination) => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredTasks.slice(start, end);
  }
);

// Status statistics
const selectTaskStats = createSelector([selectAllTasks], tasks => {
  const stats = {
    total: tasks.length,
    todo: 0,
    in_progress: 0,
    done: 0,
  };

  tasks.forEach(task => {
    if (task.status === 'todo') stats.todo++;
    else if (task.status === 'in_progress') stats.in_progress++;
    else if (task.status === 'done') stats.done++;
  });

  return stats;
});

// Recent tasks - 5 most recently created
const selectRecentTasks = createSelector([selectAllTasks], tasks => {
  return [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
});

export const useTasksSelectors = () => {
  const allTasks = useAppSelector(selectAllTasks);
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const filters = useAppSelector(selectTaskFilters);
  const paginatedTasks = useAppSelector(selectPaginatedTasks);
  const stats = useAppSelector(selectTaskStats);
  const pagination = useAppSelector(selectPagination);
  const recentTasks = useAppSelector(selectRecentTasks);

  return {
    allTasks,
    filteredTasks,
    paginatedTasks,
    filters,
    pagination,
    stats,
    recentTasks,
  };
};
