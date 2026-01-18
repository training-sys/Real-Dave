import { useState } from 'react';
import { Table, Button, Drawer, Form, Select, InputNumber, DatePicker, Space, Tag, Popconfirm, message, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const Bookings = () => {
  const { bookings, addBooking, updateBooking, deleteBooking, contacts, properties, userProfile, permissions } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Bookings || {};

  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;

  const handleEdit = (item) => {
    if (!canEdit) return;
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      bookingDate: item.bookingDate ? dayjs(item.bookingDate) : null,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (key) => {
    if (!canDelete) return;
    deleteBooking(key);
    message.success('Booking deleted successfully');
  };

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        bookingDate: values.bookingDate ? values.bookingDate.format('YYYY-MM-DD') : null,
      };

      if (editingItem) {
        updateBooking({ ...editingItem, ...formattedValues });
        message.success('Booking updated successfully');
      } else {
        addBooking(formattedValues);
        message.success('Booking created successfully');
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

  const generatePaymentLink = (record) => {
    // Mock Razorpay link generation
    const link = `https://rzp.io/l/booking${record.key}`;
    message.success(`Payment link generated: ${link}`);
    // In a real app, you would call an API here
    navigator.clipboard.writeText(link);
    message.info('Link copied to clipboard!');
  };

  const handleWhatsAppReminder = (record) => {
    const contact = contacts.find(c => c.key === record.contactId);
    const clientName = contact ? contact.name : 'Client';
    const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(record.amount);

    const text = `Hi ${clientName}, this is a gentle reminder regarding your pending payment of ${amount} for your booking. Please pay using this link: https://rzp.io/l/booking${record.key}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (text) => text || '-',
      sorter: (a, b) => dayjs(a.bookingDate).unix() - dayjs(b.bookingDate).unix(),
    },
    {
      title: 'Client',
      dataIndex: 'contactId',
      key: 'contactId',
      render: (contactId) => {
        const contact = contacts.find(c => c.key === contactId);
        return contact ? contact.name : 'Unknown Client';
      },
    },
    {
      title: 'Unit',
      dataIndex: 'unitId',
      key: 'unitId',
      render: (unitId) => {
        const prop = properties.find(p => p.key === unitId);
        return prop ? `${prop.title} (Unit ${prop.unitNo || '-'})` : 'Unknown Unit';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Confirmed') color = 'green';
        if (status === 'Pending') color = 'orange';
        if (status === 'Cancelled') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        let color = 'default';
        if (status === 'Paid') color = 'green';
        if (status === 'Pending') color = 'orange';
        if (status === 'Partial') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => generatePaymentLink(record)}
            title="Generate Payment Link"
          />
          <Button
            type="text"
            icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
            onClick={() => handleWhatsAppReminder(record)}
            title="Send WhatsApp Reminder"
          />
          {canEdit && <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />}
          {canDelete && (
            <Popconfirm title="Delete booking?" onConfirm={() => handleDelete(record.key)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!canView) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Bookings</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  // Calculate summaries
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'Pending').length;

  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Bookings & Payments</Title>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Card size="small" style={{ width: 200 }}>
            <div style={{ color: '#8c8c8c' }}>Total Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalBookings}</div>
          </Card>
          <Card size="small" style={{ width: 200 }}>
            <div style={{ color: '#8c8c8c' }}>Total Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
            </div>
          </Card>
          <Card size="small" style={{ width: 200 }}>
            <div style={{ color: '#8c8c8c' }}>Pending Payments</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{pendingPayments}</div>
          </Card>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            New Booking
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={bookings} rowKey="key" />

      <Drawer
        title={editingItem ? "Edit Booking" : "New Booking"}
        width={500}
        onClose={handleClose}
        open={isDrawerOpen}
        extra={
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" onClick={handleAdd}>Save</Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="contactId"
            label="Client"
            rules={[{ required: true, message: 'Please select a client' }]}
          >
            <Select placeholder="Select Client" showSearch optionFilterProp="children">
              {contacts.filter(c => c.role === 'Client' || c.role === 'Owner').map(c => (
                <Option key={c.key} value={c.key}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unitId"
            label="Unit / Property"
            rules={[{ required: true, message: 'Please select a unit' }]}
          >
            <Select
              placeholder="Select Unit"
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                const prop = properties.find(p => p.key === value);
                if (prop) {
                  form.setFieldsValue({ amount: prop.price });
                }
              }}
            >
              {properties.map(p => (
                <Option key={p.key} value={p.key}>
                  {p.title} {p.unitNo ? `(Unit ${p.unitNo})` : ''} - {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.price)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bookingDate"
            label="Booking Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Booking Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Booking Status"
            initialValue="Confirmed"
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Confirmed">Confirmed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentStatus"
            label="Payment Status"
            initialValue="Pending"
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Partial">Partial</Option>
              <Option value="Paid">Paid</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Bookings;
