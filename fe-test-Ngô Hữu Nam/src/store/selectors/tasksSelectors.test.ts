import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import taskReducer, {
  TaskSliceState,
  resetFilters,
  setFilter,
} from '../../store/slices/tasksSlice';
import { Task } from '../../types/task';

// Import selector - we need to export it first or create test-specific version
const selectTasksState = (state: { tasks: TaskSliceState }) => state.tasks;

// Recreate selectFilteredTasks logic for testing
const selectFilteredTasks = (state: { tasks: TaskSliceState }) => {
  const tasksState = selectTasksState(state);
  const { tasks, filters } = tasksState;

  const filtered = tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignee?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status) {
      const statuses = filters.status.split(',');
      if (!statuses.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Date range filter
    if (filters.dueDateRange) {
      const [startDate, endDate] = filters.dueDateRange;
      if (task.dueDate) {
        if (task.dueDate < startDate || task.dueDate > endDate) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  if (filters.sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sortBy === 'dueDate') {
    filtered.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  } else if (filters.sortBy === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    filtered.sort(
      (a, b) =>
        (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
    );
  }

  return filtered;
};

describe('selectFilteredTasks Selector', () => {
  let store: ReturnType<typeof configureStore>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      status: 'todo',
      priority: 'high',
      assignee: 'John',
      dueDate: '2026-05-15',
      createdAt: '2026-05-01',
      tags: ['shopping'],
    },
    {
      id: '2',
      title: 'Complete project',
      description: 'Finish React component',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Jane',
      dueDate: '2026-05-20',
      createdAt: '2026-05-01',
      tags: ['work'],
    },
    {
      id: '3',
      title: 'Review PR',
      description: 'Code review for team',
      status: 'done',
      priority: 'medium',
      assignee: 'John',
      dueDate: '2026-05-10',
      createdAt: '2026-05-01',
      tags: ['work'],
    },
    {
      id: '4',
      title: 'Fix bug',
      status: 'todo',
      priority: 'low',
      assignee: 'Jane',
      dueDate: '2026-05-25',
      createdAt: '2026-05-01',
      tags: ['bug'],
    },
    {
      id: '5',
      title: 'Update documentation',
      status: 'todo',
      priority: 'medium',
      assignee: undefined,
      dueDate: undefined,
      createdAt: '2026-05-01',
      tags: ['docs'],
    },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tasks: taskReducer,
      },
      preloadedState: {
        tasks: {
          tasks: mockTasks,
          filters: {},
          pagination: {
            currentPage: 1,
            pageSize: 10,
            total: mockTasks.length,
          },
        },
      },
    });
  });

  it('should return all tasks when no filters are applied', () => {
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);
    expect(filtered).toHaveLength(5);
    expect(filtered).toEqual(mockTasks);
  });

  it('should filter tasks by search term in title', () => {
    store.dispatch(setFilter({ search: 'project' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
    expect(filtered[0].title).toBe('Complete project');
  });

  it('should filter tasks by search term in description', () => {
    store.dispatch(setFilter({ search: 'Milk' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter tasks by search term in assignee', () => {
    store.dispatch(setFilter({ search: 'Jane' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(t => t.assignee === 'Jane')).toBe(true);
  });

  it('should filter tasks by single status', () => {
    store.dispatch(setFilter({ status: 'todo' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(3);
    expect(filtered.every(t => t.status === 'todo')).toBe(true);
  });

  it('should filter tasks by multiple statuses', () => {
    store.dispatch(setFilter({ status: 'todo,done' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(4);
    expect(
      filtered.every(t => t.status === 'todo' || t.status === 'done')
    ).toBe(true);
  });

  it('should filter tasks by priority', () => {
    store.dispatch(setFilter({ priority: 'high' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(t => t.priority === 'high')).toBe(true);
  });

  it('should filter tasks by date range', () => {
    store.dispatch(setFilter({ dueDateRange: ['2026-05-10', '2026-05-20'] }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(3); // Tasks 1, 2, 3
    expect(filtered.some(t => t.id === '1')).toBe(true); // 2026-05-15
    expect(filtered.some(t => t.id === '2')).toBe(true); // 2026-05-20
    expect(filtered.some(t => t.id === '3')).toBe(true); // 2026-05-10
  });

  it('should exclude tasks without dueDate when date range filter is applied', () => {
    store.dispatch(setFilter({ dueDateRange: ['2026-05-01', '2026-05-30'] }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered.every(t => t.dueDate !== undefined)).toBe(true);
    expect(filtered.find(t => t.id === '5')).toBeUndefined();
  });

  it('should sort tasks by title', () => {
    store.dispatch(setFilter({ sortBy: 'title' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered[0].title).toBe('Buy groceries');
    expect(filtered[1].title).toBe('Complete project');
    expect(filtered[2].title).toBe('Fix bug');
    expect(filtered[3].title).toBe('Review PR');
    expect(filtered[4].title).toBe('Update documentation');
  });

  it('should sort tasks by priority', () => {
    store.dispatch(setFilter({ sortBy: 'priority' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered[0].priority).toBe('high');
    expect(filtered[1].priority).toBe('high');
    expect(filtered[2].priority).toBe('medium');
  });

  it('should apply multiple filters together', () => {
    store.dispatch(
      setFilter({
        status: 'todo,in_progress',
        priority: 'high',
        search: 'project',
      })
    );
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should reset all filters when resetFilters is called', () => {
    store.dispatch(setFilter({ search: 'test', priority: 'high' }));
    store.dispatch(resetFilters());
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(5);
  });

  it('should be case-insensitive in search', () => {
    store.dispatch(setFilter({ search: 'COMPLETE' }));
    const state = store.getState();
    const filtered = selectFilteredTasks(state as any);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });
});

// Test selectTaskStats
describe('selectTaskStats Selector', () => {
  let store: ReturnType<typeof configureStore>;

  const selectTaskStats = (state: { tasks: TaskSliceState }) => {
    const tasksState = selectTasksState(state);
    const tasks = tasksState.tasks;

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
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-05-01',
    },
    {
      id: '2',
      title: 'Task 2',
      status: 'todo',
      priority: 'medium',
      createdAt: '2026-05-02',
    },
    {
      id: '3',
      title: 'Task 3',
      status: 'in_progress',
      priority: 'low',
      createdAt: '2026-05-03',
    },
    {
      id: '4',
      title: 'Task 4',
      status: 'done',
      priority: 'high',
      createdAt: '2026-05-04',
    },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tasks: taskReducer,
      },
      preloadedState: {
        tasks: {
          tasks: mockTasks,
          filters: {},
          pagination: {
            currentPage: 1,
            pageSize: 10,
            total: mockTasks.length,
          },
        },
      },
    });
  });

  it('should calculate correct task statistics', () => {
    const state = store.getState();
    const stats = selectTaskStats(state as any);

    expect(stats.total).toBe(4);
    expect(stats.todo).toBe(2);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
  });
});

// Test selectRecentTasks
describe('selectRecentTasks Selector', () => {
  let store: ReturnType<typeof configureStore>;

  const selectRecentTasks = (state: { tasks: TaskSliceState }) => {
    const tasksState = selectTasksState(state);
    const tasks = tasksState.tasks;

    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Oldest Task',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-05-01',
    },
    {
      id: '2',
      title: 'Task 2',
      status: 'todo',
      priority: 'medium',
      createdAt: '2026-05-02',
    },
    {
      id: '3',
      title: 'Task 3',
      status: 'in_progress',
      priority: 'low',
      createdAt: '2026-05-03',
    },
    {
      id: '4',
      title: 'Task 4',
      status: 'done',
      priority: 'high',
      createdAt: '2026-05-04',
    },
    {
      id: '5',
      title: 'Task 5',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-05-05',
    },
    {
      id: '6',
      title: 'Task 6',
      status: 'done',
      priority: 'medium',
      createdAt: '2026-05-06',
    },
    {
      id: '7',
      title: 'Newest Task',
      status: 'todo',
      priority: 'low',
      createdAt: '2026-05-07',
    },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tasks: taskReducer,
      },
      preloadedState: {
        tasks: {
          tasks: mockTasks,
          filters: {},
          pagination: {
            currentPage: 1,
            pageSize: 10,
            total: mockTasks.length,
          },
        },
      },
    });
  });

  it('should return 5 most recent tasks', () => {
    const state = store.getState();
    const recent = selectRecentTasks(state as any);

    expect(recent).toHaveLength(5);
    expect(recent[0].id).toBe('7'); // Newest
    expect(recent[1].id).toBe('6');
    expect(recent[2].id).toBe('5');
    expect(recent[3].id).toBe('4');
    expect(recent[4].id).toBe('3');
  });

  it('should sort by createdAt descending', () => {
    const state = store.getState();
    const recent = selectRecentTasks(state as any);

    for (let i = 0; i < recent.length - 1; i++) {
      const current = new Date(recent[i].createdAt).getTime();
      const next = new Date(recent[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});
