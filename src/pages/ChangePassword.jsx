import { Form, Input, Button, Card, message, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const { userProfile } = useData();

    const onFinish = () => {
        message.success('Password changed successfully! (demo only, not stored on server)');
        form.resetFields();
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card title="Change Password" style={{ width: 500, marginTop: 50 }}>
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={`You are updating the password for ${userProfile.email || userProfile.name || 'current user'}.`}
                />
                <Form
                    form={form}
                    name="change_password"
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="oldPassword"
                        label="Current Password"
                        rules={[{ required: true, message: 'Please input your current password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;
