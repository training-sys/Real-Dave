import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const { Option } = Select;

const PaymentDetails = () => {
    const { userProfile, permissions, paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useData();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [filtered, setFiltered] = useState(paymentMethods);

    const [editingItem, setEditingItem] = useState(null);

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.PaymentDetails || {};
    const canView = isSuperAdmin || !!modulePermissions.view;
    const canCreate = isSuperAdmin || !!modulePermissions.create;
    const canEdit = isSuperAdmin || !!modulePermissions.edit;
    const canDelete = isSuperAdmin || !!modulePermissions.delete;

    useEffect(() => {
        setFiltered(paymentMethods);
    }, [paymentMethods]);

    const handleFilter = () => {
        const values = filterForm.getFieldsValue();
        const { search, status } = values;

        const next = paymentMethods.filter((item) => {
            if (search) {
                const s = search.toLowerCase();
                const matchesText =
                    item.method.toLowerCase().includes(s) ||
                    (item.bankName || '').toLowerCase().includes(s) ||
                    (item.accountNumber || '').toLowerCase().includes(s);
                if (!matchesText) {
                    return false;
                }
            }

            if (status && item.status !== status) {
                return false;
            }

            return true;
        });

        setFiltered(next);
    };

    const handleClearFilters = () => {
        filterForm.resetFields();
        setFiltered(paymentMethods);
    };

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
        deletePaymentMethod(key);
    };

    const handleClose = () => {
        setIsDrawerOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
        },
        {
            title: 'Bank/Provider',
            dataIndex: 'bankName',
            key: 'bankName',
        },
        {
            title: 'Account Details',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
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
                    {canEdit && (
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Delete this payment method?"
                            onConfirm={() => handleDelete(record.key)}
                        >
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
                updatePaymentMethod({ ...editingItem, ...values });
            } else {
                addPaymentMethod(values);
            }
            handleClose();
        });
    };

    if (!canView) {
        return (
            <div>
                <h2>Payment Details</h2>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: 8 }}>Payment Details</h2>
                    <Form
                        form={filterForm}
                        layout="inline"
                        onValuesChange={handleFilter}
                        style={{ rowGap: 8 }}
                    >
                        <Form.Item name="search" style={{ flex: 1 }}>
                            <Input placeholder="Search by method, bank or account" allowClear />
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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingItem(null);
                            form.resetFields();
                            setIsDrawerOpen(true);
                        }}
                    >
                        Add Payment Method
                    </Button>
                )}
            </div>

            <Table columns={columns} dataSource={filtered} />

            <Drawer
                title={editingItem ? 'Edit Payment Method' : 'Add Payment Method'}
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
                        name="method"
                        label="Payment Method"
                        rules={[{ required: true, message: 'Please select method' }]}
                    >
                        <Select placeholder="Select method">
                            <Option value="Bank Transfer">Bank Transfer</Option>
                            <Option value="UPI">UPI</Option>
                            <Option value="Credit Card">Credit Card</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="bankName"
                        label="Bank / Provider Name"
                        rules={[{ required: true, message: 'Please enter bank name' }]}
                    >
                        <Input placeholder="e.g. HDFC Bank" />
                    </Form.Item>

                    <Form.Item
                        name="accountNumber"
                        label="Account Number / UPI ID"
                        rules={[{ required: true, message: 'Please enter details' }]}
                    >
                        <Input placeholder="e.g. 1234567890" />
                    </Form.Item>
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
                </Form>
            </Drawer>
        </div>
    );
};

export default PaymentDetails;
