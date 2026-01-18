import { Card, Button, Steps, Typography, Alert, Form, Input, Switch, Space, message, Row, Col } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const { Title, Paragraph } = Typography;

const WhatsAppIntegration = () => {
    const { appSettings, setAppSettings, userProfile, permissions } = useData();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Settings || {};
    const canView = isSuperAdmin || !!modulePermissions.view;
    const canEdit = isSuperAdmin || !!modulePermissions.edit || !!modulePermissions.create;

    const isConnected = !!appSettings.whatsappConnected;
    const hasAccount = !!appSettings.whatsappNumber;
    const accountHint = hasAccount
        ? `Using account ${appSettings.whatsappNumber}`
        : 'Add an account in “Whatsapp Account/Number”';

    const ensureAccountOrWarn = (action) => {
        if (!hasAccount) {
            message.warning('Add an account in “Whatsapp Account/Number” first.');
            return;
        }
        action();
    };

    const handleConnectToggle = () => {
        if (!canEdit) {
            message.warning('You do not have permission to update WhatsApp settings.');
            return;
        }
        const nextConnected = !isConnected;
        setAppSettings({
            ...appSettings,
            whatsappConnected: nextConnected,
        });
        if (nextConnected) {
            message.success('WhatsApp connected (mock connection)');
        } else {
            message.info('WhatsApp disconnected');
        }
    };

    const handleSaveSettings = (values) => {
        if (!canEdit) {
            message.warning('You do not have permission to update WhatsApp settings.');
            return;
        }
        setAppSettings({
            ...appSettings,
            ...values,
        });
        message.success('WhatsApp settings saved');
    };

    const handleTestMessage = () => {
        if (!canView) {
            return;
        }
        const number = form.getFieldValue('whatsappNumber') || appSettings.whatsappNumber;
        const template = form.getFieldValue('whatsappTemplate') || appSettings.whatsappTemplate;

        if (!number) {
            message.warning('Please enter a WhatsApp number first');
            return;
        }

        const digits = number.replace(/[^\d]/g, '');
        if (!digits) {
            message.warning('WhatsApp number is not valid');
            return;
        }

        const text = (template || '').replace('{name}', '');
        const url = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
        window.open(url, '_blank');
    };

    if (!canView) {
        return (
            <div>
                <Title level={2}><WhatsAppOutlined style={{ color: '#25D366' }} /> WhatsApp Integration</Title>
                <Paragraph>You do not have permission to view this module.</Paragraph>
            </div>
        );
    }

    return (
        <div>
            <Title level={2}><WhatsAppOutlined style={{ color: '#25D366' }} /> WhatsApp Integration</Title>
            <Paragraph>Connect your WhatsApp Business API to send automated notifications and chat with leads directly.</Paragraph>

            <Card>
                <Steps
                    current={isConnected ? 2 : 1}
                    items={[
                        {
                            title: 'Register',
                            description: 'Create Meta Business Account',
                        },
                        {
                            title: 'Connect',
                            description: 'Link your business number',
                        },
                        {
                            title: 'Configure',
                            description: 'Set up automated templates',
                        },
                    ]}
                />

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <Alert
                        message={isConnected ? 'Status: Connected' : 'Status: Disconnected'}
                        description={isConnected
                            ? 'WhatsApp is connected. You can now send test messages and configure templates.'
                            : 'Please connect your WhatsApp Business number to start sending messages.'}
                        type={isConnected ? 'success' : 'warning'}
                        showIcon
                        style={{ marginBottom: 20, textAlign: 'left' }}
                    />

                    <div style={{ background: '#f0f2f5', padding: 20, borderRadius: 8, display: 'inline-block' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" style={{ width: 150, opacity: 0.5 }} />
                        <p>Scan QR Code (Mock)</p>
                    </div>
                    <br /><br />
                    <Space direction="vertical" style={{ width: 400, textAlign: 'left', margin: '0 auto' }}>
                        <Form
                            layout="vertical"
                            form={form}
                            initialValues={{
                                whatsappEnabled: appSettings.whatsappEnabled,
                                whatsappNumber: appSettings.whatsappNumber,
                                whatsappTemplate: appSettings.whatsappTemplate,
                            }}
                            onFinish={handleSaveSettings}
                        >
                            <Form.Item
                                name="whatsappEnabled"
                                label="Enable WhatsApp Notifications"
                                valuePropName="checked"
                            >
                                <Switch disabled={!canEdit} />
                            </Form.Item>
                            <Form.Item
                                name="whatsappNumber"
                                label="Business WhatsApp Number"
                                rules={[{ required: true, message: 'Please enter WhatsApp number' }]}
                            >
                                <Input placeholder="+91 98765 43210" disabled={!canEdit} />
                            </Form.Item>
                            <Form.Item
                                name="whatsappTemplate"
                                label="Default Message Template"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Hi {name}, thank you for your interest..."
                                    disabled={!canEdit}
                                />
                            </Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" disabled={!canEdit}>
                                    Save Settings
                                </Button>
                                <Button onClick={handleTestMessage} disabled={!isConnected}>
                                    Send Test Message
                                </Button>
                            </Space>
                        </Form>
                        <Button
                            type={isConnected ? 'default' : 'primary'}
                            size="large"
                            icon={<WhatsAppOutlined />}
                            onClick={handleConnectToggle}
                            disabled={!canEdit}
                        >
                            {isConnected ? 'Disconnect WhatsApp' : 'Connect WhatsApp'}
                        </Button>
                    </Space>
                </div>
            </Card>
            <div style={{ marginTop: 32 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="WhatsApp Chats"
                            bordered
                            actions={[
                                <Button
                                    key="open"
                                    type="link"
                                    onClick={() =>
                                        ensureAccountOrWarn(() =>
                                            message.info('WhatsApp chats will be available in a future update.')
                                        )
                                    }
                                >
                                    Open
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                Manage your WhatsApp messages or settings.
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Template"
                            bordered
                            actions={[
                                <Button
                                    key="templates"
                                    type="link"
                                    onClick={() =>
                                        ensureAccountOrWarn(() =>
                                            message.info('Template management will be available in a future update.')
                                        )
                                    }
                                >
                                    Manage Templates
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                View or edit your saved templates.
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Media"
                            bordered
                            actions={[
                                <Button
                                    key="media"
                                    type="link"
                                    onClick={() =>
                                        ensureAccountOrWarn(() =>
                                            message.info('Media library will be available in a future update.')
                                        )
                                    }
                                >
                                    Open Media
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                Upload and manage images, videos, and files.
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Create Campaign"
                            bordered
                            actions={[
                                <Button
                                    key="campaign"
                                    type="link"
                                    onClick={() =>
                                        ensureAccountOrWarn(() =>
                                            message.info('Campaign sending will be available in a future update.')
                                        )
                                    }
                                >
                                    Create Campaign
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                Send the message to the Customers just by one click
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Whatsapp Account/Number"
                            bordered
                            actions={[
                                <Button
                                    key="settings"
                                    type="link"
                                    onClick={() => navigate('/settings')}
                                >
                                    Go to Settings
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                Add Whatsapp Account to manage it.
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Contact List"
                            bordered
                            actions={[
                                <Button
                                    key="contacts"
                                    type="link"
                                    onClick={() =>
                                        ensureAccountOrWarn(() => navigate('/contact'))
                                    }
                                >
                                    Open Contacts
                                </Button>,
                            ]}
                        >
                            <Paragraph style={{ marginBottom: 8 }}>
                                List of contacts for WhatsApp communication.
                            </Paragraph>
                            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {accountHint}
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default WhatsAppIntegration;
