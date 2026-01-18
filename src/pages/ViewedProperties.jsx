import { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Select, DatePicker, Button, Table, Input, Typography } from 'antd';
import { useData } from '../context/DataContext';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const ViewedProperties = () => {
    const { properties, subUsers, userProfile, permissions, viewedProperties } = useData();
    const [form] = Form.useForm();
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('Recent');

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Properties || {};
    const canView = isSuperAdmin || !!modulePermissions.view;

    useEffect(() => {
        applyFilters();
    }, [viewedProperties, searchText, sortOrder]);

    const applyFilters = () => {
        const values = form.getFieldsValue();
        let data = [...viewedProperties];

        // Filter by Form Fields
        if (values.property) {
            data = data.filter(item => item.propertyTitle === values.property);
        }
        if (values.user) {
            data = data.filter(item => item.userName === values.user);
        }
        if (values.range && values.range.length === 2) {
            const start = values.range[0].startOf('day').toDate().getTime();
            const end = values.range[1].endOf('day').toDate().getTime();
            data = data.filter(item => {
                const itemTime = item.timestamp || new Date(item.viewedAt).getTime();
                return itemTime >= start && itemTime <= end;
            });
        }

        // Filter by Search Text
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            data = data.filter(item =>
                (item.propertyTitle || '').toLowerCase().includes(lowerSearch) ||
                (item.userName || '').toLowerCase().includes(lowerSearch) ||
                (item.userRole || '').toLowerCase().includes(lowerSearch)
            );
        }

        // Sort
        data.sort((a, b) => {
            const timeA = a.timestamp || new Date(a.viewedAt).getTime();
            const timeB = b.timestamp || new Date(b.viewedAt).getTime();
            return sortOrder === 'Recent' ? timeB - timeA : timeA - timeB;
        });

        setFilteredData(data);
    };

    const handleFormChange = () => {
        // We need to wait for the form values to update
        // setTimeout is a simple hack, or we can use onValuesChange properly in the Form prop
        // The Form onValuesChange prop in Antd passes (changedValues, allValues)
        // But here we are calling applyFilters which reads form.getFieldsValue()
        // It should be fine if called from the handler
        setTimeout(applyFilters, 0);
    };

    const handleClearFilters = () => {
        form.resetFields();
        setSearchText('');
        setSortOrder('Recent');
        // applyFilters will run via useEffect or we can call it directly
        // But since form values change, we need to trigger it.
        // The easiest way is to let the next render cycle handle it via useEffect dependency on viewedProperties, 
        // but viewedProperties doesn't change on clear.
        // So we should manually call applyFilters or rely on form change listener if we had one.
        // Actually, setFilteredData with original data is safer here.
        setFilteredData([...viewedProperties].sort((a, b) => {
            const timeA = a.timestamp || new Date(a.viewedAt).getTime();
            const timeB = b.timestamp || new Date(b.viewedAt).getTime();
            return timeB - timeA;
        }));
    };

    const columns = [
        {
            title: 'Sr No.',
            key: 'sr',
            width: 80,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Property',
            dataIndex: 'propertyTitle',
            key: 'propertyTitle',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            render: (text, record) => (
                <span>{text} <small style={{ color: '#888' }}>({record.userRole})</small></span>
            ),
        },
        {
            title: 'Viewed At',
            dataIndex: 'viewedAt',
            key: 'viewedAt',
        },
    ];

    if (!canView) {
        return (
            <div>
                <Title level={3} style={{ marginBottom: 24 }}>Viewed Properties</Title>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Viewed Properties</Title>
            <Row gutter={24}>
                <Col xs={24} md={8}>
                    <Card style={{ borderRadius: 12, marginBottom: 24 }}>
                        <Form layout="vertical" form={form} onValuesChange={handleFormChange}>
                            <Form.Item name="property" label="Property">
                                <Select placeholder="Select property" allowClear showSearch optionFilterProp="children">
                                    {properties.map(p => (
                                        <Option key={p.key} value={p.title}>{p.title}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="user" label="User">
                                <Select placeholder="Select user" allowClear>
                                    {subUsers.map(u => (
                                        <Option key={u.key} value={u.name}>{u.name}</Option>
                                    ))}
                                    {/* Also include current user if not in subUsers list (like Admin) */}
                                    <Option key="admin" value="Admin User">Admin User</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="range" label="Viewed From / To">
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item>
                                <Button block onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card style={{ borderRadius: 12 }}>
                        <div style={{ display: 'flex', marginBottom: 16, gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Input
                                placeholder="Search by property or user..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ flex: 1, minWidth: 200 }}
                            />
                            <Select
                                value={sortOrder}
                                onChange={setSortOrder}
                                style={{ width: 160 }}
                            >
                                <Option value="Recent">Sort By: Recent</Option>
                                <Option value="Oldest">Sort By: Oldest</Option>
                            </Select>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="key"
                            locale={{ emptyText: 'No Viewed Properties Found' }}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ViewedProperties;
