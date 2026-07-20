import React, { useState } from 'react';
import { Toast, Dialog, Modal } from 'antd-mobile';
import { Page, NavBar, Loading, Empty, useFetch } from '../components/common';
import { mallApi } from '../services/api';

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const EMPTY_FORM: Omit<Address, 'id'> = { name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false };

export default function MallAddressPage() {
  const { data, loading, error, reload } = useFetch<any[]>(mallApi.addresses, [], true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const addresses = (data || []) as Address[];

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const ok = await Dialog.confirm({ content: '确定删除该地址？' });
    if (!ok) return;
    try {
      await mallApi.removeAddress(id);
      Toast.show({ icon: 'success', content: '已删除' });
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '删除失败' });
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { Toast.show('请输入姓名'); return; }
    if (!form.phone.trim() || !/^1\d{10}$/.test(form.phone)) { Toast.show('请输入正确的手机号'); return; }
    if (!form.detail.trim()) { Toast.show('请输入详细地址'); return; }
    try {
      if (editId) {
        await mallApi.updateAddress(editId, form);
        Toast.show({ icon: 'success', content: '修改成功' });
      } else {
        await mallApi.addAddress(form);
        Toast.show({ icon: 'success', content: '添加成功' });
      }
      setModalVisible(false);
      reload();
    } catch {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Page>
      <NavBar title="收货地址" />

      {loading ? <Loading /> : (
        addresses.length === 0 ? <Empty text="暂无收货地址" /> : (
          <div className="card" style={{ margin: '8px 12px', padding: 0 }}>
            {addresses.map((addr) => (
              <div className="list-item" key={addr.id} style={{ alignItems: 'flex-start' }}>
                <div className="body">
                  <div className="title">
                    {addr.name}　{addr.phone}
                    {addr.isDefault && <span className="tag" style={{ marginLeft: 8, fontSize: 10 }}>默认</span>}
                  </div>
                  <div className="desc">
                    {addr.province}{addr.city}{addr.district}{addr.detail}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <span className="text-sm text-primary" style={{ cursor: 'pointer' }} onClick={() => openEdit(addr)}>编辑</span>
                  <span className="text-sm text-muted" style={{ cursor: 'pointer' }} onClick={() => handleDelete(addr.id)}>删除</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 底部新增按钮 */}
      <div style={{ padding: '16px 12px' }}>
        <button className="btn btn-primary btn-block" onClick={openAdd}>
          新增收货地址
        </button>
      </div>

      {/* 新增/编辑 Modal */}
      <Modal
        visible={modalVisible}
        title={editId ? '编辑地址' : '新增收货地址'}
        content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="姓名" value={form.name} onChange={(e) => setField('name', e.target.value)} />
            <input className="input" placeholder="手机号" maxLength={11} value={form.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))} />
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="input" placeholder="省" style={{ flex: 1 }} value={form.province} onChange={(e) => setField('province', e.target.value)} />
              <input className="input" placeholder="市" style={{ flex: 1 }} value={form.city} onChange={(e) => setField('city', e.target.value)} />
              <input className="input" placeholder="区" style={{ flex: 1 }} value={form.district} onChange={(e) => setField('district', e.target.value)} />
            </div>
            <textarea className="input textarea" placeholder="详细地址" value={form.detail} onChange={(e) => setField('detail', e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-sm">设为默认</span>
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setField('isDefault', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
            </div>
          </div>
        }
        closeOnAction
        onClose={() => setModalVisible(false)}
        actions={[
          { key: 'cancel', text: '取消', onClick: () => setModalVisible(false) },
          { key: 'ok', text: '保存', onClick: handleSubmit },
        ]}
      />
    </Page>
  );
}
