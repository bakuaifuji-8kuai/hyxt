import { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchListData, createItemData, updateItemData, deleteItemData, toggleStatusData } from '../services/request';
import { getModule } from '../services/modules';
import type { FieldConfig } from '../services/modules';
import FeatureDescription from '../components/FeatureDescription';
import dayjs from 'dayjs';

export default function GenericCRUD({ moduleKey }: { moduleKey: string }) {
  const module = getModule(moduleKey);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadData = useCallback(async () => {
    if (!module) return;
    setLoading(true);
    try {
      const res: any = await fetchListData(module.path, { page, pageSize, keyword: searchKeyword || undefined });
      const list = res?.list ?? res ?? [];
      setData(list);
      setTotal(res?.total ?? list.length);
    } catch (e: any) {
      message.error(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [module, page, pageSize, searchKeyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!module) return <div>模块不存在: {moduleKey}</div>;

  const handleAdd = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled' });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItemData(module.path, id);
      message.success('删除成功');
      loadData();
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editId != null) {
        await updateItemData(module.path, editId, values);
        message.success('编辑成功');
      } else {
        await createItemData(module.path, values);
        message.success('新增成功');
      }
      setModalOpen(false);
      loadData();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e.message || '操作失败');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleStatusData(module.path, id);
      message.success('状态已切换');
      loadData();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const renderField = (field: FieldConfig) => {
    switch (field.type) {
      case 'number':
        return <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />;
      case 'select':
        return <Select options={field.options} placeholder={field.placeholder || '请选择'} />;
      case 'textarea':
        return <Input.TextArea rows={3} placeholder={field.placeholder} />;
      case 'switch':
        return <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />;
      default:
        return <Input placeholder={field.placeholder || `请输入${field.label}`} />;
    }
  };

  const columns: any[] = [
    ...module.columns.map((c) => ({
      ...c,
      render: c.render ? (val: any, record: any) => c.render!(val, record) : (val: any) => (val != null ? String(val) : '-')
    })),
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggle(record.id)}>切换状态</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={module.name}
        extra={<FeatureDescription module={module} />}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search
              placeholder="搜索名称/编码"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={() => { setPage(1); loadData(); }}
              style={{ width: 240 }}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); }
          }}
        />
      </Card>
      <Modal
        title={editId != null ? `编辑${module.name}` : `新增${module.name}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {module.fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
