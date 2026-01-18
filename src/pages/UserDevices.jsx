import { useState, useEffect } from 'react';
import { Table, Tag, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined, DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const UserDevices = () => {
    const { userProfile } = useData();
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('activeSessions');
        if (stored) {
            setDevices(JSON.parse(stored));
        } else {
            // Fallback if no login history
            setDevices([{
                key: '1',
                device: navigator.userAgent,
                ip: '192.168.1.1',
                lastActive: 'Just now',
                current: true
            }]);
        }
    }, []);

    const handleRemove = (key) => {
        const newDevices = devices.filter((d) => d.key !== key);
        setDevices(newDevices);
        localStorage.setItem('activeSessions', JSON.stringify(newDevices));
        message.success('Session terminated');
    };

    const columns = [
        {
            title: 'Device / Browser',
            dataIndex: 'device',
            key: 'device',
            render: (text) => {
                const isMobile = /mobile/i.test(text);
                // Simplified UA string
                let simpleName = 'Unknown Device';
                if (text.includes('Windows')) simpleName = 'Windows PC';
                else if (text.includes('Mac')) simpleName = 'MacBook';
                else if (text.includes('Android')) simpleName = 'Android Phone';
                else if (text.includes('iPhone')) simpleName = 'iPhone';
                
                return (
                    <span>
                        {isMobile ? <MobileOutlined style={{ marginRight: 8 }} /> : <DesktopOutlined style={{ marginRight: 8 }} />}
                        {simpleName} <span style={{ color: '#888', fontSize: 10 }}>({text.substring(0, 50)}...)</span>
                    </span>
                );
            }
        },
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            key: 'lastActive',
        },
        {
            title: 'Status',
            key: 'current',
            dataIndex: 'current',
            render: (current) => (
                <Tag color={current ? 'green' : 'default'}>
                    {current ? 'CURRENT SESSION' : 'LOGGED IN'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Popconfirm
                    title="Terminate this session?"
                    onConfirm={() => handleRemove(record.key)}
                    disabled={record.current}
                >
                    <Button icon={<DeleteOutlined />} size="small" danger disabled={record.current}>
                        Logout
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 16 }}>User Devices</h2>
            <p style={{ marginBottom: 8 }}>Logged in as: {userProfile.name}</p>
            <Table columns={columns} dataSource={devices} />
        </div>
    );
};

export default UserDevices;
