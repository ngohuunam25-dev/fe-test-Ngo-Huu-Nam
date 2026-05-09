import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Test component that uses the useTheme hook
const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-status">
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove dark-mode class from document
    document.documentElement.classList.remove('dark-mode');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
  });

  it('should render with light mode as default', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValueOnce({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
  });

  it('should toggle theme when button is clicked', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle Theme' });
    const themeStatus = screen.getByTestId('theme-status');

    expect(themeStatus).toHaveTextContent('Light Mode');

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(themeStatus).toHaveTextContent('Dark Mode');
    });
  });

  it('should persist theme to localStorage', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle Theme' });

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(localStorage.getItem('theme-mode')).toBe('dark');
    });
  });

  it('should add dark-mode class to document when dark mode is enabled', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle Theme' });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        true
      );
    });
  });

  it('should remove dark-mode class when switching back to light mode', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle Theme' });

    // Toggle to dark mode
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        true
      );
    });

    // Toggle back to light mode
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        false
      );
    });
  });

  it('should restore theme from localStorage on render', () => {
    localStorage.setItem('theme-mode', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('Dark Mode');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should use system preference when localStorage is empty', () => {
    // Note: setup.ts already mocks matchMedia with matches: false
    // So the default behavior is already light mode
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('Light Mode');
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const TestOutsideProvider = () => {
      useTheme();
      return null;
    };

    expect(() => {
      render(<TestOutsideProvider />);
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleErrorSpy.mockRestore();
  });

  it('should maintain theme state across multiple toggles', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle Theme' });
    const themeStatus = screen.getByTestId('theme-status');

    // Toggle 1
    fireEvent.click(toggleButton);
    await waitFor(() => expect(themeStatus).toHaveTextContent('Dark Mode'));

    // Toggle 2
    fireEvent.click(toggleButton);
    await waitFor(() => expect(themeStatus).toHaveTextContent('Light Mode'));

    // Toggle 3
    fireEvent.click(toggleButton);
    await waitFor(() => expect(themeStatus).toHaveTextContent('Dark Mode'));

    expect(localStorage.getItem('theme-mode')).toBe('dark');
  });
});
