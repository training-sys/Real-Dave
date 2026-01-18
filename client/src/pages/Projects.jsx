import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Drawer, Form, Input, Select, InputNumber, Row, Col, Progress, Popconfirm, Upload, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EnvironmentOutlined, BuildOutlined } from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, areas, userProfile, permissions, addProperty } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [inventoryForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [filtered, setFiltered] = useState(projects);

  const isSuperAdmin = userProfile.role === 'Administrator';
  const effectiveRole = isSuperAdmin ? 'Admin' : userProfile.role || 'Admin';
  const rolePermissions = permissions[effectiveRole] || {};
  const modulePermissions = rolePermissions.Projects || {};
  const canView = isSuperAdmin || !!modulePermissions.view;
  const canCreate = isSuperAdmin || !!modulePermissions.create;
  const canEdit = isSuperAdmin || !!modulePermissions.edit;
  const canDelete = isSuperAdmin || !!modulePermissions.delete;
  const isAddPage = location.pathname === '/addproject';

  useEffect(() => {
    if (location.state && location.state.openAdd) {
      setEditingItem(null);
      form.resetFields();
      setIsDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, form, navigate]);

  useEffect(() => {
    setFiltered(projects);
  }, [projects]);

  const handleFilter = () => {
    const values = filterForm.getFieldsValue();
    const { search, status, location: locationFilter } = values;

    const next = projects.filter((project) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesText =
          project.name.toLowerCase().includes(s) ||
          (project.location || '').toLowerCase().includes(s);
        if (!matchesText) {
          return false;
        }
      }

      if (status && project.status !== status) {
        return false;
      }

      if (locationFilter && project.location !== locationFilter) {
        return false;
      }

      return true;
    });

    setFiltered(next);
  };

  const handleClearFilters = () => {
    filterForm.resetFields();
    setFiltered(projects);
  };

  if (!canView) {
    return (
      <div>
        <h2>Projects</h2>
        <p>You do not have permission to view this module.</p>
      </div>
    );
  }

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
    deleteProject(key);
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

  const handleInventoryGen = (project) => {
    setSelectedProject(project);
    setIsInventoryOpen(true);
  };

  const submitInventory = () => {
    inventoryForm.validateFields().then((values) => {
      const { towerName, startFloor, endFloor, unitsPerFloor, startingNumber, type, price, size } = values;
      let count = 0;

      for (let floor = startFloor; floor <= endFloor; floor++) {
        for (let u = 0; u < unitsPerFloor; u++) {
          const unitNo = startingNumber + u;
          const propertyTitle = `${towerName}-${floor}${unitNo}`;

          addProperty({
            title: propertyTitle,
            unitNo: `${floor}${unitNo}`,
            project: selectedProject.name,
            location: selectedProject.location,
            area: selectedProject.area,
            price: price,
            type: type,
            areaSize: size,
            status: 'Available',
            bedrooms: type === '2BHK' ? 2 : type === '3BHK' ? 3 : 1,
            bathrooms: type === '2BHK' ? 2 : type === '3BHK' ? 3 : 1,
          });
          count++;
        }
      }

      message.success(`Successfully generated ${count} units for ${selectedProject.name}`);
      setIsInventoryOpen(false);
      inventoryForm.resetFields();
    });
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'Ready to Move' ? 'green' : 'blue'} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Units',
      key: 'units',
      render: (_, record) => `${record.soldUnits} / ${record.totalUnits} Sold`,
    },
    {
      title: 'Progress',
      key: 'completion',
      dataIndex: 'completion',
      render: (completion) => <Progress percent={completion} size="small" />,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {canEdit && (
            <Button icon={<BuildOutlined />} size="small" onClick={() => handleInventoryGen(record)} title="Manage Inventory" />
          )}
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

  const handleAdd = () => {
    if (editingItem && !canEdit) {
      return;
    }
    if (!editingItem && !canCreate) {
      return;
    }
    form.validateFields().then((values) => {
      if (editingItem) {
        updateProject({ ...editingItem, ...values });
      } else {
        addProject({ soldUnits: 0, completion: 0, ...values });
      }
      if (isAddPage) {
        form.resetFields();
        setEditingItem(null);
        message.success(editingItem ? 'Project updated' : 'Project added');
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

  if (isAddPage) {
    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Add Project</h2>
        </div>
        <div style={{ background: '#ffffff', borderRadius: 8, padding: 24 }}>
          <Form layout="vertical" form={form} hideRequiredMark>
            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
              <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                  Basic
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Project Name"
                      rules={[{ required: true, message: 'Please enter project name' }]}
                    >
                      <Input placeholder="Enter project name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="area"
                      label="Area"
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
                  <Col span={12}>
                    <Form.Item
                      name="location"
                      label="Location"
                      rules={[{ required: true, message: 'Please select location' }]}
                    >
                      <Select placeholder="Select location">
                        <Option value="Downtown">Downtown</Option>
                        <Option value="Suburbs">Suburbs</Option>
                        <Option value="Green Valley">Green Valley</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="developer"
                      label="Developer"
                    >
                      <Input placeholder="Enter developer name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[{ required: true, message: 'Please select status' }]}
                    >
                      <Select placeholder="Select status">
                        <Option value="Planning">Planning</Option>
                        <Option value="Under Construction">Under Construction</Option>
                        <Option value="Ready to Move">Ready to Move</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="totalUnits"
                      label="Total Units"
                      rules={[{ required: true, message: 'Please enter total units' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
              <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                  Location
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="address"
                      label="Address"
                    >
                      <Input placeholder="Enter address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="locationUrl"
                      label="Google Location"
                    >
                      <Input placeholder="https://www.google.com/maps?..." />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Button
                      style={{ marginTop: 30, width: '100%' }}
                      icon={<EnvironmentOutlined />}
                      onClick={handleCaptureLocation}
                    >
                      Use Current Location
                    </Button>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="reraNumber"
                      label="Rera Number"
                    >
                      <Input placeholder="Enter Rera number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="housingProjectId"
                      label="Housing Project Id"
                    >
                      <Input placeholder="Enter housing project id" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="specialProjectId"
                      label="Special Project Id"
                    >
                      <Input placeholder="Enter special project id" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="magicBricksProjectId"
                      label="MagicBricks Project Id"
                    >
                      <Input placeholder="Enter MagicBricks project id" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
              <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                  Details
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="possessionDate"
                      label="Possession Date"
                    >
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="majorAmenities"
                      label="Major Amenities"
                    >
                      <TextArea rows={3} placeholder="Enter major amenities" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="shortDescription"
                      label="Short Description"
                    >
                      <TextArea rows={3} placeholder="Enter short description" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                    >
                      <TextArea rows={4} placeholder="Enter project description" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 24 }}>
              <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                  Media
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="brochure"
                      label="Brochure (up to 2.5MB)"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                    >
                      <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Choose File</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="videoLink"
                      label="Video Link"
                    >
                      <Input placeholder="Enter video link (e.g. YouTube URL)" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="images"
                      label="Images (up to 10)"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                    >
                      <Upload
                        beforeUpload={() => false}
                        listType="picture-card"
                        multiple
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="documents"
                      label="Documents (up to 5)"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                    >
                      <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Choose Files</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 8 }}>
              <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 600, fontSize: 12, letterSpacing: 1, color: '#64748b' }}>
                  Sales
                </div>
              </div>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="salesPersonName"
                      label="Sales Person Name"
                    >
                      <Input placeholder="Enter sales person name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="salesPersonNumber"
                      label="Sales Person Mobile Number"
                    >
                      <Input placeholder="+91" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Button type="primary" onClick={handleAdd}>
                Add Project
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
          <h2 style={{ marginBottom: 8 }}>Projects</h2>
          <Form
            form={filterForm}
            layout="inline"
            onValuesChange={handleFilter}
            style={{ rowGap: 8 }}
          >
            <Form.Item name="search" style={{ flex: 1 }}>
              <Input placeholder="Search by project or location" allowClear />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select allowClear style={{ width: 180 }} placeholder="Status">
                <Option value="Planning">Planning</Option>
                <Option value="Under Construction">Under Construction</Option>
                <Option value="Ready to Move">Ready to Move</Option>
              </Select>
            </Form.Item>
            <Form.Item name="location" label="Location">
              <Select allowClear style={{ width: 160 }} placeholder="Location">
                <Option value="Downtown">Downtown</Option>
                <Option value="Suburbs">Suburbs</Option>
                <Option value="Green Valley">Green Valley</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleClearFilters}>
                Clear
              </Button>
            </Form.Item>
          </Form>
        </div>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            Add Project
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={filtered} />

      <Drawer
        title={`Generate Inventory - ${selectedProject?.name}`}
        width={500}
        onClose={() => setIsInventoryOpen(false)}
        open={isInventoryOpen}
        extra={
          <Button type="primary" onClick={submitInventory}>Generate</Button>
        }
      >
        <Form layout="vertical" form={inventoryForm}>
          <Form.Item name="towerName" label="Tower Name" initialValue="A" rules={[{ required: true }]}>
            <Input placeholder="e.g. Tower A" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startFloor" label="Start Floor" initialValue={1} rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endFloor" label="End Floor" initialValue={10} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unitsPerFloor" label="Units / Floor" initialValue={4} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startingNumber" label="Start Number" initialValue={101} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Unit Type" initialValue="2BHK">
                <Select>
                  <Option value="1BHK">1 BHK</Option>
                  <Option value="2BHK">2 BHK</Option>
                  <Option value="3BHK">3 BHK</Option>
                  <Option value="4BHK">4 BHK</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="size" label="Size (sqft)" initialValue={1200}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="price" label="Base Price" initialValue={5000000} rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingItem ? "Edit Project" : "Add New Project"}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="e.g. Skyline Heights" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please select location' }]}
              >
                <Select placeholder="Select location">
                  <Option value="Downtown">Downtown</Option>
                  <Option value="Suburbs">Suburbs</Option>
                  <Option value="Green Valley">Green Valley</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Planning">Planning</Option>
                  <Option value="Under Construction">Under Construction</Option>
                  <Option value="Ready to Move">Ready to Move</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalUnits"
                label="Total Units"
                rules={[{ required: true, message: 'Please enter total units' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={4} placeholder="Project details..." />
              </Form.Item>
            </Col>
          </Row>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="images"
                label="Images"
              >
                <Upload
                  action="/upload.do"
                  listType="picture"
                  accept="image/*"
                  capture="environment"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default Projects;
