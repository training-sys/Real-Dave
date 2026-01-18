import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Empty, Button, Upload, Input } from 'antd';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const Dashboard = () => {
    const { properties, tasks, bookings, userProfile, permissions, appSettings, setAppSettings, campaigns } = useData();
    const navigate = useNavigate();

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};

    const canViewProperties = isSuperAdmin || !!(rolePermissions.Properties && rolePermissions.Properties.view);
    const canViewTasks = isSuperAdmin || !!(rolePermissions.Tasks && rolePermissions.Tasks.view);
    const canCreateProperty = isSuperAdmin || !!(rolePermissions.Properties && rolePermissions.Properties.create);
    const canCreateInquiry = isSuperAdmin || !!(rolePermissions.Inquiries && rolePermissions.Inquiries.create);
    const canCreateTask = isSuperAdmin || !!(rolePermissions.Tasks && rolePermissions.Tasks.create);
    const canCreateProject = isSuperAdmin || !!(rolePermissions.Projects && rolePermissions.Projects.create);
    const canCreateDeal = isSuperAdmin || !!(rolePermissions.Deals && rolePermissions.Deals.create);
    const canCreateContact = isSuperAdmin || !!(rolePermissions.Contacts && rolePermissions.Contacts.create);
    const canViewBookings = isSuperAdmin || !!(rolePermissions.Bookings && rolePermissions.Bookings.view);
    const canViewInquiry = isSuperAdmin || !!(rolePermissions.Inquiries && rolePermissions.Inquiries.view);

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('dashboardNotes');
        return saved ? JSON.parse(saved) : { 1: '', 2: '', 3: '' };
    });

    const [activeSummary, setActiveSummary] = useState('recent');

    useEffect(() => {
        localStorage.setItem('dashboardNotes', JSON.stringify(notes));
    }, [notes]);

    const recentProperties = canViewProperties ? [...properties].slice(-10).reverse() : [];

    // Stats
    const totalUnits = properties.length;
    const availableUnits = properties.filter(p => !p.status || p.status === 'Available' || p.status === 'Active').length;
    const totalBookings = bookings ? bookings.length : 0;
    const totalRevenue = bookings ? bookings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) : 0;
    const activeCampaigns = campaigns ? campaigns.filter(c => c.status === 'Active').length : 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tenDaysAhead = new Date(today);
    tenDaysAhead.setDate(tenDaysAhead.getDate() + 10);

    const todaysTasks = canViewTasks
        ? tasks.filter(t => {
            if (t.status !== 'Pending') return false;
            if (t.dueDate !== todayStr) return false;
            if (t.assignee && t.assignee !== userProfile.name) return false;
            return true;
        })
        : [];

    const pendingTenDaysTasks = canViewTasks
        ? tasks.filter(t => {
            if (t.status !== 'Pending') return false;
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            if (Number.isNaN(due.getTime())) return false;
            return due >= today && due <= tenDaysAhead;
        })
        : [];

    const handleLogoUpload = file => {
        const reader = new FileReader();
        reader.onload = () => {
            setAppSettings({ ...appSettings, companyLogo: reader.result });
        };
        reader.readAsDataURL(file);
        return false;
    };

    const logoUrl = appSettings.companyLogo;

    const updateNote = (id, value) => {
        setNotes(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div>
            <Row gutter={[8, 8]}>
                <Col xs={24} md={6} lg={6}>
                    <Card
                        size="small"
                        bodyStyle={{ padding: 10 }}
                        style={{ marginBottom: 6, textAlign: 'center', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        bordered
                    >
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={handleLogoUpload}
                        >
                            <Button block style={{ height: 80, fontSize: 16 }}>
                                Upload Company Logo
                            </Button>
                        </Upload>
                        {logoUrl && (
                            <div style={{ marginTop: 16 }}>
                                <img
                                    src={logoUrl}
                                    alt="Company Logo"
                                    style={{ maxWidth: '100%', maxHeight: 80, objectFit: 'contain' }}
                                />
                            </div>
                        )}
                    </Card>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Button
                            block
                            type="primary"
                            style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                            onClick={() => navigate('/datamigration')}
                        >
                            Data Migration
                        </Button>
                        <Button
                            block
                            type="primary"
                            onClick={() => navigate('/')}
                        >
                            Dashboard
                        </Button>
                        {canViewProperties && (
                            <Button
                                block
                                type="primary"
                                onClick={() => navigate('/searchProperty')}
                            >
                                Inventory
                            </Button>
                        )}
                        {canViewBookings && (
                            <Button
                                block
                                type="primary"
                                onClick={() => navigate('/bookings')}
                            >
                                Bookings
                            </Button>
                        )}
                        {canViewInquiry && (
                            <Button
                                block
                                type="primary"
                                onClick={() => navigate('/searchInquiry')}
                            >
                                Leads
                            </Button>
                        )}
                    </div>
                </Col>
                <Col xs={24} md={12} lg={12}>
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Row gutter={[16, 16]} style={{ textAlign: 'center' }}>
                            <Col span={4}>
                                <div style={{ fontSize: 12, color: '#888' }}>Total Units</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{totalUnits}</div>
                            </Col>
                            <Col span={5}>
                                <div style={{ fontSize: 12, color: '#888' }}>Available</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>{availableUnits}</div>
                            </Col>
                            <Col span={5}>
                                <div style={{ fontSize: 12, color: '#888' }}>Bookings</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{totalBookings}</div>
                            </Col>
                            <Col span={5}>
                                <div style={{ fontSize: 12, color: '#888' }}>Active Ads</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ed1' }}>{activeCampaigns}</div>
                            </Col>
                            <Col span={5}>
                                <div style={{ fontSize: 12, color: '#888' }}>Revenue</div>
                                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <Card
                        title="Create"
                        size="small"
                        bodyStyle={{ padding: 10 }}
                    >
                        <Row gutter={[16, 16]}>
                            {canCreateProperty && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/addproperty')}>
                                        Property
                                    </Button>
                                </Col>
                            )}
                            {canCreateInquiry && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/searchInquiry')}>
                                        Inquiry
                                    </Button>
                                </Col>
                            )}
                            {canCreateTask && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/tasks')}>
                                        Task
                                    </Button>
                                </Col>
                            )}
                            {canCreateProject && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/projects')}>
                                        Project
                                    </Button>
                                </Col>
                            )}
                            {canCreateDeal && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/deals')}>
                                        Deal
                                    </Button>
                                </Col>
                            )}
                            {canCreateContact && (
                                <Col xs={12} md={8}>
                                    <Button block type="primary" onClick={() => navigate('/contact')}>
                                        Contact
                                    </Button>
                                </Col>
                            )}
                        </Row>
                    </Card>

                    <Card
                        title="Data Migration"
                        size="small"
                        bodyStyle={{ padding: 10 }}
                        style={{ marginTop: 8, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                    >
                        <p>
                            Transfer your existing data in this for faster bulk updates and easier management.
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <Button type="primary" onClick={() => navigate('/datamigration')}>
                                Migrate Data
                            </Button>
                            <Button onClick={() => navigate('/')}>
                                Later
                            </Button>
                        </div>
                    </Card>

                    <Card size="small" bodyStyle={{ padding: 10 }} style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                            <Button
                                shape="round"
                                type={activeSummary === 'recent' ? 'primary' : 'default'}
                                onClick={() => setActiveSummary('recent')}
                            >
                                Recent 10 Properties
                            </Button>
                            <Button
                                shape="round"
                                type={activeSummary === 'today' ? 'primary' : 'default'}
                                onClick={() => setActiveSummary('today')}
                            >
                                Today&apos;s My Tasks
                            </Button>
                            <Button
                                shape="round"
                                type={activeSummary === 'pending' ? 'primary' : 'default'}
                                onClick={() => setActiveSummary('pending')}
                            >
                                Pending Tasks (10 Days)
                            </Button>
                        </div>

                        {activeSummary === 'recent' && (
                            <>
                                {!canViewProperties ? (
                                    <Empty description="You do not have permission to view properties" />
                                ) : recentProperties.length === 0 ? (
                                    <Empty description="No Recent Property Added" />
                                ) : (
                                    <List
                                        dataSource={recentProperties}
                                        renderItem={item => (
                                            <List.Item>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{item.title}</span>
                                                    <span style={{ fontSize: 12, color: '#64748b' }}>{item.status}</span>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        {activeSummary === 'today' && (
                            <>
                                {!canViewTasks ? (
                                    <Empty description="You do not have permission to view tasks" />
                                ) : todaysTasks.length === 0 ? (
                                    <Empty description="No tasks for today" />
                                ) : (
                                    <List
                                        dataSource={todaysTasks}
                                        renderItem={item => (
                                            <List.Item>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{item.title}</span>
                                                    <span style={{ fontSize: 12, color: '#64748b' }}>{item.dueDate}</span>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        {activeSummary === 'pending' && (
                            <>
                                {!canViewTasks ? (
                                    <Empty description="You do not have permission to view tasks" />
                                ) : pendingTenDaysTasks.length === 0 ? (
                                    <Empty description="No pending tasks in next 10 days" />
                                ) : (
                                    <List
                                        dataSource={pendingTenDaysTasks}
                                        renderItem={item => (
                                            <List.Item>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{item.title}</span>
                                                    <span style={{ fontSize: 12, color: '#64748b' }}>{item.dueDate}</span>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={6} lg={6}>
                    <Card
                        title="Note 1"
                        size="small"
                        bodyStyle={{ padding: 8 }}
                        style={{ marginBottom: 8, backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Take a Note 1..."
                            value={notes[1]}
                            onChange={e => updateNote(1, e.target.value)}
                        />
                    </Card>

                    <Card
                        title="Note 2"
                        size="small"
                        bodyStyle={{ padding: 8 }}
                        style={{ marginBottom: 8, backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Take a Note 2..."
                            value={notes[2]}
                            onChange={e => updateNote(2, e.target.value)}
                        />
                    </Card>

                    <Card
                        title="Note 3"
                        size="small"
                        bodyStyle={{ padding: 8 }}
                        style={{ marginBottom: 0, backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Take a Note 3..."
                            value={notes[3]}
                            onChange={e => updateNote(3, e.target.value)}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
