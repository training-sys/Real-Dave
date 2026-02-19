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

    const handleQuickCampaign = (property) => {
        const defaultName = property.title || property.name || 'Property Campaign';
        form.setFieldsValue({
            campaignName: defaultName,
            property: property.title || property.name || '',
        });
        setCurrentStep(1);
    };

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

    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    const totalLeads = campaigns.reduce((sum, c) => sum + (Number(c.leads) || 0), 0);
    const averageCpl = totalLeads > 0 ? Math.round(totalBudget / totalLeads) : 0;

    const platformStats = ['facebook', 'instagram', 'linkedin', 'google'].map(p => {
        const items = campaigns.filter(c => c.platform === p);
        const count = items.length;
        const leads = items.reduce((sum, c) => sum + (Number(c.leads) || 0), 0);
        const spend = items.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
        return { platform: p, count, leads, spend };
    });

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
                <Paragraph type="secondary">
                    Create and manage social media advertisements for selected projects across Instagram, Facebook,
                    WhatsApp, 99acres and more. Detailed campaign builder coming soon.
                </Paragraph>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Text type="secondary">Active Campaigns</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{activeCampaigns}</div>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Text type="secondary">Total Budget</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBudget)}
                        </div>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Text type="secondary">Leads Generated</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{totalLeads}</div>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Text type="secondary">Avg CPL</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                            {averageCpl > 0
                                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(averageCpl)
                                : '—'}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card size="small" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <div>
                            <Text strong>Quick Campaign</Text>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                                Pick a project or property and jump to campaign details.
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={18}>
                        <Row gutter={[8, 8]}>
                            {properties.slice(0, 4).map(p => (
                                <Col key={p.key} xs={12} md={6}>
                                    <Button
                                        block
                                        size="small"
                                        onClick={() => handleQuickCampaign(p)}
                                        style={{ textAlign: 'left', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                                    >
                                        {p.title || p.name || 'Property'}
                                    </Button>
                                </Col>
                            ))}
                            {properties.length === 0 && (
                                <Col xs={24}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        No properties available yet. Add properties to use Quick Campaign.
                                    </Text>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
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

            <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 16 }}>
                {platformStats.map(stat => (
                    <Col xs={24} md={6} key={stat.platform}>
                        <Card size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text strong style={{ textTransform: 'capitalize' }}>{stat.platform}</Text>
                                <Tag>{stat.count} campaigns</Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#888' }}>Leads</div>
                            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stat.leads}</div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Budget</div>
                            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stat.spend)}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

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
