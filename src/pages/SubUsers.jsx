import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, Select, Row, Col, Avatar, Popconfirm } from 'antd';
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const { Option } = Select;

const SubUsers = () => {
  const { subUsers, addSubUser, updateSubUser, deleteSubUser, userProfile, permissions } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filtered, setFiltered] = useState(subUsers);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Users || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;

  useEffect(() => {
    setFiltered(subUsers);
  }, [subUsers]);

  const handleEdit = (record) => {
    if (!canEdit) {
      return;
    }
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsDrawerOpen(true);
  };

  const handleDelete = (key) => {
    if (!canDelete) {
      return;
    }
    deleteSubUser(key);
  };

  const handleAdd = () => {
    if (editingItem && !canEdit) {
      return;
    }
    if (!editingItem && !canCreate) {
      return;
    }
    form.validateFields().then((values) => {
      if (editingItem) {
        updateSubUser({ ...editingItem, ...values });
      } else {
        addSubUser({ status: 'Active', ...values });
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

  const handleFilter = () => {
    const values = filterForm.getFieldsValue();
    const { search, role, status } = values;

    const next = subUsers.filter((user) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesText =
          user.name.toLowerCase().includes(s) ||
          (user.email || '').toLowerCase().includes(s);
        if (!matchesText) {
          return false;
        }
      }

      if (role && user.role !== role) {
        return false;
      }

      if (status && user.status !== status) {
        return false;
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFiltered(subUsers);
  };

  if (!canView) {
    return (
      <div>
        <h2>Sub Users</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <b>{text}</b>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Manager' ? 'purple' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {canEdit && (
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          )}
          {canDelete && (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>Sub Users</h2>
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by name or email" allowClear />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Select allowClear style={{ width: 160 }} placeholder="Role">
                <Option value="Sales">Sales</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select allowClear style={{ width: 140 }} placeholder="Status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleClearFilters}>
                Clear
              </Button>
            </Form.Item>
          </Form>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            Add Sub User
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={filtered} />

      <Drawer
        title={editingItem ? 'Edit Sub User' : 'Add New Sub User'}
        width={600}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="e.g. Sales User" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Please enter email' }]}
              >
                <Input placeholder="e.g. user@example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="Sales">Sales</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="Active"
              >
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default SubUsers;
