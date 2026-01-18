import { useState } from 'react';
import { Table, Checkbox, Select, Space, Alert } from 'antd';
import { useData } from '../context/DataContext';

const { Option } = Select;

const Permissions = () => {
    const { permissions, setPermissions, userProfile } = useData();
    const [selectedRole, setSelectedRole] = useState(Object.keys(permissions)[0] || 'Admin');

    const isAdmin = userProfile.role === 'Administrator' || userProfile.role === 'Admin';

    const modules = [
        'Properties',
        'Inquiries',
        'Deals',
        'Contacts',
        'Loans',
        'Tasks',
        'Projects',
        'Users',
        'Settings',
        'PaymentDetails',
    ];

    const handleToggle = (module, action, value) => {
        if (!isAdmin) {
            return;
        }
        setPermissions((prev) => {
            const rolePermissions = prev[selectedRole] || {};
            const modulePermissions = rolePermissions[module] || {};

            return {
                ...prev,
                [selectedRole]: {
                    ...rolePermissions,
                    [module]: {
                        view: false,
                        create: false,
                        edit: false,
                        delete: false,
                        ...modulePermissions,
                        [action]: value,
                    },
                },
            };
        });
    };

    const rows = modules.map((module) => {
        const rolePermissions = permissions[selectedRole] || {};
        const modulePermissions = rolePermissions[module] || {};

        return {
            key: module,
            module,
            view: modulePermissions.view || false,
            create: modulePermissions.create || false,
            edit: modulePermissions.edit || false,
            delete: modulePermissions.delete || false,
        };
    });

    const columns = [
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'View',
            dataIndex: 'view',
            key: 'view',
            render: (checked, record) => (
                <Checkbox
                    checked={checked}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle(record.module, 'view', e.target.checked)}
                />
            ),
        },
        {
            title: 'Create',
            dataIndex: 'create',
            key: 'create',
            render: (checked, record) => (
                <Checkbox
                    checked={checked}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle(record.module, 'create', e.target.checked)}
                />
            ),
        },
        {
            title: 'Edit',
            dataIndex: 'edit',
            key: 'edit',
            render: (checked, record) => (
                <Checkbox
                    checked={checked}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle(record.module, 'edit', e.target.checked)}
                />
            ),
        },
        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            render: (checked, record) => (
                <Checkbox
                    checked={checked}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle(record.module, 'delete', e.target.checked)}
                />
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ marginBottom: 0 }}>Role Permissions</h2>
                <Space>
                    <span>Role:</span>
                    <Select
                        value={selectedRole}
                        onChange={setSelectedRole}
                        style={{ width: 160 }}
                    >
                        {Object.keys(permissions).map((role) => (
                            <Option key={role} value={role}>
                                {role}
                            </Option>
                        ))}
                    </Select>
                </Space>
            </div>
            {!isAdmin && (
                <Alert
                    type="warning"
                    showIcon
                    message="You can view permissions but only Administrators can modify them."
                    style={{ marginBottom: 16 }}
                />
            )}
            <Table columns={columns} dataSource={rows} pagination={false} />
        </div>
    );
};

export default Permissions;
