import {
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Dropdown,
  Input,
  MenuProps,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import ConfirmModal from '../features/tasks/CofirmModal';
import CreateTaskModal from '../features/tasks/CreateTaskModal';
import useDebounceInput from '../hooks/useDebounceInput';
import { useTasksActions } from '../hooks/useTasksActions';
import { Task } from '../types/task';

const TaskPage: React.FC = () => {
  const {
    pagination,
    paginatedTasks,
    filters,
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
  } = useTasksActions();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  // Handle status change
  const handleStatusChange = (task: Task, newStatus: string) => {
    onUpdateTaskStatus(task.id, newStatus as Task['status']);
    const statusLabel = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
    }[newStatus as keyof typeof statusLabelMap];
    message.success(`Task ${task?.title} status changed to "${statusLabel}"`);
  };

  const statusLabelMap: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  // Priority tag color mapping
  const priorityTagColorMap: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  };

  const priorityLabelMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  // Handlers
  const handleCreateNew = () => {
    setEditingTask(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setCreateModalOpen(true);
  };

  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId);
    setConfirmModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select tasks to delete');
      return;
    }
    setDeleteTaskId(
      selectedRowKeys.length > 1 ? 'bulk' : String(selectedRowKeys[0])
    );
    setConfirmModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleCreateTaskSubmit = (task: Task) => {
    if (editingTask) {
      onUpdateTask(task);
      message.success(`Task "${task.title}" updated successfully`);
    } else {
      onAddTask(task);
      message.success(`Task "${task.title}" created successfully`);
    }
    setCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTaskId === 'bulk') {
      const keysToDelete = selectedRowKeys.map(String);
      onDeleteManyTasks(keysToDelete);
      message.success(`${selectedRowKeys.length} tasks deleted successfully`);
    } else if (deleteTaskId) {
      onDeleteTask(deleteTaskId);
      message.success('Task deleted successfully');
    }
    setSelectedRowKeys([]);
    setConfirmModalOpen(false);
    setDeleteTaskId(null);
  };

  // Action menu items
  const getActionMenuItems = (record: Task): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEdit(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const { inputValue, handleChange } = useDebounceInput((value: string) => {
    onSetSearch(value);
  }, 500);
  // Table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      sorter: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      sorter: false,
      render: (status: string, record: Task) => (
        <Select
          value={status}
          onChange={value => handleStatusChange(record, value)}
          options={[
            { label: 'To Do', value: 'todo' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Done', value: 'done' },
          ]}
          style={{ width: 120 }}
          size="small"
        />
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: true,
      render: (priority: string) => (
        <Tag color={priorityTagColorMap[priority]}>
          {priorityLabelMap[priority]}
        </Tag>
      ),
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 150,
      render: (assignee: string) => <span>{assignee || '—'}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      sorter: true,
      render: (date: string) => (
        <span>{date ? new Date(date).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Task) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };
  console.log('pagination', pagination);

  return (
    <div style={{ padding: 32 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                margin: '0 0 8px 0',
              }}
            >
              Tasks
            </h1>
            <p style={{ margin: 0, color: 'rgba(148, 163, 184, 0.8)' }}>
              Manage and track all your tasks
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateNew}
          >
            Add New Task
          </Button>
        </div>
      </div>

      {/* Controls Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={inputValue}
            onChange={handleChange}
            style={{
              borderColor: 'rgba(226, 232, 240, 0.2)',
            }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Space style={{ float: 'right' }}>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
              >
                Delete ({selectedRowKeys.length})
              </Button>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'reset',
                    label: 'Reset Sort',
                    onClick: () => {
                      onSetSort(undefined);
                    },
                  },
                  { type: 'divider' },
                  {
                    key: 'title',
                    label: 'Sort by Title',
                    onClick: () => {
                      onSetSort('title');
                    },
                  },
                  { type: 'divider' },
                  {
                    key: 'dueDate',
                    label: 'Sort by Due Date',
                    onClick: () => {
                      onSetSort('dueDate');
                    },
                  },
                  {
                    key: 'priority',
                    label: 'Sort by Priority',
                    onClick: () => {
                      onSetSort('priority');
                    },
                  },
                ],
              }}
            >
              <Button>Sort by...</Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* Filter Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Select
            mode="multiple"
            placeholder="Filter by Status"
            allowClear
            value={filters.status ? filters.status.split(',') : []}
            onChange={values =>
              onSetStatusFilter(values.length > 0 ? values : undefined)
            }
            options={[
              { label: 'To Do', value: 'todo' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Done', value: 'done' },
            ]}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filter by Priority"
            allowClear
            value={filters.priority || undefined}
            onChange={value => onSetPriorityFilter(value)}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DatePicker.RangePicker
            placeholder={['Start Date', 'End Date']}
            value={
              filters.dueDateRange
                ? [
                    dayjs(filters.dueDateRange[0]),
                    dayjs(filters.dueDateRange[1]),
                  ]
                : null
            }
            onChange={dates => {
              if (dates && dates[0] && dates[1]) {
                onSetDateRangeFilter([
                  dates[0].format('YYYY-MM-DD'),
                  dates[1].format('YYYY-MM-DD'),
                ]);
              } else {
                onSetDateRangeFilter(undefined);
              }
            }}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              onResetFilters();
            }}
            block
          >
            Reset Filters
          </Button>
        </Col>
      </Row>

      {/* Tasks Table */}
      <Table
        columns={columns}
        dataSource={paginatedTasks.map(task => ({ ...task, key: task.id }))}
        rowSelection={rowSelection}
        pagination={{
          pageSize: pagination.pageSize,
          current: pagination.currentPage,
          total: pagination.total,
          onChange: page => onSetPage(page),
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} tasks`,
          style: { marginTop: 16 },
        }}
        rowClassName={() => 'custom-table-row'}
        className="bg-[#fff]"
      />

      {/* Modals */}
      <CreateTaskModal
        open={createModalOpen}
        onClose={handleCreateModalClose}
        editingTask={editingTask}
        onSubmit={handleCreateTaskSubmit}
      />

      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isBulkDelete={deleteTaskId === 'bulk'}
        deleteCount={deleteTaskId === 'bulk' ? selectedRowKeys.length : 1}
      />

      {/* Custom styles for table */}
      <style>{`
          .custom-table-row {
            border-bottom: 1px solid rgba(226, 232, 240, 0.1) !important;
            transition: all 0.3s ease;
          }
          
          .custom-table-row:hover {
          }
          
          .ant-table {
            background: transparent !important;
          }
          
          .ant-table-thead > tr > th {
            border-bottom: 1px solid rgba(226, 232, 240, 0.1) !important;
            font-weight: 600;
          }
          
          .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(226, 232, 240, 0.1) !important;
            padding: 12px 16px !important;
          }
          
          .ant-pagination-item {
            border-color: rgba(226, 232, 240, 0.1) !important;
          }
          
          .ant-pagination-item a {
            color: rgb(99, 102, 241);
          }
          
          .ant-pagination-item-active {
            background: rgb(99, 102, 241) !important;
            border-color: rgb(99, 102, 241) !important;
          }
          
          .ant-pagination-item-active a {
            color: white !important;
          }
          
          .ant-btn-text:hover {
          }
          
          .ant-checkbox-wrapper {
            color: white !important;
          }
        `}</style>
    </div>
  );
};

export default TaskPage;
