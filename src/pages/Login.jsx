import { Form, Input, Button, Checkbox, Card, Typography, Select, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Login = () => {
    const navigate = useNavigate();
    const { userProfile, setUserProfile, subUsers } = useData();

    const onFinish = (values) => {
        const { username, password } = values;

        // Find user in the database (subUsers)
        // We check against either email or name for convenience in this mock auth
        const user = subUsers.find(u =>
            (u.email === username || u.name === username) && u.password === password
        );

        if (user || (username === 'admin' && password === 'admin')) {
            const userData = user || {
                name: 'Super Admin',
                email: 'admin@realdave.com',
                role: 'Administrator',
                phone: '0000000000'
            };

            setUserProfile({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                phone: userData.phone
            });
            localStorage.setItem('isAuthenticated', 'true');

            // Record Session
            const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
            const newSession = {
                key: Date.now().toString(),
                device: navigator.userAgent,
                ip: '192.168.1.' + Math.floor(Math.random() * 255), // Mock IP
                lastActive: new Date().toLocaleString(),
                current: true
            };
            // Mark others as not current
            const updatedSessions = sessions.map(s => ({ ...s, current: false }));
            updatedSessions.push(newSession);
            localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));

            navigate('/');
        } else {
            message.error('Invalid username or password');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #2563EB 100%)'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(15,23,42,0.35)', borderRadius: 12, border: '1px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 4, color: '#0f172a' }}>RealE-Market</Title>
                    <Text style={{ color: '#64748b' }}>Real Estate CRM</Text>
                </div>

                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>

                    {/* Role selection removed, role is determined by user account */}

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>

                        <a className="login-form-forgot" href="" style={{ float: 'right' }}>
                            Forgot password
                        </a>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            block
                            style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                        >
                            Log in
                        </Button>
                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                            Or <a href="">register now!</a>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
