import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateTaskModal from '../../features/tasks/CreateTaskModal';
import { Task } from '../../types/task';

describe('CreateTaskModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    editingTask: null,
    onSubmit: mockOnSubmit,
  };

  const mockTask: Task = {
    id: '1',
    title: 'Existing Task',
    description: 'Task description',
    status: 'in_progress' as const,
    priority: 'high' as const,
    assignee: 'John Doe',
    dueDate: '2026-05-20',
    createdAt: '2026-05-01',
    tags: ['urgent'],
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should render modal when open is true', () => {
    render(<CreateTaskModal {...defaultProps} />);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('should render "Create New Task" title when editingTask is null', () => {
    render(<CreateTaskModal {...defaultProps} />);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('should render "Edit Task" title when editingTask is provided', () => {
    render(<CreateTaskModal {...defaultProps} editingTask={mockTask} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('should render "Create" button text when creating new task', () => {
    render(<CreateTaskModal {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeInTheDocument();
  });

  it('should render "Update" button text when editing task', () => {
    render(<CreateTaskModal {...defaultProps} editingTask={mockTask} />);
    const submitButton = screen.getByRole('button', { name: 'Update' });
    expect(submitButton).toBeInTheDocument();
  });

  it('should have all required form fields', () => {
    render(<CreateTaskModal {...defaultProps} />);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<CreateTaskModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should populate form fields when editing existing task', async () => {
    render(<CreateTaskModal {...defaultProps} editingTask={mockTask} />);

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      'Description'
    ) as HTMLTextAreaElement;

    await waitFor(() => {
      expect(titleInput.value).toBe('Existing Task');
      expect(descriptionInput.value).toBe('Task description');
    });
  });

  it('should require title field', async () => {
    render(<CreateTaskModal {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: 'Create' });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter task title/)).toBeInTheDocument();
    });
  });

  it('should require status field', async () => {
    render(<CreateTaskModal {...defaultProps} />);
    const titleInput = screen.getByLabelText('Title');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select status/)).toBeInTheDocument();
    });
  });

  it('should require priority field', async () => {
    render(<CreateTaskModal {...defaultProps} />);
    const titleInput = screen.getByLabelText('Title');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'todo' } });

    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select priority/)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const statusSelect = screen.getByLabelText('Status');

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'Task description');
    fireEvent.change(statusSelect, { target: { value: 'todo' } });

    // Select priority via radio button
    const priorityRadios = screen.getAllByRole('radio');
    fireEvent.click(priorityRadios[0]); // Select first priority option

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should clear form fields when modal closes', async () => {
    const { rerender } = render(<CreateTaskModal {...defaultProps} />);
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    expect(titleInput.value).toBe('Test Task');

    // Close modal
    rerender(<CreateTaskModal {...defaultProps} open={false} />);

    // Reopen modal
    rerender(<CreateTaskModal {...defaultProps} open={true} />);

    const newTitleInput = screen.getByLabelText('Title') as HTMLInputElement;
    expect(newTitleInput.value).toBe('');
  });

  it('should format due date correctly when submitting', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const statusSelect = screen.getByLabelText('Status');

    await user.type(titleInput, 'New Task');
    fireEvent.change(statusSelect, { target: { value: 'todo' } });

    const priorityRadios = screen.getAllByRole('radio');
    fireEvent.click(priorityRadios[0]);

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const submittedTask = mockOnSubmit.mock.calls[0][0];
      expect(submittedTask).toHaveProperty('dueDate', undefined);
    });
  });

  it('should generate unique id for new tasks', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const statusSelect = screen.getByLabelText('Status');

    await user.type(titleInput, 'New Task');
    fireEvent.change(statusSelect, { target: { value: 'todo' } });

    const priorityRadios = screen.getAllByRole('radio');
    fireEvent.click(priorityRadios[0]);

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      const submittedTask = mockOnSubmit.mock.calls[0][0];
      expect(submittedTask.id).toBeDefined();
      expect(submittedTask.id).not.toBe('');
    });
  });

  it('should use existing task id when editing', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} editingTask={mockTask} />);

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;

    // Clear and update title
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    const submitButton = screen.getByRole('button', { name: 'Update' });
    await user.click(submitButton);

    await waitFor(() => {
      const submittedTask = mockOnSubmit.mock.calls[0][0];
      expect(submittedTask.id).toBe('1'); // Same as original task
    });
  });

  it('should preserve createdAt when editing task', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} editingTask={mockTask} />);

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    const submitButton = screen.getByRole('button', { name: 'Update' });
    await user.click(submitButton);

    await waitFor(() => {
      const submittedTask = mockOnSubmit.mock.calls[0][0];
      expect(submittedTask.createdAt).toBe('2026-05-01');
    });
  });

  it('should set current date for createdAt when creating new task', async () => {
    const user = userEvent.setup();
    render(<CreateTaskModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const statusSelect = screen.getByLabelText('Status');

    await user.type(titleInput, 'New Task');
    fireEvent.change(statusSelect, { target: { value: 'todo' } });

    const priorityRadios = screen.getAllByRole('radio');
    fireEvent.click(priorityRadios[0]);

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    await waitFor(() => {
      const submittedTask = mockOnSubmit.mock.calls[0][0];
      expect(submittedTask.createdAt).toBeDefined();
      // Should be today's date
      const today = new Date().toISOString().split('T')[0];
      expect(submittedTask.createdAt).toBe(today);
    });
  });
});
