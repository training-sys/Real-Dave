import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, Select, Row, Col, Popconfirm, message, Checkbox, Upload, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EnvironmentOutlined, WhatsAppOutlined, EyeOutlined, SwapRightOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const Inquiries = () => {
    const { inquiries, addInquiry, updateInquiry, deleteInquiry, subTypes, sources, appSettings, userProfile, permissions, logInquiryView } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState('all');
    const [filtered, setFiltered] = useState(inquiries);
    const [selectedPortals, setSelectedPortals] = useState(['99acres', 'MagicBricks', 'Housing']);

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Inquiries || {};
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
        setFiltered(inquiries);
        filterForm.resetFields();
        setActiveTab('all');
    }, [inquiries, filterForm]);

    const handleEdit = (record) => {
        if (!canEdit) {
            return;
        }
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsDrawerOpen(true);
    };

    const handleView = (record) => {
        logInquiryView(record.key, record.name, userProfile);
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (key) => {
        if (!canDelete) {
            return;
        }
        deleteInquiry(key);
    };

    const cleanPhoneNumber = (value) => {
        if (!value) return '';
        return value.replace(/[^\d]/g, '');
    };

    const getWhatsAppText = (name) => {
        const template = appSettings.whatsappTemplate || 'Hi {name}, thank you for your interest in our properties.';
        return template.replace('{name}', name || '');
    };

    const handleWhatsApp = (record) => {
        const digits = cleanPhoneNumber(record.contact);
        if (!digits) {
            message.warning('No valid phone number for this inquiry');
            return;
        }
        const text = appSettings.whatsappEnabled ? getWhatsAppText(record.name) : '';
        const url = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
        window.open(url, '_blank');
    };

    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            message.error('Location is not supported in this browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                form.setFieldsValue({
                    locationUrl: url,
                });
                message.success('Location captured from device');
            },
            () => {
                message.error('Unable to fetch location');
            }
        );
    };

    const handleFilter = () => {
        const values = filterForm.getFieldsValue();
        const { search, source: sourceFilter, status: statusFilter } = values;

        let data = inquiries;

        if (activeTab === 'new') {
            data = data.filter(i => i.status === 'New');
        } else if (activeTab === 'closed') {
            data = data.filter(i => i.status === 'Closed');
        }

        const next = data.filter((i) => {
            if (search) {
                const s = search.toLowerCase();
                const matches =
                    i.name.toLowerCase().includes(s) ||
                    (i.contact || '').toLowerCase().includes(s) ||
                    (i.interest || '').toLowerCase().includes(s);
                if (!matches) return false;
            }

            if (sourceFilter && i.source !== sourceFilter) {
                return false;
            }

            if (statusFilter && i.status !== statusFilter) {
                return false;
            }

            return true;
        });

        setFiltered(next);
    };

    const handleClearFilters = () => {
        filterForm.resetFields();
        setActiveTab('all');
        setFiltered(inquiries);
    };

    const onTabChange = (key) => {
        setActiveTab(key);
        handleFilter();
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                if (lines.length < 2) {
                    message.error('No inquiry data found in file');
                    return;
                }

                const headerParts = lines[0].split(',').map(part => part.trim());
                const headerIndex = {};
                headerParts.forEach((name, index) => {
                    headerIndex[name] = index;
                });

                const getValue = (parts, ...possibleHeaders) => {
                    for (const h of possibleHeaders) {
                        let idx = headerIndex[h];
                        if (idx !== undefined) return parts[idx]?.trim();
                        const lowerH = h.toLowerCase();
                        const foundKey = Object.keys(headerIndex).find(k => k.toLowerCase() === lowerH);
                        if (foundKey) {
                            idx = headerIndex[foundKey];
                            return parts[idx]?.trim();
                        }
                    }
                    return '';
                };

                const rows = lines.slice(1);
                let importedCount = 0;

                rows.forEach((line) => {
                    const parts = line.split(',').map(part => part.trim());
                    if (!parts.length) return;

                    const name = getValue(parts, 'Name', 'Customer Name', 'Client');
                    const contact = getValue(parts, 'Contact', 'Phone', 'Mobile', 'Email');
                    const interest = getValue(parts, 'Interest', 'Interested In', 'Property Type');
                    const source = getValue(parts, 'Source', 'Lead Source');
                    const budget = getValue(parts, 'Budget', 'Price Range');
                    const status = getValue(parts, 'Status') || 'New';
                    const notes = getValue(parts, 'Notes', 'Remarks', 'Description');

                    if (!name && !contact) return;

                    addInquiry({
                        name: name || 'Unknown',
                        contact: contact || '',
                        interest: interest || 'General',
                        source: source || 'Manual Import',
                        budget: budget || '',
                        status: status,
                        notes: notes || 'Imported via CSV',
                        priority: 'Medium'
                    });
                    importedCount++;
                });

                if (importedCount > 0) {
                    message.success(`Successfully imported ${importedCount} inquiries`);
                } else {
                    message.warning('No valid inquiries found in file');
                }
            } catch (err) {
                console.error(err);
                message.error('Failed to parse CSV file');
            }
        };
        reader.readAsText(file);
        return false;
    };

    const handleConvertToDeal = (record) => {
        // Navigate to Deals with pre-filled state
        navigate('/deals', {
            state: {
                openAdd: true,
                initialData: {
                    client: record.name,
                    title: `${record.interest} Inquiry`,
                    // You could add more mapped fields here if Deal form supports them
                }
            }
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
        },
        {
            title: 'Interest',
            dataIndex: 'interest',
            key: 'interest',
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (_, { status }) => (
                <Tag color={status === 'New' ? 'blue' : status === 'Follow Up' ? 'orange' : 'green'} key={status}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'WhatsApp',
            key: 'whatsapp',
            render: (_, record) => (
                <Button
                    icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                    size="small"
                    onClick={() => handleWhatsApp(record)}
                />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
                    <Button
                        icon={<SwapRightOutlined />}
                        size="small"
                        title="Convert to Deal"
                        onClick={() => handleConvertToDeal(record)}
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
                updateInquiry({ ...editingItem, ...values });
            } else {
                addInquiry({ status: 'New', ...values });
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

    if (!canView) {
        return (
            <div>
                <h2>Inquiries</h2>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: 8 }}>Inquiries</h2>
                    <Tabs
                        activeKey={activeTab}
                        onChange={onTabChange}
                        items={[
                            { key: 'all', label: 'All' },
                            { key: 'new', label: 'New' },
                            { key: 'closed', label: 'Closed' },
                        ]}
                    />
                    <Form
                        form={filterForm}
                        layout="inline"
                        onValuesChange={handleFilter}
                        style={{ rowGap: 8, marginTop: 8 }}
                    >
                        <Form.Item name="search" style={{ flex: 1 }}>
                            <Input placeholder="Search by name, contact or interest" allowClear />
                        </Form.Item>
                        <Form.Item name="source" label="Source">
                            <Select allowClear style={{ width: 160 }} placeholder="Source">
                                {sources.map(source => (
                                    <Option key={source.key} value={source.name}>{source.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="status" label="Status">
                            <Select allowClear style={{ width: 140 }} placeholder="Status">
                                <Option value="New">New</Option>
                                <Option value="Follow Up">Follow Up</Option>
                                <Option value="Closed">Closed</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button onClick={handleClearFilters}>Clear</Button>
                        </Form.Item>
                    </Form>
                </div>
                <Space direction="vertical" align="end">
                    <Space>
                        <Upload
                            beforeUpload={handleImport}
                            showUploadList={false}
                            accept=".csv,.txt"
                        >
                            <Button icon={<UploadOutlined />} disabled={!canCreate}>
                                Import CSV
                            </Button>
                        </Upload>
                        {canCreate && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
                                Add Inquiry
                            </Button>
                        )}
                    </Space>
                </Space>
            </div>

            <Table columns={columns} dataSource={filtered} />

            <Drawer
                title={editingItem ? "Edit Inquiry" : "Add New Inquiry"}
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
                                label="Customer Name"
                                rules={[{ required: true, message: 'Please enter customer name' }]}
                            >
                                <Input placeholder="e.g. John Doe" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="contact"
                                label="Contact (Phone/Email)"
                                rules={[{ required: true, message: 'Please enter contact info' }]}
                            >
                                <Input placeholder="e.g. +1234567890" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="interest"
                                label="Interested In"
                                rules={[{ required: true, message: 'Please select interest' }]}
                            >
                                <Select placeholder="Select interest">
                                    {subTypes.map(type => (
                                        <Option key={type.key} value={type.name}>{type.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="source"
                                label="Source"
                                rules={[{ required: true, message: 'Please select source' }]}
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
                        <Col span={12}>
                            <Form.Item
                                name="budget"
                                label="Budget Range"
                            >
                                <Input placeholder="e.g. 500k-600k" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="priority"
                                label="Priority"
                            >
                                <Select placeholder="Select priority">
                                    <Option value="High">High</Option>
                                    <Option value="Medium">Medium</Option>
                                    <Option value="Low">Low</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="notes"
                                label="Notes/Requirements"
                            >
                                <TextArea rows={4} placeholder="Specific requirements or notes..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="locationUrl"
                                label="Google Location URL"
                            >
                                <Input placeholder="https://www.google.com/maps?..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Button
                                style={{ marginTop: 30, width: '100%' }}
                                icon={<EnvironmentOutlined />}
                                onClick={handleCaptureLocation}
                            >
                                Use Current Location
                            </Button>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="images"
                                label="Images"
                            >
                                <Upload
                                    action="/upload.do"
                                    listType="picture"
                                    accept="image/*"
                                    capture="environment"
                                >
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
};

export default Inquiries;
