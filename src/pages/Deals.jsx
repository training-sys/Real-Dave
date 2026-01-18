import { useState, useEffect } from 'react';
import { Card, Col, Row, Tag, Button, Drawer, Form, Input, Select, InputNumber, Avatar, Tooltip, Popconfirm, Space } from 'antd';
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, SwapRightOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;

const Deals = () => {
  const { deals, addDeal, updateDeal, deleteDeal, userProfile, permissions, subUsers, contacts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filtered, setFiltered] = useState(deals);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Deals || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;

  const stages = ['Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  useEffect(() => {
    if (location.state && location.state.openAdd) {
      setEditingItem(null);
      form.resetFields();
      setIsDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, form, navigate]);

  useEffect(() => {
    setFiltered(deals);
  }, [deals]);

  const handleEdit = (item) => {
    if (!canEdit) {
      return;
    }
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsDrawerOpen(true);
  };

  const handleConvertToBooking = (item) => {
    navigate('/bookings', {
      state: {
        openAdd: true,
        initialData: {
          // Map Deal fields to Booking fields
          // Note: Booking usually needs a Unit ID, which might not be in Deal
          // But we can pre-fill contact if linked
          contactId: contacts.find(c => c.name === item.client)?.key,
          amount: item.value / 10, // Assume 10% token amount as default
        }
      }
    });
  };

  const handleDelete = (key) => {
    if (!canDelete) {
      return;
    }
    deleteDeal(key);
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
        updateDeal({ ...editingItem, ...values });
      } else {
        addDeal(values);
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
    const { search, stage, minValue, maxValue } = values;

    const next = deals.filter((deal) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesText =
          deal.title.toLowerCase().includes(s) ||
          (deal.client || '').toLowerCase().includes(s);
        if (!matchesText) {
          return false;
        }
      }

      if (stage && deal.stage !== stage) {
        return false;
      }

      if (minValue != null && minValue !== '' && Number(minValue) >= 0) {
        if ((deal.value || 0) < Number(minValue)) {
          return false;
        }
      }

      if (maxValue != null && maxValue !== '' && Number(maxValue) >= 0) {
        if ((deal.value || 0) > Number(maxValue)) {
          return false;
        }
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFiltered(deals);
  };

  if (!canView) {
    return (
      <div>
        <h2>Deals Pipeline</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>Deals Pipeline</h2>
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by deal or client" allowClear />
            </Form.Item>
            <Form.Item name="stage" label="Stage">
              <Select allowClear style={{ width: 200 }} placeholder="Stage">
                {stages.map(s => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="minValue" label="Min">
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="maxValue" label="Max">
              <InputNumber min={0} style={{ width: 140 }} />
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
            Add Deal
          </Button>
        )}
      </div>

      <Row gutter={16}>
        {stages.map(stage => (
          <Col span={4} key={stage} style={{ minWidth: 200 }}>
            <Card title={stage} size="small" style={{ height: '100%', background: '#f5f5f5' }}>
              {filtered.filter(item => item.stage === stage).map(item => (
                <Card
                  key={item.key}
                  size="small"
                  style={{ marginBottom: 8 }}
                  hoverable
                  actions={[
                    <Tooltip title="Convert to Booking" key="convert">
                      <SwapRightOutlined onClick={() => handleConvertToBooking(item)} />
                    </Tooltip>,
                    canEdit && <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                    canDelete && (
                      <Popconfirm key="delete" title="Delete?" onConfirm={() => handleDelete(item.key)}>
                        <DeleteOutlined style={{ color: 'red' }} />
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <h4>{item.title}</h4>
                  <p style={{ color: '#888', fontSize: 12 }}>{item.client}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Tag color="green">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.value)}</Tag>
                    <Tooltip title={`Agent: ${item.agent}`}>
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                    </Tooltip>
                  </div>
                </Card>
              ))}
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title={editingItem ? "Edit Deal" : "Add New Deal"}
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
            label="Deal Name"
            rules={[{ required: true, message: 'Please enter deal name' }]}
          >
            <Input placeholder="e.g. Villa Sale" />
          </Form.Item>

          <Form.Item
            name="client"
            label="Client Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Select
              showSearch
              placeholder="Select or enter client"
              optionFilterProp="children"
              allowClear
            >
              {contacts.map(c => (
                <Option key={c.key} value={c.name}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Value (₹)"
                rules={[{ required: true, message: 'Please enter value' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stage"
                label="Stage"
                initialValue="Qualified"
              >
                <Select>
                  {stages.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="agent"
            label="Assigned Agent"
            initialValue="Admin"
          >
            <Select>
              <Option value="Admin">Admin</Option>
              {subUsers.map(u => (
                <Option key={u.key} value={u.name}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Deals;
