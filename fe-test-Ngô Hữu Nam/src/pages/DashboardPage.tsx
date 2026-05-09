import {
  ArrowUpOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Progress, Row, Space, Statistic, Tag, theme } from 'antd';
import React, { useMemo } from 'react';
import { useTasksSelectors } from '../store/selectors/tasksSelectors';
import { Task } from '../types/task';

const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const { allTasks } = useTasksSelectors();
  // Calculate statistics
  const stats = useMemo(() => {
    const total = allTasks.length;
    const todo = allTasks.filter(t => t.status === 'todo').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
    const done = allTasks.filter(t => t.status === 'done').length;

    return { total, todo, inProgress, done };
  }, []);

  // Get 5 most recently created tasks (sorted by createdAt descending)
  const recentTasks = useMemo(() => {
    return [...allTasks]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [allTasks]);

  // Calculate completion percentage
  const completionPercent = Math.round((stats.done / stats.total) * 100);

  const statusLabelMap: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const statusTagColorMap: Record<string, string> = {
    todo: 'blue',
    in_progress: 'orange',
    done: 'green',
  };

  const priorityColorMap: Record<string, string> = {
    low: 'cyan',
    medium: 'blue',
    high: 'red',
  };

  const cardStyle = {
    border: '1px solid rgba(226, 232, 240, 0.1)',
    borderRadius: 12,
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            margin: '0 0 8px 0',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'rgba(148, 163, 184, 0.8)', margin: 0 }}>
          Overview of your task management and team progress
        </p>
      </div>

      {/* Statistics Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {/* Total Tasks Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="h-full"
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            }}
            hoverable
          >
            <Statistic
              title={<span style={{ color: 'white' }}>Total Tasks</span>}
              value={stats.total}
              prefix={
                <FileTextOutlined
                  style={{ color: 'rgba(226, 232, 240, 0.8)' }}
                />
              }
              valueStyle={{
                color: 'white',
                fontSize: 32,
                fontWeight: 'bold',
              }}
              suffix={
                <span style={{ color: '#10b981', fontSize: 12 }}>
                  <ArrowUpOutlined /> +2 this week
                </span>
              }
            />
          </Card>
        </Col>

        {/* To Do Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
            hoverable
          >
            <Statistic
              title={<span style={{ color: 'rgb(147, 197, 253)' }}>To Do</span>}
              value={stats.todo}
              valueStyle={{
                color: 'rgb(147, 197, 253)',
                fontSize: 32,
                fontWeight: 'bold',
              }}
            />
            <Progress
              percent={(stats.todo / stats.total) * 100}
              strokeColor="rgb(59, 130, 246)"
              showInfo={false}
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>

        {/* In Progress Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: 'rgb(253, 224, 71)' }}>In Progress</span>
              }
              value={stats.inProgress}
              prefix={
                <ClockCircleOutlined style={{ color: 'rgb(245, 158, 11)' }} />
              }
              valueStyle={{
                color: 'rgb(253, 224, 71)',
                fontSize: 32,
                fontWeight: 'bold',
              }}
            />
            <Progress
              percent={(stats.inProgress / stats.total) * 100}
              strokeColor="rgb(245, 158, 11)"
              showInfo={false}
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>

        {/* Done Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
            hoverable
          >
            <Statistic
              title={<span style={{ color: 'rgb(110, 231, 183)' }}>Done</span>}
              value={stats.done}
              prefix={
                <CheckCircleOutlined style={{ color: 'rgb(16, 185, 129)' }} />
              }
              valueStyle={{
                color: 'rgb(110, 231, 183)',
                fontSize: 32,
                fontWeight: 'bold',
              }}
            />
            <Progress
              percent={(stats.done / stats.total) * 100}
              strokeColor="rgb(16, 185, 129)"
              showInfo={false}
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Progress Overview Card */}
        <Col xs={24} lg={8}>
          <Card style={cardStyle}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 24,
              }}
            >
              Overall Progress
            </h3>

            {/* Circular Progress */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <div style={{ position: 'relative', width: 192, height: 192 }}>
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-90deg)',
                  }}
                  viewBox="0 0 160 160"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#f9f9f9"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 72 * (completionPercent / 100)} ${2 * Math.PI * 72}`}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.5s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 'bold',
                      color: 'rgb(16, 185, 129)',
                    }}
                  >
                    {completionPercent}%
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(148, 163, 184, 0.7)',
                      marginTop: 4,
                    }}
                  >
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {[
                {
                  label: 'To Do',
                  value: stats.todo,
                  color: 'rgb(59, 130, 246)',
                },
                {
                  label: 'In Progress',
                  value: stats.inProgress,
                  color: 'rgb(245, 158, 11)',
                },
                {
                  label: 'Done',
                  value: stats.done,
                  color: 'rgb(16, 185, 129)',
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <span style={{ color: 'rgb(112, 113, 114)' }}>
                    {item.label}
                  </span>
                  <span style={{ fontWeight: 'bold', color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </Space>

            {/* Status Distribution Progress Bar */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid rgba(226, 232, 240, 0.1)',
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(148, 163, 184, 0.8)',
                  marginBottom: 12,
                }}
              >
                Task Distribution
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  height: 8,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    flex: stats.todo / stats.total,
                    background: 'rgb(59, 130, 246)',
                    transition: 'all 0.3s ease',
                  }}
                  title={`To Do: ${stats.todo} (${Math.round((stats.todo / stats.total) * 100)}%)`}
                />
                <div
                  style={{
                    flex: stats.inProgress / stats.total,
                    background: 'rgb(245, 158, 11)',
                    transition: 'all 0.3s ease',
                  }}
                  title={`In Progress: ${stats.inProgress} (${Math.round((stats.inProgress / stats.total) * 100)}%)`}
                />
                <div
                  style={{
                    flex: stats.done / stats.total,
                    background: 'rgb(16, 185, 129)',
                    transition: 'all 0.3s ease',
                  }}
                  title={`Done: ${stats.done} (${Math.round((stats.done / stats.total) * 100)}%)`}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 12,
                  fontSize: 11,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: 'rgb(59, 130, 246)',
                      borderRadius: 2,
                    }}
                  />
                  <span style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                    {Math.round((stats.todo / stats.total) * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: 'rgb(245, 158, 11)',
                      borderRadius: 2,
                    }}
                  />
                  <span style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                    {Math.round((stats.inProgress / stats.total) * 100)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: 'rgb(16, 185, 129)',
                      borderRadius: 2,
                    }}
                  />
                  <span style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                    {Math.round((stats.done / stats.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Tasks Card */}
        <Col xs={24} lg={16}>
          <Card style={cardStyle}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 24,
              }}
            >
              Recent Tasks
            </h3>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {recentTasks.map((task: Task) => (
                <Card
                  key={task.id}
                  style={{
                    border: `1px solid ${
                      task.status === 'done'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : task.status === 'in_progress'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(59, 130, 246, 0.3)'
                    }`,
                    borderRadius: 8,
                    borderLeft: `4px solid ${
                      task.status === 'done'
                        ? 'rgb(16, 185, 129)'
                        : task.status === 'in_progress'
                          ? 'rgb(245, 158, 11)'
                          : 'rgb(59, 130, 246)'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  hoverable
                >
                  {/* Task Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.title}
                      </h4>
                      <p
                        style={{
                          fontSize: 12,
                          margin: '4px 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.description}
                      </p>
                    </div>
                    <Tag color={statusTagColorMap[task.status]}>
                      {statusLabelMap[task.status]}
                    </Tag>
                  </div>

                  {/* Task Meta Information */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      fontSize: 12,
                      marginBottom: task.tags && task.tags.length > 0 ? 12 : 0,
                    }}
                  >
                    <Space size="small">
                      {task.assignee && (
                        <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                          <UserOutlined /> {task.assignee}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                          <CalendarOutlined />{' '}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </Space>
                    {task.priority && (
                      <Tag color={priorityColorMap[task.priority]}>
                        {task.priority.toUpperCase()}
                      </Tag>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {task.tags.map(tag => (
                        <Tag
                          key={tag}
                          style={{
                            border: 'none',
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
