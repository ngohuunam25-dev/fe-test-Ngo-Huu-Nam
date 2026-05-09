import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { Task } from '../../types/task';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  editingTask: Task | null;
  onSubmit: (task: Task) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  editingTask,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingTask) {
        form.setFieldsValue({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          assignee: editingTask.assignee,
          dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null,
          tags: editingTask.tags,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingTask, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newTask: Task = {
        id: editingTask?.id || Date.now().toString(),
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assignee: values.assignee,
        dueDate: values.dueDate
          ? values.dueDate.format('YYYY-MM-DD')
          : undefined,
        createdAt:
          editingTask?.createdAt || new Date().toISOString().split('T')[0],
        tags: values.tags,
      };
      onSubmit(newTask);
    } catch (error) {
      // Form validation failed
    }
  };

  return (
    <Modal
      title={editingTask ? 'Edit Task' : 'Create New Task'}
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {editingTask ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{ marginTop: 24 }}
      >
        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: 'Please enter task title',
              whitespace: true,
            },
            {
              min: 3,
              message: 'Title must be at least 3 characters',
            },
            {
              max: 100,
              message: 'Title must not exceed 100 characters',
            },
          ]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Enter task description (optional)"
            rows={4}
          />
        </Form.Item>

        {/* Status and Priority - Side by side */}
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            {/* Status */}
            <Form.Item
              label="Status"
              name="status"
              rules={[
                {
                  required: true,
                  message: 'Please select task status',
                },
              ]}
            >
              <Select placeholder="Select status">
                <Select.Option value="todo">To Do</Select.Option>
                <Select.Option value="in_progress">In Progress</Select.Option>
                <Select.Option value="done">Done</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            {/* Priority - Radio Group */}
            <Form.Item
              label="Priority"
              name="priority"
              rules={[
                {
                  required: true,
                  message: 'Please select task priority',
                },
              ]}
            >
              <Radio.Group>
                <Radio.Button value="low">Low</Radio.Button>
                <Radio.Button value="medium">Medium</Radio.Button>
                <Radio.Button value="high">High</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {/* Assignee */}
        <Form.Item label="Assignee" name="assignee">
          <Input placeholder="Enter assignee name (optional)" />
        </Form.Item>

        {/* Due Date */}
        <Form.Item label="Due Date" name="dueDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        {/* Tags */}
        <Form.Item label="Tags" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags (optional)"
            tokenSeparators={[',']}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
