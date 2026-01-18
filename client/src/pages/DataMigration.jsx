import { useState } from 'react';
import { Row, Col, Card, Typography, Button, Divider, Upload, message, Modal } from 'antd';
import { HomeOutlined, UsergroupAddOutlined, EnvironmentOutlined, FileTextOutlined, DownloadOutlined, UploadOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const { Title, Paragraph, Text } = Typography;

const DataMigration = () => {
    const navigate = useNavigate();
    const {
        userProfile, permissions,
        properties, inquiries, deals, tasks, contacts,
        areas, societies, features, amenities, sources
    } = useData();

    const [importModalVisible, setImportModalVisible] = useState(false);

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Settings || {};
    const canView = isSuperAdmin || !!modulePermissions.view;

    if (!canView) {
        return (
            <div>
                <Title level={3}>Data Migration</Title>
                <Paragraph>You do not have permission to view this module.</Paragraph>
            </div>
        );
    }

    const handleExport = () => {
        const fullData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: {
                properties,
                inquiries,
                deals,
                tasks,
                contacts,
                masterLists: {
                    areas,
                    societies,
                    features,
                    amenities,
                    sources
                }
            }
        };

        const jsonString = JSON.stringify(fullData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        message.success('System data exported successfully');
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!imported.data || !imported.version) {
                    message.error('Invalid backup file format');
                    return;
                }

                // In a real app, we would merge or replace state here.
                // Since our DataContext syncs to localStorage, we can manually update localStorage
                // and then reload the page to hydrate state.

                const { data } = imported;

                if (data.properties) localStorage.setItem('properties', JSON.stringify(data.properties));
                if (data.inquiries) localStorage.setItem('inquiries', JSON.stringify(data.inquiries));
                if (data.deals) localStorage.setItem('deals', JSON.stringify(data.deals));
                if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
                if (data.contacts) localStorage.setItem('contacts', JSON.stringify(data.contacts));

                if (data.masterLists) {
                    if (data.masterLists.areas) localStorage.setItem('areas', JSON.stringify(data.masterLists.areas));
                    if (data.masterLists.societies) localStorage.setItem('societies', JSON.stringify(data.masterLists.societies));
                    if (data.masterLists.features) localStorage.setItem('features', JSON.stringify(data.masterLists.features));
                    if (data.masterLists.amenities) localStorage.setItem('amenities', JSON.stringify(data.masterLists.amenities));
                    if (data.masterLists.sources) localStorage.setItem('sources', JSON.stringify(data.masterLists.sources));
                }

                message.success('Data imported successfully! Reloading...');
                setTimeout(() => window.location.reload(), 1500);

            } catch (err) {
                console.error(err);
                message.error('Failed to parse JSON file');
            }
        };
        reader.readAsText(file);
        return false; // Prevent default upload
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={3}>We understand the importance of your existing data</Title>
                <Paragraph style={{ marginBottom: 0, color: '#64748b' }}>
                    Migrate everything in seconds
                </Paragraph>
            </div>

            <Card style={{ marginBottom: 32, borderRadius: 12, border: '1px solid #d9d9d9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            <DatabaseOutlined style={{ marginRight: 8, color: '#2563EB' }} />
                            Full System Backup & Restore
                        </Title>
                        <Paragraph type="secondary" style={{ margin: 0, marginTop: 4 }}>
                            Export all your CRM data (properties, deals, contacts, settings) to a JSON file or restore from a previous backup.
                        </Paragraph>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Button
                            type="default"
                            icon={<DownloadOutlined />}
                            size="large"
                            onClick={handleExport}
                        >
                            Export Data
                        </Button>
                        <Upload
                            beforeUpload={handleImport}
                            showUploadList={false}
                            accept=".json"
                        >
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                size="large"
                            >
                                Import Data
                            </Button>
                        </Upload>
                    </div>
                </div>
            </Card>

            <Divider orientation="left">Legacy Import Tools</Divider>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={12}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/searchProperty')}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                            <HomeOutlined style={{ fontSize: 32, color: '#2563EB' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Upload Properties</Title>
                            <Paragraph type="secondary">
                                Bulk upload residential or commercial properties via CSV/Excel.
                            </Paragraph>
                            <Button type="primary" style={{ marginTop: 8 }} onClick={() => navigate('/searchProperty')}>
                                Go to Upload
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/searchInquiry')}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                            <UsergroupAddOutlined style={{ fontSize: 32, color: '#2563EB' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Upload Inquiries</Title>
                            <Paragraph type="secondary">
                                Add all your client inquiries from portals and spreadsheets.
                            </Paragraph>
                            <Button type="primary" style={{ marginTop: 8 }} onClick={() => navigate('/searchInquiry')}>
                                Go to Upload
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
                <Text strong>Bulk Upload Supporting Data</Text>
            </div>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/arealist')}
                    >
                        <EnvironmentOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Areas</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Add predefined areas in one shot.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/societyList')}
                    >
                        <HomeOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Societies</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Add mapped societies for each area.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/featureList')}
                    >
                        <FileTextOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Features</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Define reusable property features like corner unit, garden facing.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/contact')}
                    >
                        <UsergroupAddOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Contacts</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Add contact master data in one sheet.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/contactgroup')}
                    >
                        <UsergroupAddOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Contact Groups</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Categorise contacts as doctors, investors, builders and more.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        onClick={() => navigate('/sources')}
                    >
                        <FileTextOutlined style={{ fontSize: 28, color: '#2563EB' }} />
                        <Title level={5} style={{ marginTop: 8 }}>Create Bulk Sources</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Add lead sources like portals, referrals, campaigns.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DataMigration;
