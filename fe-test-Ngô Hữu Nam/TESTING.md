# Unit Testing Guide - TaskBoard

Hướng dẫn comprehensive về unit testing cho dự án TaskBoard của bạn.

## 📋 Cài đặt & Khởi động

### 1. Cài đặt Dependencies

```bash
npm install
```

Các testing libraries được thêm:

- **vitest**: Fast unit test framework (Vite-native)
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: Realistic user interaction simulation
- **jsdom**: DOM environment for tests

### 2. Chạy Tests

#### Run all tests

```bash
npm test
```

#### Run tests in UI mode (interactive)

```bash
npm run test:ui
```

#### Run tests with coverage report

```bash
npm run test:coverage
```

#### Run specific test file

```bash
npm test -- tasksSelectors.test.ts
```

#### Watch mode (re-run on file changes)

```bash
npm test -- --watch
```

---

## 🧪 Tests Included

### 1. **Selector Tests** (`src/store/selectors/tasksSelectors.test.ts`)

Kiểm thử Redux selector `selectFilteredTasks` với các scenarios:

#### Test Coverage:

- ✅ Return all tasks when no filters applied
- ✅ Filter by search term in title
- ✅ Filter by search term in description
- ✅ Filter by search term in assignee
- ✅ Filter by single status
- ✅ Filter by multiple statuses (comma-separated)
- ✅ Filter by priority
- ✅ Filter by date range
- ✅ Exclude tasks without dueDate in range filter
- ✅ Sort by title
- ✅ Sort by priority
- ✅ Combine multiple filters
- ✅ Reset all filters
- ✅ Case-insensitive search

**Tại sao kiểm thử Selectors?**

- Selectors là business logic của Redux
- Đảm bảo filtering, sorting, pagination hoạt động chính xác
- Memoized selectors cải thiện performance
- Dễ test vì pure functions

### 2. **Component Tests** (`src/features/tasks/CreateTaskModal.test.tsx`)

Kiểm thử CreateTaskModal component:

#### Test Coverage:

- ✅ Render modal khi `open={true}`
- ✅ Display "Create New Task" title cho new task
- ✅ Display "Edit Task" title khi editing
- ✅ Display "Create" button cho new task
- ✅ Display "Update" button khi editing
- ✅ Have all required form fields
- ✅ Call onClose khi click Cancel
- ✅ Populate form fields từ existing task
- ✅ Validate required title field
- ✅ Validate required status field
- ✅ Validate required priority field
- ✅ Submit form with valid data
- ✅ Clear form fields khi modal closes
- ✅ Format due date correctly
- ✅ Generate unique id cho new tasks
- ✅ Use existing id khi editing
- ✅ Preserve createdAt khi editing
- ✅ Set current date cho new tasks

**Tại sao kiểm thử Components?**

- Đảm bảo UI render chính xác
- Validate user interactions
- Test form validation logic
- Catch regression bugs

### 3. **Context Tests** (`src/context/ThemeContext.test.tsx`)

Kiểm thử ThemeContext và useTheme hook:

#### Test Coverage:

- ✅ Render with light mode as default
- ✅ Toggle theme khi click button
- ✅ Persist theme to localStorage
- ✅ Add dark-mode class to document
- ✅ Remove dark-mode class khi switch back
- ✅ Restore theme từ localStorage
- ✅ Use system preference when localStorage empty
- ✅ Throw error khi useTheme outside provider
- ✅ Maintain state across multiple toggles

**Tại sao kiểm thử Context?**

- Context API quản lý global state (theme)
- Ensure persistence hoạt động
- Verify DOM class manipulation
- Test error boundaries

---

## 📁 File Structure

```
src/
├── test/
│   ├── setup.ts              # Test setup (localStorage mock, etc)
│   └── test-utils.tsx        # Redux-aware render utilities
├── store/
│   ├── selectors/
│   │   ├── tasksSelectors.ts
│   │   └── tasksSelectors.test.ts    # ✅ NEW
│   └── slices/
│       └── tasksSlice.ts
├── features/
│   └── tasks/
│       ├── CreateTaskModal.tsx
│       └── CreateTaskModal.test.tsx  # ✅ NEW
├── context/
│   ├── ThemeContext.tsx
│   └── ThemeContext.test.tsx        # ✅ NEW
└── ...
```

