import { useState } from 'react';
import { Typography, Card, Row, Col, Steps, Form, Input, Select, Upload, Button, Radio, DatePicker, message, Divider, Table, Tag } from 'antd';
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined, UploadOutlined, RocketOutlined, FormOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AdvtBooster = () => {
    const { properties, campaigns, addCampaign } = useData();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [platform, setPlatform] = useState('facebook');

    const steps = [
        { title: 'Select Platform', icon: <RocketOutlined /> },
        { title: 'Campaign Details', icon: <FormOutlined /> },
        { title: 'Creative & Review', icon: <UploadOutlined /> },
    ];

    const handleNext = () => {
        form.validateFields().then(() => {
            setCurrentStep(currentStep + 1);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleLaunch = () => {
        form.validateFields().then((values) => {
            message.loading({ content: 'Launching Campaign...', key: 'launch' });

            // Simulate API delay
            setTimeout(() => {
                const newCampaign = {
                    ...values,
                    platform,
                    status: 'Active',
                    startDate: values.duration ? values.duration[0].format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
                    endDate: values.duration ? values.duration[1].format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
                    spent: 0,
                    leads: 0,
                    clicks: 0
                };

                addCampaign(newCampaign);

                message.success({ content: 'Campaign Launched Successfully!', key: 'launch', duration: 3 });
                setCurrentStep(0);
                form.resetFields();
            }, 1500);
        });
    };

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'campaignName',
            key: 'campaignName',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Platform',
            dataIndex: 'platform',
            key: 'platform',
            render: (p) => <Tag color="blue">{p.toUpperCase()}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (val) => `₹${val}`,
        },
        {
            title: 'Leads Generated',
            dataIndex: 'leads',
            key: 'leads',
        },
    ];

    const renderPlatformSelection = () => (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Title level={4}>Where do you want to advertise?</Title>
            <Radio.Group
                onChange={e => setPlatform(e.target.value)}
                value={platform}
                size="large"
                style={{ marginTop: 24 }}
            >
                <Row gutter={[24, 24]} justify="center">
                    {[
                        { value: 'facebook', label: 'Facebook Ads', icon: <FacebookOutlined style={{ fontSize: 32, color: '#1877F2' }} /> },
                        { value: 'instagram', label: 'Instagram Ads', icon: <InstagramOutlined style={{ fontSize: 32, color: '#E1306C' }} /> },
                        { value: 'linkedin', label: 'LinkedIn Ads', icon: <LinkedinOutlined style={{ fontSize: 32, color: '#0077B5' }} /> },
                        { value: 'google', label: 'Google Ads', icon: <TwitterOutlined style={{ fontSize: 32, color: '#1DA1F2' }} /> }, // Using twitter icon as placeholder for Google
                    ].map(p => (
                        <Col key={p.value}>
                            <Radio.Button
                                value={p.value}
                                style={{
                                    height: 120,
                                    width: 120,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 12,
                                    margin: '0 12px'
                                }}
                            >
                                {p.icon}
                                <div style={{ marginTop: 8 }}>{p.label}</div>
                            </Radio.Button>
                        </Col>
                    ))}
                </Row>
            </Radio.Group>
        </div>
    );

    const renderCampaignDetails = () => (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
            <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Summer Villa Sale" />
            </Form.Item>

            <Form.Item name="objective" label="Campaign Objective" rules={[{ required: true }]}>
                <Select placeholder="Select objective">
                    <Option value="leads">Lead Generation</Option>
                    <Option value="traffic">Website Traffic</Option>
                    <Option value="awareness">Brand Awareness</Option>
                </Select>
            </Form.Item>

            <Form.Item name="property" label="Link Property (Optional)">
                <Select placeholder="Select a property to promote" showSearch optionFilterProp="children">
                    {properties.map(p => (
                        <Option key={p.key} value={p.title}>{p.title}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="audience" label="Target Audience" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="Select interests">
                    <Option value="luxury">Luxury Real Estate</Option>
                    <Option value="investors">Property Investors</Option>
                    <Option value="firsttime">First-time Buyers</Option>
                    <Option value="families">Families</Option>
                </Select>
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="budget" label="Daily Budget (₹)" rules={[{ required: true }]}>
                        <Input type="number" prefix="₹" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );

    const renderCreative = () => (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
            <Form.Item name="adHeadline" label="Ad Headline" rules={[{ required: true }]}>
                <Input placeholder="e.g. Dream Home Awaits!" />
            </Form.Item>

            <Form.Item name="adText" label="Primary Text" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describe your offer..." />
            </Form.Item>

            <Form.Item name="adMedia" label="Ad Media">
                <Upload listType="picture-card">
                    <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>

            <Divider />

            <div style={{ background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                <Text strong>Estimated Reach:</Text> <Text>12,000 - 35,000 people</Text><br />
                <Text strong>Estimated Leads:</Text> <Text>40 - 120 per week</Text>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Advt. Booster</Title>
                <Paragraph type="secondary">Create and launch social media ad campaigns directly from your CRM.</Paragraph>
            </div>

            <Card style={{ borderRadius: 12 }}>
                <Steps current={currentStep} style={{ marginBottom: 40 }}>
                    {steps.map(item => <Step key={item.title} title={item.title} icon={item.icon} />)}
                </Steps>

                <Form form={form} layout="vertical">
                    <div style={{ minHeight: 300 }}>
                        {currentStep === 0 && renderPlatformSelection()}
                        {currentStep === 1 && renderCampaignDetails()}
                        {currentStep === 2 && renderCreative()}
                    </div>

                    <Divider />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                        {currentStep > 0 && (
                            <Button onClick={handlePrev} size="large">
                                Previous
                            </Button>
                        )}
                        {currentStep < steps.length - 1 && (
                            <Button type="primary" onClick={handleNext} size="large">
                                Next
                            </Button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <Button type="primary" onClick={handleLaunch} size="large" icon={<RocketOutlined />}>
                                Launch Campaign
                            </Button>
                        )}
                    </div>
                </Form>
            </Card>

            <div style={{ marginTop: 32 }}>
                <Title level={4}>Recent Campaigns</Title>
                <Table
                    columns={columns}
                    dataSource={campaigns}
                    rowKey="key"
                    locale={{ emptyText: 'No campaigns launched yet' }}
                />
            </div>
        </div>
    );
};

export default AdvtBooster;
