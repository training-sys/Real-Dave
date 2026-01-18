import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, InputNumber, Select, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const { Option } = Select;

const Loans = () => {
  const { loans, addLoan, updateLoan, deleteLoan, userProfile, permissions } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filtered, setFiltered] = useState(loans);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Loans || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;

  useEffect(() => {
    setFiltered(loans);
  }, [loans]);

  const handleFilter = () => {
    const values = filterForm.getFieldsValue();
    const { search, status, minAmount, maxAmount } = values;

    const next = loans.filter((loan) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesText =
          loan.name.toLowerCase().includes(s) ||
          (loan.bank || '').toLowerCase().includes(s);
        if (!matchesText) {
          return false;
        }
      }

      if (status && loan.status !== status) {
        return false;
      }

      if (minAmount != null && minAmount !== '' && Number(minAmount) >= 0) {
        if ((loan.amount || 0) < Number(minAmount)) {
          return false;
        }
      }

      if (maxAmount != null && maxAmount !== '' && Number(maxAmount) >= 0) {
        if ((loan.amount || 0) > Number(maxAmount)) {
          return false;
        }
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFiltered(loans);
  };

  if (!canView) {
    return (
      <div>
        <h2>Loan Applications</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

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
    deleteLoan(key);
  };

  const columns = [
    {
      title: 'Applicant Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount),
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Pending' ? 'gold' : 'volcano'} key={status}>
          {status.toUpperCase()}
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

  const handleAdd = () => {
    if (editingItem && !canEdit) {
      return;
    }
    if (!editingItem && !canCreate) {
      return;
    }
    form.validateFields().then((values) => {
      if (editingItem) {
        updateLoan({ ...editingItem, ...values });
      } else {
        addLoan({ status: 'Pending', ...values });
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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 8 }}>Loan Applications</h2>
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by applicant or bank" allowClear />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select allowClear style={{ width: 140 }} placeholder="Status">
                <Option value="Pending">Pending</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </Form.Item>
            <Form.Item name="minAmount" label="Min">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="maxAmount" label="Max">
              <InputNumber min={0} style={{ width: 120 }} />
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
            Add Loan
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={filtered} />

      <Drawer
        title={editingItem ? "Edit Loan Application" : "Add New Loan Application"}
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
            name="name"
            label="Applicant Name"
            rules={[{ required: true, message: 'Please enter applicant name' }]}
          >
            <Input placeholder="e.g. John Doe" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount (₹)"
                rules={[{ required: true, message: 'Please enter amount' }]}
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
                name="bank"
                label="Bank Name"
                rules={[{ required: true, message: 'Please enter bank name' }]}
              >
                <Input placeholder="e.g. HDFC Bank" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Application Status"
            initialValue="Pending"
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Loans;
