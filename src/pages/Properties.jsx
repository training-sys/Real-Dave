import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, InputNumber, Select, Upload, Row, Col, Popconfirm, message, Divider, Checkbox } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, WhatsAppOutlined, FilterOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { pdf } from '@react-pdf/renderer';
import PropertyBrochure from '../components/PropertyBrochure';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const Properties = () => {
    const { properties, addProperty, updateProperty, deleteProperty, areas, subTypes, societies, features, amenities, userProfile, permissions, appSettings, logPropertyView, contacts } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [filtered, setFiltered] = useState(properties);

    const isSuperAdmin = userProfile.role === 'Administrator';
    const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
    const rolePermissions = permissions[effectiveRole] || {};
    const modulePermissions = rolePermissions.Properties || {};
    const canView = isSuperAdmin || !!modulePermissions.view;
    const canCreate = isSuperAdmin || !!modulePermissions.create;
    const canEdit = isSuperAdmin || !!modulePermissions.edit;
    const canDelete = isSuperAdmin || !!modulePermissions.delete;
    const canUseWhatsApp = !!appSettings?.whatsappEnabled && !!appSettings?.whatsappConnected;

    const isAddPage = location.pathname === '/addproperty';

    useEffect(() => {
        if (location.state && location.state.openAdd) {
            setEditingItem(null);
            form.resetFields();
            setIsDrawerOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, form, navigate]);

    useEffect(() => {
        setFiltered(properties);
    }, [properties]);

    const handleFilter = () => {
        const values = filterForm.getFieldsValue();
        const {
            search,
            bedrooms,
            minPrice,
            maxPrice,
            area: areaFilter,
            type: typeFilter,
        } = values;

        const next = properties.filter((p) => {
            if (search) {
                const s = search.toLowerCase();
                const matchesText =
                    p.title.toLowerCase().includes(s) ||
                    (p.area || '').toLowerCase().includes(s);
                if (!matchesText) return false;
            }

            if (bedrooms != null && bedrooms !== '' && Number(bedrooms) >= 0) {
                if ((p.bedrooms || 0) !== Number(bedrooms)) return false;
            }

            if (minPrice != null && minPrice !== '' && Number(minPrice) >= 0) {
                if ((p.price || 0) < Number(minPrice)) return false;
            }

            if (maxPrice != null && maxPrice !== '' && Number(maxPrice) >= 0) {
                if ((p.price || 0) > Number(maxPrice)) return false;
            }

            if (areaFilter && p.area !== areaFilter) {
                return false;
            }

            if (typeFilter && p.type !== typeFilter) {
                return false;
            }

            return true;
        });

        setFiltered(next);
    };

    const handleClearFilters = () => {
        filterForm.resetFields();
        setFiltered(properties);
    };

    const handleWhatsApp = (record) => {
        if (!canUseWhatsApp) {
            message.warning('WhatsApp is not enabled. Please configure it in Settings or WhatsApp Integration.');
            return;
        }
        const text = `View this property: ${record.title} in ${record.area || ''}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleView = (record) => {
        logPropertyView(record.key, record.title, userProfile);
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsDrawerOpen(true);
    };

    const handleEdit = (record) => {
        if (!canEdit) {
            return;
        }
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsDrawerOpen(true);
    };

    const handleDelete = (key) => {
        if (!canDelete) {
            return;
        }
        deleteProperty(key);
    };

    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            message.error('Location is not supported in this browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                form.setFieldsValue({
                    locationUrl: url,
                });
                message.success('Location captured from device');
            },
            () => {
                message.error('Unable to fetch location');
            }
        );
    };

    const handleDownloadPDF = async (record) => {
        const hide = message.loading('Generating PDF...', 0);
        try {
            const blob = await pdf(
                <PropertyBrochure
                    property={record}
                    userProfile={userProfile}
                    appSettings={appSettings}
                />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${record.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_brochure.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            message.error('Failed to generate PDF');
        } finally {
            hide();
        }
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                if (lines.length < 2) {
                    message.error('No property data found in file');
                    return;
                }

                const headerParts = lines[0].split(',').map(part => part.trim());
                const headerIndex = {};
                headerParts.forEach((name, index) => {
                    headerIndex[name] = index;
                });

                // Helper to get value case-insensitively from common CSV headers
                const getValue = (parts, ...possibleHeaders) => {
                    for (const h of possibleHeaders) {
                        // Exact match first
                        let idx = headerIndex[h];
                        if (idx !== undefined) return parts[idx]?.trim();

                        // Case-insensitive match
                        const lowerH = h.toLowerCase();
                        const foundKey = Object.keys(headerIndex).find(k => k.toLowerCase() === lowerH);
                        if (foundKey) {
                            idx = headerIndex[foundKey];
                            return parts[idx]?.trim();
                        }
                    }
                    return '';
                };

                const rows = lines.slice(1);
                let importedCount = 0;

                rows.forEach((line) => {
                    const parts = line.split(',').map(part => part.trim());
                    if (!parts.length) return;

                    const title = getValue(parts, 'Title', 'Property Name', 'Project Name') || 'Imported Property';
                    const price = Number(getValue(parts, 'Price', 'Cost', 'Amount')) || 0;
                    const area = getValue(parts, 'Area', 'Location', 'Locality');
                    const type = getValue(parts, 'Type', 'Property Type', 'Sub Type');
                    const bedrooms = Number(getValue(parts, 'BHK', 'Bedrooms', 'Beds')) || 0;
                    const bathrooms = Number(getValue(parts, 'Bathrooms', 'Baths')) || 0;
                    const status = getValue(parts, 'Status') || 'Available';

                    if (!title && !area) return;

                    const propertyItem = {
                        title,
                        price,
                        area,
                        type,
                        bedrooms,
                        bathrooms,
                        status,
                        // Add defaults for other fields
                        amenities: [],
                        features: [],
                        images: []
                    };

                    addProperty(propertyItem);
                    importedCount++;
                });

                if (importedCount > 0) {
                    message.success(`Successfully imported ${importedCount} properties`);
                } else {
                    message.warning('No valid properties found in file');
                }
            } catch (err) {
                console.error(err);
                message.error('Failed to parse CSV file');
            }
        };
        reader.readAsText(file);
        return false;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Area',
            dataIndex: 'area',
            key: 'area',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Beds/Baths',
            key: 'specs',
            render: (_, record) => `${record.bedrooms} Beds / ${record.bathrooms} Baths`
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (_, { status }) => {
                let color = 'green';
                if (status === 'Hold') color = 'orange';
                if (status === 'Blocked') color = 'red';
                if (status === 'Booked') color = 'blue';
                if (status === 'Sold') color = 'purple';
                return (
                    <Tag color={color} key={status}>
                        {status ? status.toUpperCase() : 'AVAILABLE'}
                    </Tag>
                );
            },
        },
        {
            title: 'Share',
            key: 'share',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                        size="small"
                        disabled={!canUseWhatsApp}
                        onClick={() => handleWhatsApp(record)}
                        title="Share on WhatsApp"
                    />
                    <Button
                        icon={<FilePdfOutlined style={{ color: '#ff4d4f' }} />}
                        size="small"
                        onClick={() => handleDownloadPDF(record)}
                        title="Download PDF Brochure"
                    />
                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
                    {canEdit && (
                        <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    )}
                    {canDelete && (
                        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const renderFormFields = () => (
        <>
            <Divider orientation="left">Basic Details</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="title"
                        label="Property Title"
                        rules={[{ required: true, message: 'Please enter property title' }]}
                    >
                        <Input placeholder="e.g. Luxury Villa" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                            parser={value => value.replace(/₹\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="Available"
                    >
                        <Select>
                            <Option value="Available">Available</Option>
                            <Option value="Hold" disabled={!['Administrator', 'Manager'].includes(userProfile.role)}>Hold</Option>
                            <Option value="Blocked" disabled={!['Administrator', 'Manager'].includes(userProfile.role)}>Blocked</Option>
                            <Option value="Booked">Booked</Option>
                            <Option value="Sold">Sold</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="type"
                        label="Property Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select placeholder="Select type">
                            {subTypes.map(type => (
                                <Option key={type.key} value={type.name}>{type.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="area"
                        label="Area/Location"
                        rules={[{ required: true, message: 'Please select area' }]}
                    >
                        <Select placeholder="Select area">
                            {areas.map(area => (
                                <Option key={area.key} value={area.name}>{area.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="society"
                        label="Society"
                    >
                        <Select placeholder="Select society" allowClear>
                            {societies.map(society => (
                                <Option key={society.key} value={society.name}>{society.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Property Specs</Divider>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="bedrooms"
                        label="Bedrooms"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="bathrooms"
                        label="Bathrooms"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="areaSize"
                        label="Size (sq ft)"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Amenities & Features</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="amenities"
                        label="Amenities"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select amenities"
                            allowClear
                        >
                            {amenities.map(amenity => (
                                <Option key={amenity.key} value={amenity.name}>{amenity.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="features"
                        label="Features"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select features"
                            allowClear
                        >
                            {features.map(feature => (
                                <Option key={feature.key} value={feature.name}>{feature.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Description</Divider>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'please enter url description' }]}
                    >
                        <TextArea rows={4} placeholder="please enter url description" />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Location</Divider>
            <Row gutter={16}>
                <Col span={16}>
                    <Form.Item
                        name="locationUrl"
                        label="Google Location URL"
                    >
                        <Input placeholder="https://www.google.com/maps?..." />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Button
                        style={{ marginTop: 30, width: '100%' }}
                        icon={<EnvironmentOutlined />}
                        onClick={handleCaptureLocation}
                    >
                        Use Current Location
                    </Button>
                </Col>
            </Row>

            <Divider orientation="left">Images</Divider>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="images"
                        label="Images"
                    >
                        <Upload
                            action="/upload.do"
                            listType="picture-card"
                            accept="image/*"
                            capture="environment"
                            multiple
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );

    const handleAdd = () => {
        if (editingItem && !canEdit) {
            return;
        }
        if (!editingItem && !canCreate) {
            return;
        }
        form.validateFields().then((values) => {
            if (editingItem) {
                updateProperty({ ...editingItem, ...values });
            } else {
                addProperty({ status: 'Available', ...values });
            }
            if (isAddPage) {
                form.resetFields();
                setEditingItem(null);
                message.success(editingItem ? 'Property updated' : 'Property added');
            } else {
                setIsDrawerOpen(false);
                setEditingItem(null);
                form.resetFields();
            }
        });
    };

    const handleClose = () => {
        setIsDrawerOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    if (!canView) {
        return (
            <div>
                <h2>Properties</h2>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    if (isAddPage) {
        return (
            <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <h2 style={{ margin: 0 }}>Add Property</h2>
                    <Space>
                        <Button>
                            Add via Excel in Bulk
                        </Button>
                        <Button>
                            Add via table in Bulk
                        </Button>
                    </Space>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 8, padding: 24 }}>
                    <Form layout="vertical" form={form} hideRequiredMark>
                        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
                            <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                                    What
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: 16 }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="contactName" label="Contact Name">
                                            <Select
                                                showSearch
                                                placeholder="Select or enter contact"
                                                optionFilterProp="children"
                                                allowClear
                                            >
                                                {contacts.map(c => (
                                                    <Option key={c.key} value={c.name}>{c.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="contactNumber" label="Contact Number">
                                            <Input placeholder="Enter contact number" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="dealType" label="Deal Type">
                                            <Select placeholder="Select deal type">
                                                <Option value="Rent">Rent</Option>
                                                <Option value="Sale">Sale</Option>
                                                <Option value="Rent & Sale">Rent & Sale</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="propertyType" label="Property Type">
                                            <Select placeholder="Select property type">
                                                <Option value="Residential">Residential</Option>
                                                <Option value="Commercial">Commercial</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="type"
                                            label="Property Sub Type"
                                            rules={[{ required: true, message: 'Please select sub type' }]}
                                        >
                                            <Select placeholder="Select sub type">
                                                {subTypes.map(type => (
                                                    <Option key={type.key} value={type.name}>{type.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="bedrooms" label="BHK">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
                            <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                                    Address
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: 16 }}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item name="city" label="City">
                                            <Input placeholder="Enter city" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="area"
                                            label="Select Area/Locality"
                                            rules={[{ required: true, message: 'Please select area' }]}
                                        >
                                            <Select placeholder="Select area/locality">
                                                {areas.map(area => (
                                                    <Option key={area.key} value={area.name}>{area.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="society" label="Select Society/Colony/Project">
                                            <Select placeholder="Select society">
                                                {societies.map(society => (
                                                    <Option key={society.key} value={society.name}>{society.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={16}>
                                        <Form.Item name="address" label="Address">
                                            <Input placeholder="Enter address" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="unitNo" label="Unit No.">
                                            <Input placeholder="Enter unit number" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={16}>
                                        <Form.Item name="locationUrl" label="Google Location">
                                            <Input placeholder="https://www.google.com/maps?..." />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Button
                                            style={{ marginTop: 30, width: '100%' }}
                                            icon={<EnvironmentOutlined />}
                                            onClick={handleCaptureLocation}
                                        >
                                            Use Current Location
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
                            <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                                    Details
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: 16 }}>
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item name="totalFloor" label="Total Floor">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name="onFloor" label="On Floor">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name="areaSize" label="Size">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name="sizeUnit" label="Unit of Measurement">
                                            <Select placeholder="Select unit">
                                                <Option value="Sq ft">Sq ft</Option>
                                                <Option value="Sq yd">Sq yd</Option>
                                                <Option value="Sq mtr">Sq mtr</Option>
                                                <Option value="Acre">Acre</Option>
                                                <Option value="Hectare">Hectare</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="features" label="Features">
                                            <Select
                                                mode="multiple"
                                                placeholder="Select features"
                                                allowClear
                                            >
                                                {features.map(feature => (
                                                    <Option key={feature.key} value={feature.name}>{feature.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="amenities" label="Amenities">
                                            <Select
                                                mode="multiple"
                                                placeholder="Select amenities"
                                                allowClear
                                            >
                                                {amenities.map(amenity => (
                                                    <Option key={amenity.key} value={amenity.name}>{amenity.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item name="furniture" label="Furniture">
                                            <Select placeholder="Select furniture">
                                                <Option value="Fully Furnished">Fully Furnished</Option>
                                                <Option value="Kitchen Furnished">Kitchen Furnished</Option>
                                                <Option value="Semi Furnished">Semi Furnished</Option>
                                                <Option value="Unfurnished">Unfurnished</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="facing" label="Facing">
                                            <Select placeholder="Select facing">
                                                <Option value="East">East</Option>
                                                <Option value="West">West</Option>
                                                <Option value="North">North</Option>
                                                <Option value="South">South</Option>
                                                <Option value="North East">North East</Option>
                                                <Option value="North West">North West</Option>
                                                <Option value="South East">South East</Option>
                                                <Option value="South West">South West</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="parking" label="Parking">
                                            <Input placeholder="e.g. 1 Covered, 1 Open" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item name="yearOfConstruction" label="Year of Construction">
                                            <Input placeholder="e.g. 2015" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="availableFrom" label="Available From">
                                            <Input type="date" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8} style={{ display: 'flex', alignItems: 'center', marginTop: 30 }}>
                                        <Space>
                                            <Form.Item name="canBeUsedForCommercialUse" valuePropName="checked" style={{ marginBottom: 0 }}>
                                                <Checkbox>Can be used for commercial use</Checkbox>
                                            </Form.Item>
                                            <Form.Item name="available" valuePropName="checked" style={{ marginBottom: 0 }}>
                                                <Checkbox>Available</Checkbox>
                                            </Form.Item>
                                        </Space>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item name="description" label="Comments / Dimensions">
                                            <TextArea rows={3} placeholder="Enter comments related to property" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
                            <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                                    Rent
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: 16 }}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="price"
                                            label="Price"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                formatter={value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="rent" label="Rent">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="tax" label="Tax">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item name="maintenance" label="Maintenance">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="maintenanceBy" label="Maintenance By">
                                            <Select placeholder="Owner or Tenant">
                                                <Option value="Owner">Owner</Option>
                                                <Option value="Tenant">Tenant</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="brokerage" label="Brokerage">
                                            <Input placeholder="e.g. 2% or fixed amount" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
                            <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                                    Media
                                </div>
                            </div>
                            <div style={{ flex: 1, paddingLeft: 16 }}>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item name="images" label="Images (up to 5)">
                                            <Upload
                                                action="/upload.do"
                                                listType="picture-card"
                                                accept="image/*"
                                                capture="environment"
                                                multiple
                                            >
                                                <div>
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="videoLink" label="Video Link">
                                            <Input placeholder="Enter video link (e.g. YouTube URL)" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12} style={{ display: 'flex', alignItems: 'center', marginTop: 30 }}>
                                        <Space>
                                            <Form.Item name="brokerProperty" valuePropName="checked" style={{ marginBottom: 0 }}>
                                                <Checkbox>Broker&apos;s Property</Checkbox>
                                            </Form.Item>
                                            <Form.Item name="lockedProperty" valuePropName="checked" style={{ marginBottom: 0 }}>
                                                <Checkbox>Locked Property</Checkbox>
                                            </Form.Item>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <Button type="primary" onClick={handleAdd}>
                                Add Property
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ marginBottom: 8 }}>Properties</h2>
                    <Form
                        form={filterForm}
                        layout="inline"
                        onValuesChange={handleFilter}
                        style={{ rowGap: 8 }}
                    >
                        <Form.Item name="search" style={{ flex: 1 }}>
                            <Input placeholder="Search by title or area" allowClear prefix={<FilterOutlined />} />
                        </Form.Item>
                        <Form.Item name="bedrooms" label="BHK">
                            <InputNumber min={0} style={{ width: 80 }} />
                        </Form.Item>
                        <Form.Item name="minPrice" label="Min">
                            <InputNumber min={0} style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="maxPrice" label="Max">
                            <InputNumber min={0} style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="area" label="Area">
                            <Select allowClear style={{ width: 140 }} placeholder="Area">
                                {areas.map(area => (
                                    <Option key={area.key} value={area.name}>{area.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="type" label="Type">
                            <Select allowClear style={{ width: 140 }} placeholder="Type">
                                {subTypes.map(type => (
                                    <Option key={type.key} value={type.name}>{type.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button onClick={handleClearFilters}>Clear</Button>
                        </Form.Item>
                    </Form>
                </div>
                <Space>
                    <Upload
                        beforeUpload={handleImport}
                        showUploadList={false}
                        accept=".csv,.txt"
                    >
                        <Button icon={<UploadOutlined />}>
                            Import CSV
                        </Button>
                    </Upload>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
                        Add Property
                    </Button>
                </Space>
            </div>

            <Table columns={columns} dataSource={filtered} />

            <Drawer
                title={editingItem ? "Edit Property" : "Add New Property"}
                width={720}
                onClose={handleClose}
                open={isDrawerOpen}
                extra={
                    <Space>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="primary" onClick={handleAdd}>Submit</Button>
                    </Space>
                }
            >
                <Form layout="vertical" form={form} hideRequiredMark>
                    {renderFormFields()}
                </Form>
            </Drawer>
        </div>
    );
};

export default Properties;
