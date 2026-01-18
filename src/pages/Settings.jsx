import { Tabs, Form, Input, Button, Switch, Divider, message } from 'antd';
import { useData } from '../context/DataContext';

const Settings = () => {
  const { appSettings, setAppSettings, userProfile, permissions } = useData();

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Settings || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canEdit = isSuperAdmin || !!modulePermissions.edit || !!modulePermissions.create;

  const handleSave = (values) => {
    if (!canEdit) {
      return;
    }
    setAppSettings({ ...appSettings, ...values });
    message.success('Settings saved successfully');
  };

  if (!canView) {
    return (
      <div>
        <h2>Settings</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Settings</h2>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="General" key="1">
          <Form
            layout="vertical"
            style={{ maxWidth: 600 }}
            initialValues={appSettings}
            onFinish={handleSave}
          >
            <Form.Item name="companyName" label="Company Name">
              <Input disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="website" label="Website">
              <Input disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="language" label="Language">
              <Input disabled={!canEdit} />
            </Form.Item>
            <Button type="primary" htmlType="submit" disabled={!canEdit}>Save Changes</Button>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Notifications" key="2">
          <Form
            layout="horizontal"
            style={{ maxWidth: 600 }}
            initialValues={appSettings}
            onValuesChange={(_, allValues) => {
              if (!canEdit) {
                return;
              }
              handleSave(allValues);
            }}
          >
            <Form.Item name="emailNotifs" label="Email Notifications" valuePropName="checked">
              <Switch disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="smsNotifs" label="SMS Notifications" valuePropName="checked">
              <Switch disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="leadAlerts" label="New Lead Alerts" valuePropName="checked">
              <Switch disabled={!canEdit} />
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Security" key="3">
          <Button danger disabled={!canEdit}>Change Password</Button>
          <Divider />
          <Button danger disabled={!canEdit}>Enable 2FA</Button>
        </Tabs.TabPane>
        <Tabs.TabPane tab="WhatsApp" key="4">
          <Form
            layout="vertical"
            style={{ maxWidth: 600 }}
            initialValues={appSettings}
            onFinish={handleSave}
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
              <Input disabled={!canEdit} placeholder="+91 98765 43210" />
            </Form.Item>
            <Form.Item
              name="whatsappTemplate"
              label="Default Message Template"
            >
              <Input.TextArea
                rows={3}
                disabled={!canEdit}
                placeholder="Hi {name}, thank you for your interest in our properties."
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" disabled={!canEdit}>
              Save WhatsApp Settings
            </Button>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
