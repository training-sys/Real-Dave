import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, Select, Row, Col, Avatar, Popconfirm, message } from 'antd';
import { PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, DeleteOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const Contacts = () => {
  const { contacts, addContact, updateContact, deleteContact, sources, contactGroups, appSettings, userProfile, permissions } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filtered, setFiltered] = useState(contacts);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Contacts || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;
  const canUseWhatsApp = !!appSettings.whatsappEnabled && !!appSettings.whatsappConnected && !!appSettings.whatsappNumber;

  useEffect(() => {
    if (location.state && location.state.openAdd) {
      setEditingItem(null);
      form.resetFields();
      setIsDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, form, navigate]);

  useEffect(() => {
    setFiltered(contacts);
  }, [contacts]);

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
    deleteContact(key);
  };

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d]/g, '');
  };

  const getWhatsAppText = (name) => {
    const template = appSettings.whatsappTemplate || 'Hi {name}, thank you for your interest in our properties.';
    return template.replace('{name}', name || '');
  };

  const handleWhatsApp = (record) => {
    if (!canUseWhatsApp) {
      message.warning('WhatsApp is not enabled. Please configure it in Settings or WhatsApp Integration.');
      return;
    }
    const digits = cleanPhoneNumber(record.phone);
    if (!digits) {
      message.warning('No valid phone number for this contact');
      return;
    }
    const text = appSettings.whatsappEnabled ? getWhatsAppText(record.name) : '';
    const url = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    window.open(url, '_blank');
  };

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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Agent' ? 'purple' : 'cyan'}>{role}</Tag>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span><PhoneOutlined /> {record.phone}</span>
          <span><MailOutlined /> {record.email}</span>
        </Space>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'Active' ? 'green' : 'default'} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
            size="small"
            disabled={!canUseWhatsApp}
            onClick={() => handleWhatsApp(record)}
          />
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

  const handleAdd = () => {
    if (editingItem && !canEdit) {
      return;
    }
    if (!editingItem && !canCreate) {
      return;
    }
    form.validateFields().then((values) => {
      if (editingItem) {
        updateContact({ ...editingItem, ...values });
      } else {
        addContact({ status: 'Active', ...values });
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
    const { search, role, status, source } = values;

    const next = contacts.filter((contact) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesText =
          contact.name.toLowerCase().includes(s) ||
          (contact.email || '').toLowerCase().includes(s) ||
          (contact.phone || '').toLowerCase().includes(s);
        if (!matchesText) {
          return false;
        }
      }

      if (role && contact.role !== role) {
        return false;
      }

      if (status && contact.status !== status) {
        return false;
      }

      if (source && contact.source !== source) {
        return false;
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFiltered(contacts);
  };

  if (!canView) {
    return (
      <div>
        <h2>Contacts</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>Contacts</h2>
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by name, email, or phone" allowClear />
            </Form.Item>
            <Form.Item name="role" label="Role">
              <Select allowClear style={{ width: 160 }} placeholder="Role">
                {contactGroups.map(group => (
                  <Option key={group.key} value={group.name}>{group.name}</Option>
                ))}
                <Option value="Client">Client</Option>
                <Option value="Agent">Agent</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select allowClear style={{ width: 140 }} placeholder="Status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
            <Form.Item name="source" label="Source">
              <Select allowClear style={{ width: 160 }} placeholder="Source">
                {sources.map(source => (
                  <Option key={source.key} value={source.name}>{source.name}</Option>
                ))}
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
            Add Contact
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={filtered} />

      <Drawer
        title={editingItem ? "Edit Contact" : "Add New Contact"}
        width={720}
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
                <Input placeholder="e.g. John Smith" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  {contactGroups.map(group => (
                    <Option key={group.key} value={group.name}>{group.name}</Option>
                  ))}
                  <Option value="Client">Client</Option>
                  <Option value="Agent">Agent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Please enter email' }]}
              >
                <Input placeholder="e.g. john@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone' }]}
              >
                <Input placeholder="e.g. +1 555 123 4567" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label="Source"
              >
                <Select placeholder="Select source">
                  {sources.map(source => (
                    <Option key={source.key} value={source.name}>{source.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label="Address"
              >
                <TextArea rows={3} placeholder="Mailing address..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default Contacts;
