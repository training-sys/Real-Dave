import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const GenericMasterList = ({ title, data, onAdd, onEdit, onDelete, columns: customColumns, canView, canCreate, canEdit, canDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        if (!canCreate) {
            return;
        }
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        if (!canEdit) {
            return;
        }
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (editingItem) {
                onEdit({ ...editingItem, ...values });
            } else {
                onAdd({ key: Date.now().toString(), ...values });
            }
            setIsModalOpen(false);
        });
    };

    const baseColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    {canEdit && (
                        <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    )}
                    {canDelete && (
                        <Popconfirm title="Sure to delete?" onConfirm={() => onDelete(record.key)}>
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const columns = customColumns ? [...customColumns, ...baseColumns.slice(1)] : baseColumns;

    if (!canView) {
        return (
            <div>
                <h2>{title} Management</h2>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{title} Management</h2>
                {canCreate && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add New {title}
                    </Button>
                )}
            </div>

            <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />

            <Modal title={`${editingItem ? 'Edit' : 'Add'} ${title}`} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

GenericMasterList.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    onAdd: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    columns: PropTypes.array,
    canView: PropTypes.bool.isRequired,
    canCreate: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
};

export default GenericMasterList;
