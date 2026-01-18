import { useState } from 'react';
import { Card, Avatar, Descriptions, Form, Input, Modal } from 'antd';
import { UserOutlined, EditOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const Profile = () => {
  const { userProfile, setUserProfile } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue(userProfile);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      setUserProfile({ ...userProfile, ...values, role: userProfile.role });
      setIsModalOpen(false);
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Card
        style={{ width: 600, marginTop: 50 }}
        actions={[
          <EditOutlined key="edit" onClick={handleEdit} />,
        ]}
      >
        <Card.Meta
          avatar={<Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#2563EB' }} />}
          title={userProfile.name}
          description={userProfile.role}
        />
        <Descriptions title="User Info" layout="vertical" bordered style={{ marginTop: 20 }}>
          <Descriptions.Item label="Email"><MailOutlined /> {userProfile.email}</Descriptions.Item>
          <Descriptions.Item label="Phone"><PhoneOutlined /> {userProfile.phone}</Descriptions.Item>
          <Descriptions.Item label="Role"><HomeOutlined /> {userProfile.role}</Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>
            {userProfile.status}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
