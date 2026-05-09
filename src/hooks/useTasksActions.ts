import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTasksSelectors } from '../store/selectors/tasksSelectors';
import {
  addTask,
  deleteManyTasks,
  deleteTask,
  resetFilters,
  setFilter,
  setPage,
  updateTask,
  updateTaskStatus,
} from '../store/slices/tasksSlice';
import { Task } from '../types/task';

export const useTasksActions = () => {
  const dispatch = useDispatch();

  // Selectors
  const {
    pagination,
    filters,
    stats,
    paginatedTasks,
    allTasks,
    filteredTasks,
  } = useTasksSelectors();

  // Actions
  const onAddTask = useCallback(
    (task: Task) => {
      dispatch(addTask(task));
    },
    [dispatch]
  );

  const onUpdateTask = useCallback(
    (task: Task) => {
      dispatch(updateTask(task));
    },
    [dispatch]
  );

  const onDeleteTask = useCallback(
    (taskId: string) => {
      dispatch(deleteTask(taskId));
    },
    [dispatch]
  );

  const onDeleteManyTasks = useCallback(
    (taskIds: string[]) => {
      dispatch(deleteManyTasks(taskIds));
    },
    [dispatch]
  );

  const onUpdateTaskStatus = useCallback(
    (taskId: string, status: Task['status']) => {
      dispatch(updateTaskStatus({ id: taskId, status }));
    },
    [dispatch]
  );

  const onSetSearch = useCallback(
    (search: string) => {
      dispatch(setFilter({ search }));
    },
    [dispatch]
  );

  const onSetSort = useCallback(
    (sortBy?: 'title' | 'dueDate' | 'priority') => {
      dispatch(setPage(1));
      dispatch(setFilter({ sortBy }));
    },
    [dispatch]
  );

  const onSetStatusFilter = useCallback(
    (status?: string[]) => {
      dispatch(setPage(1));
      dispatch(
        setFilter({
          status: status && status.length > 0 ? status.join(',') : undefined,
        })
      );
    },
    [dispatch]
  );

  const onSetPriorityFilter = useCallback(
    (priority?: string) => {
      dispatch(setPage(1));
      dispatch(setFilter({ priority }));
    },
    [dispatch]
  );

  const onSetDateRangeFilter = useCallback(
    (dateRange?: [string, string]) => {
      dispatch(setPage(1));
      dispatch(setFilter({ dueDateRange: dateRange }));
    },
    [dispatch]
  );

  const onSetPage = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const onResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  return {
    // State
    allTasks,
    paginatedTasks,
    filteredTasks,
    stats,
    filters,
    pagination,
    // Actions
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    onDeleteManyTasks,
    onUpdateTaskStatus,
    onSetSearch,
    onSetSort,
    onSetStatusFilter,
    onSetPriorityFilter,
    onSetDateRangeFilter,
    onSetPage,
    onResetFilters,
  };
};
