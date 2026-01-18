import { useState, useEffect } from 'react';
import { List, Checkbox, Tag, Space, Button, Drawer, Form, Input, Select, DatePicker, Typography, Popconfirm, Row, Col, Tabs, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined, UserOutlined, EditOutlined, DeleteOutlined, WhatsAppOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, updateTaskStatus, userProfile, permissions, subUsers } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('pending');
  const [filtered, setFiltered] = useState(tasks);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Tasks || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;

  useEffect(() => {
    if (location.state && location.state.openAdd) {
      setEditingItem(null);
      form.resetFields();
      setIsDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, form, navigate]);

  useEffect(() => {
    setFiltered(tasks);
    filterForm.resetFields();
    setActiveTab('pending');
  }, [tasks, filterForm]);

  const handleEdit = (item) => {
    if (!canEdit) {
      return;
    }
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      dueDate: item.dueDate ? dayjs(item.dueDate, 'DD-MM-YYYY') : null
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (key) => {
    if (!canDelete) {
      return;
    }
    deleteTask(key);
  };

  const handleSendReminder = (item) => {
    // This would typically trigger a WhatsApp API
    message.success(`Reminder sent for task: ${item.title}`);
    window.open(`https://wa.me/?text=Reminder: ${encodeURIComponent(item.title)} due on ${item.dueDate}`, '_blank');
  };

  const isDueToday = (dateStr) => {
    if (!dateStr) return false;
    const d = dayjs(dateStr, 'DD-MM-YYYY');
    return d.isSame(dayjs(), 'day');
  };

  const handleFilter = () => {
    const values = filterForm.getFieldsValue();
    const { search, assignee, status, range } = values;

    let data = tasks;

    if (activeTab === 'pending') {
      data = data.filter(t => t.status === 'Pending' || t.status === 'In Progress');
    } else if (activeTab === 'completed') {
      data = data.filter(t => t.status === 'Completed');
    } else if (activeTab === 'due') {
      data = data.filter(t => isDueToday(t.dueDate) && t.status !== 'Completed');
    }

    const next = data.filter((t) => {
      if (search) {
        const s = search.toLowerCase();
        const matches =
          t.title.toLowerCase().includes(s) ||
          (t.description || '').toLowerCase().includes(s) ||
          (t.assignee || '').toLowerCase().includes(s);
        if (!matches) return false;
      }

      if (assignee && t.assignee !== assignee) return false;
      if (status && t.status !== status) return false;

      if (range && range.length === 2) {
        const from = range[0];
        const to = range[1];
        const d = t.dueDate ? dayjs(t.dueDate, 'DD-MM-YYYY') : null;
        if (d && (d.isBefore(from, 'day') || d.isAfter(to, 'day'))) return false;
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setActiveTab('pending');
    setFiltered(tasks);
  };

  const onTabChange = (key) => {
    setActiveTab(key);
    handleFilter();
  };

  const handleAdd = () => {
    if (editingItem && !canEdit) {
      return;
    }
    if (!editingItem && !canCreate) {
      return;
    }
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('DD-MM-YYYY') : '',
      };

      if (editingItem) {
        updateTask({ ...editingItem, ...formattedValues });
      } else {
        addTask({ status: 'Pending', ...formattedValues });
      }

      setIsDrawerOpen(false);
      setEditingItem(null);
      form.resetFields();
    });
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const toggleStatus = (key) => {
    if (!canEdit) {
      return;
    }
    updateTaskStatus(key);
  };

  if (!canView) {
    return (
      <div>
        <h2>Tasks</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>Tasks</h2>
          <Tabs
            activeKey={activeTab}
            onChange={onTabChange}
            items={[
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
              { key: 'due', label: 'Due Today' },
            ]}
          />
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8, marginTop: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by title, description or assignee" allowClear />
            </Form.Item>
            <Form.Item name="assignee" label="Assignee">
              <Select allowClear style={{ width: 160 }} placeholder="Assignee">
                <Option value="Admin">Admin</Option>
                {subUsers.map(u => (
                  <Option key={u.key} value={u.name}>{u.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select allowClear style={{ width: 140 }} placeholder="Status">
                <Option value="Pending">Pending</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </Form.Item>
            <Form.Item name="range" label="Due Range">
              <DatePicker.RangePicker style={{ width: 240 }} format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleClearFilters}>Clear</Button>
            </Form.Item>
          </Form>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            Add Task
          </Button>
        )}
      </div>

      <List
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Tag key="priority" color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'blue'}>{item.priority}</Tag>,
              <Button key="whatsapp" type="text" icon={<WhatsAppOutlined style={{ color: '#25D366' }} />} onClick={() => handleSendReminder(item)}>Remind</Button>,
              canEdit && (
                <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>Edit</Button>
              ),
              canDelete && (
                <Popconfirm key="delete" title="Delete task?" onConfirm={() => handleDelete(item.key)}>
                  <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              )
            ]}
          >
            <List.Item.Meta
              avatar={<Checkbox checked={item.status === 'Completed'} onChange={() => toggleStatus(item.key)} disabled={!canEdit} />}
              title={<Text delete={item.status === 'Completed'}>{item.title}</Text>}
              description={
                <Space>
                  <span><ClockCircleOutlined /> {item.dueDate}</span>
                  <span><UserOutlined /> {item.assignee}</span>
                </Space>
              }
            />
            <div>{item.description}</div>
          </List.Item>
        )}
      />

      <Drawer
        title={editingItem ? "Edit Task" : "Add New Task"}
        width={500}
        onClose={handleClose}
        open={isDrawerOpen}
        extra={
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" onClick={handleAdd}>Submit</Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} hideRequiredMark>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="e.g. Call client..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                initialValue="Medium"
              >
                <Select>
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="assignee"
            label="Assign To"
            initialValue="Admin"
          >
            <Select>
              <Option value="Admin">Admin</Option>
              {subUsers.map(u => (
                <Option key={u.key} value={u.name}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Details..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Tasks;
