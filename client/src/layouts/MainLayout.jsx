import { useState } from 'react';
import { Layout, Menu, theme, Space, Badge, AutoComplete, Input, Button, Popover, Drawer, Dropdown, List, Avatar, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    HomeOutlined,
    ProjectOutlined,
    UsergroupAddOutlined,
    ContactsOutlined,
    BankOutlined,
    CheckSquareOutlined,
    UserOutlined,
    SettingOutlined,
    TransactionOutlined,
    UnorderedListOutlined,
    WhatsAppOutlined,
    BellOutlined,
    LogoutOutlined,
    PlusCircleOutlined,
    QuestionCircleOutlined,
    VideoCameraOutlined,
    CloudUploadOutlined,
    EyeOutlined,
    MenuOutlined,
    WalletOutlined,
    RocketOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useData } from '../context/DataContext';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem('Dashboard', '/', <DashboardOutlined />),
    getItem('Properties', '/searchProperty', <HomeOutlined />),
    getItem('Viewed Properties', '/viewProperty', <EyeOutlined />),
    getItem('Projects', '/projects', <ProjectOutlined />),
    getItem('Inquiries', '/searchInquiry', <UsergroupAddOutlined />),
    getItem('Viewed Inquiries', '/viewInquiry', <EyeOutlined />),
    getItem('Contacts', '/contact', <ContactsOutlined />),
    getItem('Loans', '/loans', <BankOutlined />),
    getItem('Tasks', '/tasks', <CheckSquareOutlined />),
    getItem('Deals', '/deals', <TransactionOutlined />),
    getItem('Bookings', '/bookings', <WalletOutlined />),
    getItem('Profile', '/profile', <UserOutlined />),
    getItem('Sub Users', '/subuser', <UsergroupAddOutlined />),
    getItem('Settings', 'settings-group', <SettingOutlined />, [
        getItem('General Settings', '/settings'),
        getItem('Permissions', '/permission'),
        getItem('Payment Details', '/paymentdetail'),
        getItem('User Devices', '/userdevice'),
        getItem('Change Password', '/changepassword'),
    ]),
    getItem('Master Data', 'master-data', <UnorderedListOutlined />, [
        getItem('Areas', '/arealist'),
        getItem('Sub Types', '/subtypelist'),
        getItem('Societies', '/societyList'),
        getItem('Features', '/featureList'),
        getItem('Amenities', '/amenities'),
        getItem('Sources', '/sources'),
        getItem('Contact Groups', '/contactgroup'),
        getItem('Commissions', '/commission'),
    ]),
    getItem('Data Migration', '/datamigration', <CloudUploadOutlined />),
    getItem('Advt. Booster', '/advtBooster', <RocketOutlined />),
    getItem('WhatsApp', '/whatsapp', <WhatsAppOutlined />),
];

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { properties, contacts, deals, projects, userProfile, appSettings, permissions, tasks, bookings } = useData();

    const [options, setOptions] = useState([]);

    // Notifications Logic
    const dueTasks = tasks ? tasks.filter(t => t.status === 'Pending' && (new Date(t.dueDate) <= new Date())) : [];
    const pendingPayments = bookings ? bookings.filter(b => b.paymentStatus === 'Pending') : [];
    const notificationCount = dueTasks.length + pendingPayments.length;

    const notificationMenu = (
        <List
            style={{ width: 300, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            header={<div style={{ padding: '8px 16px', fontWeight: 'bold' }}>Notifications ({notificationCount})</div>}
            itemLayout="horizontal"
            dataSource={[
                ...dueTasks.map(t => ({ type: 'task', ...t })),
                ...pendingPayments.map(p => ({ type: 'payment', ...p }))
            ]}
            renderItem={(item) => (
                <List.Item
                    style={{ padding: '8px 16px', cursor: 'pointer' }}
                    onClick={() => navigate(item.type === 'task' ? '/tasks' : '/bookings')}
                >
                    <List.Item.Meta
                        avatar={
                            <Avatar
                                icon={item.type === 'task' ? <ClockCircleOutlined /> : <ExclamationCircleOutlined />}
                                style={{ backgroundColor: item.type === 'task' ? '#faad14' : '#ff4d4f' }}
                            />
                        }
                        title={<Text strong style={{ fontSize: 13 }}>{item.type === 'task' ? 'Task Due' : 'Payment Pending'}</Text>}
                        description={<Text style={{ fontSize: 12 }}>{item.type === 'task' ? item.title : `₹${item.amount} pending`}</Text>}
                    />
                </List.Item>
            )}
            locale={{ emptyText: <div style={{ padding: 16, textAlign: 'center' }}>No new notifications</div> }}
        />
    );

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const roleDisplayLabel = userProfile.role === 'Administrator'
        ? 'Super Admin'
        : (userProfile.role || 'User');
    const getRoleBadgeColor = (role) => {
        if (role === 'Administrator') return '#2563EB';
        if (role === 'Manager') return '#722ed1';
        if (role === 'Sales') return '#52c41a';
        return '#64748b';
    };
    const roleBadgeColor = getRoleBadgeColor(userProfile.role);
    const [roleLine1, roleLine2] = (roleDisplayLabel || '').split(' ');
    const rolePermissions = permissions[effectiveRole] || {};

    const appName = 'RealE-Market';
    let subscriberName = appSettings.companyName || 'Subscriber';
    if (subscriberName.includes('Real Dave Inc.')) {
        subscriberName = "Dave's Property Solution";
    }
    const currentYear = new Date().getFullYear();
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getModulePermissions = (moduleName) => {
        return rolePermissions[moduleName] || {};
    };

    const canViewModule = (moduleName) => {
        if (isSuperAdmin) {
            return true;
        }
        const module = getModulePermissions(moduleName);
        return !!module.view;
    };

    const canCreateModule = (moduleName) => {
        if (isSuperAdmin) {
            return true;
        }
        const module = getModulePermissions(moduleName);
        return !!module.create;
    };

    const handleSearch = (value) => {
        if (!value) {
            setOptions([]);
            return;
        }

        const lower = value.toLowerCase();
        const searchResults = [
            ...(canViewModule('Properties')
                ? properties
                    .filter(p => p.title.toLowerCase().includes(lower))
                    .map(p => ({ value: p.title, label: `Property: ${p.title}`, path: '/searchProperty' }))
                : []),
            ...(canViewModule('Contacts')
                ? contacts
                    .filter(c => c.name.toLowerCase().includes(lower))
                    .map(c => ({ value: c.name, label: `Contact: ${c.name}`, path: '/contact' }))
                : []),
            ...(canViewModule('Deals')
                ? deals
                    .filter(d => d.title.toLowerCase().includes(lower))
                    .map(d => ({ value: d.title, label: `Deal: ${d.title}`, path: '/deals' }))
                : []),
            ...(canViewModule('Projects')
                ? projects
                    .filter(p => p.name.toLowerCase().includes(lower))
                    .map(p => ({ value: p.name, label: `Project: ${p.name}`, path: '/projects' }))
                : []),
        ];

        setOptions(searchResults);
    };

    const onSelect = (value, option) => {
        navigate(option.path);
    };

    const onClick = (e) => {
        navigate(e.key);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const getPageTitle = (pathname) => {
        if (pathname === '/') return 'Dashboard';
        if (pathname === '/searchProperty') return 'Properties';
        if (pathname === '/viewProperty') return 'Viewed Properties';
        if (pathname === '/projects') return 'Projects';
        if (pathname === '/searchInquiry') return 'Inquiries';
        if (pathname === '/viewInquiry') return 'Viewed Inquiries';
        if (pathname === '/contact') return 'Contacts';
        if (pathname === '/loans') return 'Loans';
        if (pathname === '/tasks') return 'Tasks';
        if (pathname === '/deals') return 'Deals';
        if (pathname === '/profile') return 'Profile';
        if (pathname === '/subuser') return 'Sub Users';
        if (pathname === '/settings') return 'Settings';
        if (pathname === '/permission') return 'Permissions';
        if (pathname === '/paymentdetail') return 'Payment Details';
        if (pathname === '/userdevice') return 'User Devices';
        if (pathname === '/changepassword') return 'Change Password';
        if (pathname === '/arealist') return 'Areas';
        if (pathname === '/subtypelist') return 'Sub Types';
        if (pathname === '/societyList') return 'Societies';
        if (pathname === '/featureList') return 'Features';
        if (pathname === '/amenities') return 'Amenities';
        if (pathname === '/sources') return 'Sources';
        if (pathname === '/contactgroup') return 'Contact Groups';
        if (pathname === '/commission') return 'Commissions';
        if (pathname === '/datamigration') return 'Data Migration';
        if (pathname === '/whatsapp') return 'WhatsApp';
        if (pathname === '/support') return 'Support';
        if (pathname === '/detailSupport/videoTutorials') return 'Video Tutorials';
        if (pathname === '/detailSupport/userRoles') return 'User Roles';
        if (pathname === '/detailSupport/accountOverview') return 'Account Overview';
        if (pathname === '/detailSupport/configuration') return 'Configuration';
        if (pathname === '/detailSupport/addingProperties') return 'Adding Properties';
        if (pathname === '/policy/PrivacyPolicy') return 'Privacy Policy';
        if (pathname === '/policy/RefundPolicy') return 'Refund Policy';
        if (pathname === '/policy/Terms&Conditions') return 'Terms & Conditions';
        if (pathname === '/policy/Shipping') return 'Shipping Policy';
        return '';
    };

    const topNavButtonStyle = (path) => ({
        fontSize: 14,
        fontWeight: location.pathname === path ? 600 : 400
    });

    const renderQuickActions = (pathname) => {
        if (pathname === '/searchProperty' && canCreateModule('Properties')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/searchProperty', { state: { openAdd: true } })}
                >
                    Add Property
                </Button>
            );
        }

        if (pathname === '/contact' && canCreateModule('Contacts')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/contact', { state: { openAdd: true } })}
                >
                    Add Contact
                </Button>
            );
        }

        if (pathname === '/deals' && canCreateModule('Deals')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/deals', { state: { openAdd: true } })}
                >
                    Add Deal
                </Button>
            );
        }

        if (pathname === '/projects' && canCreateModule('Projects')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/projects', { state: { openAdd: true } })}
                >
                    Add Project
                </Button>
            );
        }

        if (pathname === '/tasks' && canCreateModule('Tasks')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/tasks', { state: { openAdd: true } })}
                >
                    Add Task
                </Button>
            );
        }

        if (pathname === '/searchInquiry' && canCreateModule('Inquiries')) {
            return (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate('/searchInquiry', { state: { openAdd: true } })}
                >
                    Add Inquiry
                </Button>
            );
        }

        return null;
    };

    const handleLogoutAll = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="companyName" disabled>
                Company Name: {appSettings.companyName || 'Company'}
            </Menu.Item>
            <Menu.Item key="userName" disabled>
                User Name: {userProfile.name}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                Profile
            </Menu.Item>
            {canViewModule('Users') && (
                <Menu.Item key="subuser" icon={<UsergroupAddOutlined />} onClick={() => navigate('/subuser')}>
                    Manage Subusers
                </Menu.Item>
            )}
            {canViewModule('Settings') && (
                <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
                    Setting
                </Menu.Item>
            )}
            {canViewModule('Users') && (
                <Menu.Item key="permission" onClick={() => navigate('/permission')}>
                    Manage Permissions
                </Menu.Item>
            )}
            {canViewModule('PaymentDetails') && (
                <Menu.Item key="subscription" icon={<BankOutlined />} onClick={() => navigate('/paymentdetail')}>
                    Subscription
                </Menu.Item>
            )}
            {canViewModule('Deals') && (
                <Menu.Item key="deals" icon={<TransactionOutlined />} onClick={() => navigate('/deals')}>
                    Deals
                </Menu.Item>
            )}
            <Menu.Item key="userdevice" onClick={() => navigate('/userdevice')}>
                User Device
            </Menu.Item>
            <Menu.Item key="changepassword" onClick={() => navigate('/changepassword')}>
                Change Password
            </Menu.Item>
            {canViewModule('Tasks') && (
                <Menu.Item key="tasks" icon={<CheckSquareOutlined />} onClick={() => navigate('/tasks')}>
                    Tasks
                </Menu.Item>
            )}
            {canViewModule('Settings') && (
                <>
                    <Menu.Item key="arealist" onClick={() => navigate('/arealist')}>
                        Areas List
                    </Menu.Item>
                    <Menu.Item key="subtypelist" onClick={() => navigate('/subtypelist')}>
                        Property Subtype List
                    </Menu.Item>
                    <Menu.Item key="societyList" onClick={() => navigate('/societyList')}>
                        Society List
                    </Menu.Item>
                    <Menu.Item key="featureList" onClick={() => navigate('/featureList')}>
                        Feature List
                    </Menu.Item>
                    <Menu.Item key="amenities" onClick={() => navigate('/amenities')}>
                        Amenities List
                    </Menu.Item>
                    <Menu.Item key="sources" onClick={() => navigate('/sources')}>
                        Source List
                    </Menu.Item>
                    <Menu.Item key="contactgroup" onClick={() => navigate('/contactgroup')}>
                        Contact Groups
                    </Menu.Item>
                    <Menu.Item key="commission" onClick={() => navigate('/commission')}>
                        Commission
                    </Menu.Item>
                </>
            )}
            {canViewModule('Settings') && (
                <Menu.Item key="whatsapp" icon={<WhatsAppOutlined />} onClick={() => navigate('/whatsapp')}>
                    WhatsApp
                </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
            <Menu.Item key="logoutAll" danger onClick={handleLogoutAll}>
                Logout All Devices
            </Menu.Item>
        </Menu>
    );

    const globalAddContent = (
        <Space direction="vertical">
            {canCreateModule('Properties') && (
                <Button type="link" onClick={() => navigate('/searchProperty', { state: { openAdd: true } })}>
                    Add Property
                </Button>
            )}
            {canCreateModule('Inquiries') && (
                <Button type="link" onClick={() => navigate('/searchInquiry', { state: { openAdd: true } })}>
                    Add Inquiry
                </Button>
            )}
            {canCreateModule('Tasks') && (
                <Button type="link" onClick={() => navigate('/tasks', { state: { openAdd: true } })}>
                    Add Task
                </Button>
            )}
        </Space>
    );

    const filteredItems = items.filter((item) => {
        // Hide Coming Soon / Server Down Pages
        if (
            item.key === '/bulkProperty' ||
            item.key === '/bulkInquiry' ||
            (item.children && item.children.some(child =>
                child.key.includes('detailSupport') ||
                child.key.includes('policy')
            ))
        ) {
            return false;
        }

        if (item.key === '/advtBooster') {
            // Now active, so we show it if user has access (e.g., Settings or Admin)
            return canViewModule('Settings');
        }

        if (item.key === '/searchProperty') {
            return canViewModule('Properties');
        }
        if (item.key === '/viewProperty') {
            return canViewModule('Properties');
        }
        if (item.key === '/projects') {
            return canViewModule('Projects');
        }
        if (item.key === '/searchInquiry') {
            return canViewModule('Inquiries');
        }
        if (item.key === '/viewInquiry') {
            return canViewModule('Inquiries');
        }
        if (item.key === '/contact') {
            return canViewModule('Contacts');
        }
        if (item.key === '/loans') {
            return canViewModule('Loans');
        }
        if (item.key === '/tasks') {
            return canViewModule('Tasks');
        }
        if (item.key === '/deals') {
            return canViewModule('Deals');
        }
        if (item.key === '/bookings') {
            return canViewModule('Bookings');
        }
        if (item.key === '/subuser') {
            return canViewModule('Users');
        }
        if (item.key === 'settings-group') {
            return (
                canViewModule('Settings') ||
                canViewModule('PaymentDetails') ||
                Object.keys(rolePermissions).length > 0
            );
        }
        if (item.key === 'master-data') {
            return canViewModule('Settings');
        }
        if (item.key === '/datamigration') {
            return canViewModule('Settings');
        }
        if (item.key === '/whatsapp') {
            return canViewModule('Settings');
        }
        return true;
    }).map((item) => {
        if (item.key === 'settings-group' && item.children) {
            const children = item.children.filter((child) => {
                if (child.key === '/settings') {
                    return canViewModule('Settings');
                }
                if (child.key === '/permission') {
                    return canViewModule('Users');
                }
                if (child.key === '/paymentdetail') {
                    return canViewModule('PaymentDetails');
                }
                if (child.key === '/userdevice') {
                    return true;
                }
                if (child.key === '/changepassword') {
                    return true;
                }
                return true;
            });
            return { ...item, children };
        }
        if (item.key === 'master-data' && item.children) {
            const children = item.children.filter(() => canViewModule('Settings'));
            return { ...item, children };
        }
        return item;
    });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{ display: 'none' }}
            >
                <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu
                    theme="dark"
                    defaultSelectedKeys={['/']}
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    items={filteredItems}
                    onClick={onClick}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: '#e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            {appSettings.appLogoUrl ? (
                                <img
                                    src={appSettings.appLogoUrl}
                                    alt="App logo"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}
                                >
                                    {getInitials(appName)}
                                </div>
                            )}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    lineHeight: 1.2,
                                    padding: '2px',
                                    width: 144,
                                    height: 50,
                                    borderRadius: 10,
                                    border: '1px solid #1d4ed8',
                                    backgroundColor: '#2563EB'
                                }}
                            >
                                <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: 0.5 }}>{appName}</span>
                                <span style={{ fontSize: 13, color: '#e5e7eb' }}>{subscriberName}</span>
                            </div>
                            {appSettings.subscriberLogoUrl ? (
                                <img
                                    src={appSettings.subscriberLogoUrl}
                                    alt="Subscriber logo"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 6,
                                        backgroundColor: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#111827',
                                        fontWeight: 600,
                                        fontSize: 12
                                    }}
                                >
                                    {getInitials(subscriberName)}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/')}
                                onClick={() => navigate('/')}
                            >
                                Home
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/searchProperty')}
                                onClick={() => navigate('/searchProperty')}
                            >
                                Properties
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/projects')}
                                onClick={() => navigate('/projects')}
                            >
                                Projects
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/searchInquiry')}
                                onClick={() => navigate('/searchInquiry')}
                            >
                                Inquiries
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/contact')}
                                onClick={() => navigate('/contact')}
                            >
                                Contacts
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/loans')}
                                onClick={() => navigate('/loans')}
                            >
                                Loans
                            </Button>
                            <Button
                                type="text"
                                style={topNavButtonStyle('/tasks')}
                                onClick={() => navigate('/tasks')}
                            >
                                Tasks
                            </Button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<RocketOutlined />}
                            style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                            onClick={() => navigate('/advtBooster')}
                        >
                            Advt. Booster
                        </Button>
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined />}
                            onClick={() => setIsUserGuideOpen(true)}
                        >
                            User guide
                        </Button>
                        <div
                            style={{
                                backgroundColor: roleBadgeColor,
                                color: '#ffffff',
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 600,
                                lineHeight: 1.1,
                                textAlign: 'center'
                            }}
                        >
                            <span>{roleLine1}</span>
                            {roleLine2 && <span>{roleLine2}</span>}
                        </div>
                        <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
                            <Badge count={notificationCount} size="small">
                                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                            </Badge>
                        </Dropdown>
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}
                            onClick={() => setIsRightMenuOpen(true)}
                        />
                    </div>
                </Header>
                <Content style={{ margin: '0 12px' }}>
                    <div
                        style={{
                            padding: 16,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            marginTop: 8
                        }}
                    >
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <Space align="center">
                                <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')} />
                                <span style={{ fontSize: 16, fontWeight: 500 }}>
                                    {getPageTitle(location.pathname)}
                                </span>
                            </Space>
                            <Space>
                                <div style={{ width: 260 }}>
                                    <AutoComplete
                                        options={options}
                                        style={{ width: '100%' }}
                                        onSelect={onSelect}
                                        onSearch={handleSearch}
                                    >
                                        <Input.Search size="middle" placeholder="Search properties, contacts, deals..." />
                                    </AutoComplete>
                                </div>
                                {renderQuickActions(location.pathname) && (
                                    renderQuickActions(location.pathname)
                                )}
                            </Space>
                        </div>
                        <Outlet />
                    </div>
                </Content>
                <Drawer
                    title="Menu"
                    placement="right"
                    width={320}
                    onClose={() => setIsRightMenuOpen(false)}
                    open={isRightMenuOpen}
                    destroyOnClose={false}
                >
                    {userMenu}
                </Drawer>
                <Drawer
                    title="User guide"
                    placement="right"
                    width={520}
                    onClose={() => setIsUserGuideOpen(false)}
                    open={isUserGuideOpen}
                    destroyOnClose={false}
                >
                    <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', paddingRight: 8 }}>
                        <h3>User roles</h3>
                        <p>
                            Super Admin (Administrator): Full access to all modules, data, and settings.
                            Can manage subscriptions, WhatsApp integration, master data, and permissions for
                            other users.
                        </p>
                        <p>
                            Manager: Designed for senior team members. Can typically view and manage
                            properties, inquiries, deals, tasks, projects, contacts, loans, and users as
                            allowed in the Permissions module.
                        </p>
                        <p>
                            Sales: Focused on day-to-day execution. Can work on assigned properties,
                            inquiries, deals, tasks, and contacts according to permissions configured by
                            Super Admin or Manager.
                        </p>

                        <h3>Core modules</h3>
                        <p>
                            Dashboard: Overview of recent properties, tasks, units, bookings, and
                            payments. Summary cards highlight key counts for inventory, bookings, and
                            payment activity so you can see performance at a glance. Quickly navigate
                            to Inventory, Bookings, Leads, data migration, viewed properties, and
                            viewed inquiries from the left panel.
                        </p>
                        <p>
                            Properties: Central place to add, search, filter, and share properties. Use
                            filters for area, price, BHK, and type. Add new properties from the drawer
                            or full add-property form.
                        </p>
                        <p>
                            Inquiries: Capture detailed lead information and their requirements. View
                            portal imports, update status (New, Follow Up, Closed), and log notes and
                            preferences so follow-ups stay organized.
                        </p>
                        <p>
                            Contacts: Maintain a structured list of owners, clients, and brokers. Use
                            contact groups and sources to segment and track where relationships come
                            from.
                        </p>
                        <p>
                            Deals: Visual pipeline for opportunities across stages such as Qualified,
                            Proposal, Negotiation, and Closed. Each card represents a deal with client,
                            value, and agent.
                        </p>
                        <p>
                            Tasks: Create, assign, and follow up tasks. Use tabs for Pending, Completed,
                            and Due Today to manage priorities and daily activities.
                        </p>
                        <p>
                            Loans: Track loan applications linked to your business. Store basic details
                            like applicant, amount, bank, and status.
                        </p>
                        <p>
                            Projects: Manage project-level information such as location, status,
                            inventory, media, and sales contact details.
                        </p>
                        <p>
                            Inventory Management: Manage units mapped to each project and tower. Track
                            status transitions such as Available, Hold, Blocked, and Booked, with hold
                            and block actions protected by role-based permissions.
                        </p>
                        <p>
                            Bookings &amp; Payments: Create bookings by linking a lead to a specific
                            unit. From the booking screen you can generate Razorpay payment links and
                            share them with the client, then review recent bookings from the
                            Bookings page.
                        </p>

                        <h3>Communication and marketing</h3>
                        <p>
                            WhatsApp Integration: Configure your business number, default template, and
                            toggle WhatsApp notifications. Once connected, you can send test messages and
                            use WhatsApp actions from properties, inquiries, contacts, and leads.
                            WhatsApp template messages are triggered through the backend service so
                            communication stays consistent and trackable.
                        </p>
                        <p>
                            Advt. Booster: Accessed from the top bar. Intended for running and managing
                            social media campaigns for selected properties or projects across portals and
                            social platforms. The current version shows an overview page; advanced
                            campaign tools will be added in upcoming updates.
                        </p>

                        <h3>Data setup and migration</h3>
                        <p>
                            Data Migration: Use guided cards to bulk upload properties, inquiries, and
                            supporting master data such as areas, societies, features, contact groups,
                            and sources. Helpful when you move from spreadsheets or other CRMs.
                        </p>
                        <p>
                            Master Data: Manage reusable lists like Areas, Sub Types, Societies,
                            Features, Amenities, Sources, Contact Groups, and Commissions. These lists
                            power dropdowns in property, inquiry, and contact forms.
                        </p>

                        <h3>Settings and security</h3>
                        <p>
                            General Settings: Configure company name, website, language, and notification
                            preferences so that outgoing communication and internal alerts reflect your
                            brand.
                        </p>
                        <p>
                            WhatsApp and notifications: Within Settings you can enable WhatsApp,
                            update the default message template, and control email and SMS alerts for
                            leads and activities.
                        </p>
                        <p>
                            Sub Users and Permissions: Create or deactivate users, assign roles (Sales,
                            Manager, Admin), and control module-wise permissions (view, create, edit,
                            delete) so each team member only sees what they need.
                        </p>

                        <h3>Daily workflow tips</h3>
                        <p>
                            Start your day on the Dashboard to review today&apos;s tasks and recent
                            properties. Use Filters in Properties, Inquiries, Deals, and Loans to quickly
                            focus on high-priority work.
                        </p>
                        <p>
                            Use WhatsApp actions on properties, inquiries, and contacts to follow up
                            instantly using your saved templates, and keep notes updated so the entire
                            team has context.
                        </p>
                        <p>
                            Regularly clean and update master data (areas, sources, contact groups) so
                            filters remain useful and reports stay accurate.
                        </p>
                    </div>
                </Drawer>
                <Footer style={{ padding: '4px 16px 8px', background: '#bae6fd' }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                            fontSize: 10,
                            color: '#0f172a',
                            textAlign: 'center',
                            lineHeight: 1.3
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: 11, color: '#0f172a' }}>
                            {appName}
                        </span>
                        <span>
                            © {currentYear} {subscriberName}. All rights reserved.
                        </span>
                        <span>
                            Call: +91 9423127235 · WhatsApp: +91 9423127235 · Email: support@training@aawas.co.in
                        </span>
                    </div>
                </Footer>
                <div className="bottom-nav">
                    <button type="button" className="bottom-nav-item" onClick={() => navigate('/')}>
                        <DashboardOutlined />
                        <span>Home</span>
                    </button>
                    <button type="button" className="bottom-nav-item" onClick={() => navigate('/support')}>
                        <QuestionCircleOutlined />
                        <span>Support</span>
                    </button>
                    {/* Hidden Self-Help
                    <button type="button" className="bottom-nav-item" onClick={() => navigate('/detailSupport/videoTutorials')}>
                        <VideoCameraOutlined />
                        <span>Self-Help</span>
                    </button>
                    */}
                    <Popover content={globalAddContent} trigger="click" placement="top">
                        <button type="button" className="bottom-nav-item bottom-nav-add">
                            <PlusCircleOutlined />
                            <span>Add</span>
                        </button>
                    </Popover>
                </div>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