---

## 🛠️ Vitest Configuration

File: `vitest.config.ts`

```typescript
{
  globals: true,                // Use global test API (describe, it, expect)
  environment: 'jsdom',         // DOM environment
  setupFiles: ['./src/test/setup.ts'],  // Run setup file before tests
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html']
  }
}
```

---

## 📝 Writing Your Own Tests

### Pattern 1: Redux Selector Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import taskReducer from '../../store/slices/tasksSlice';

describe('My Selector', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tasks: taskReducer,
      },
      preloadedState: {
        tasks: {
          tasks: [
            /* mock data */
          ],
          filters: {},
          pagination: { currentPage: 1, pageSize: 10, total: 1 },
        },
      },
    });
  });

  it('should do something', () => {
    const state = store.getState();
    // Test your selector
    expect(result).toEqual(expected);
  });
});
```

### Pattern 2: Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render and interact', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(<MyComponent onSubmit={mockCallback} />);

    const button = screen.getByRole('button', { name: 'Submit' });
    await user.click(button);

    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### Pattern 3: Hook Test

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe(expectedValue);
  });
});
```

---

## 🔍 Best Practices

### 1. **Test Behavior, Not Implementation**

```typescript
// ❌ BAD - Testing implementation detail
expect(component.state.isDarkMode).toBe(true);

// ✅ GOOD - Testing behavior/output
expect(screen.getByText('Dark Mode')).toBeInTheDocument();
```

### 2. **Use User Events Over FireEvent**

```typescript
// ❌ LESS REALISTIC
fireEvent.click(button);

// ✅ MORE REALISTIC
const user = userEvent.setup();
await user.click(button);
```

### 3. **Use Semantic Queries**

```typescript
// ❌ FRAGILE
screen.getByTestId('my-button');

// ✅ ROBUST
screen.getByRole('button', { name: 'Submit' });
```

### 4. **Test Happy Path + Edge Cases**

```typescript
describe('Form', () => {
  it('should submit with valid data', () => {
    // Happy path
  });

  it('should show error for empty title', () => {
    // Edge case
  });

  it('should handle special characters', () => {
    // Edge case
  });
});
```

### 5. **Keep Tests Focused**

```typescript
// ❌ TOO MANY ASSERTIONS
it('should do everything', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
  expect(d).toBe(4);
});

// ✅ FOCUSED
it('should calculate total correctly', () => {
  expect(calculateTotal([1, 2, 3])).toBe(6);
});
```

---

## 📊 Coverage Goals

Recommend coverage targets:

| Category   | Target |
| ---------- | ------ |
| Statements | 80%+   |
| Branches   | 75%+   |
| Functions  | 80%+   |
| Lines      | 80%+   |

View coverage report:

```bash
npm run test:coverage
# Opens ./coverage/index.html
```

---

## 🐛 Debugging Tests

### Run single test file

```bash
npm test -- CreateTaskModal.test.tsx
```

### Run specific test case

```bash
npm test -- -t "should toggle theme"
```

### Enable debug mode

```typescript
import { render, screen } from '@testing-library/react';

render(<Component />);
screen.debug(); // Prints current DOM
```

### Use debugger

```typescript
it('should debug', () => {
  debugger; // Will pause if test runner supports it
  // your test code
});
```

---

## 🚀 CI/CD Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Redux Testing](https://redux.js.org/usage/writing-tests)

---

## ❓ FAQ

**Q: Why Vitest over Jest?**
A: Vitest is Vite-native, faster, and uses same API as Jest

**Q: Should I test everything?**
A: Focus on critical paths: Redux logic, validation, user interactions

**Q: How many tests are enough?**
A: Aim for 80%+ coverage on core business logic

**Q: Can I test async operations?**
A: Yes, use `async/await` and `waitFor()` helper

---

Chúc bạn viết test hiệu quả! 🎯
