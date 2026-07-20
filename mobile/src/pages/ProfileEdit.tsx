import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, ActionSheet } from 'antd-mobile';
import { Page, NavBar, Loading, Img } from '../components/common';
import { getStoredMember, fetchMe, updateProfile, Member } from '../services/auth';

const GENDER_OPTIONS = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' },
  { label: '保密', value: 'SECRET' },
];

const INTEREST_TAGS = ['美食', '购物', '电影', '运动', '阅读', '旅行', '音乐', '亲子'];

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(getStoredMember());
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(member?.name || '');
  const [gender, setGender] = useState(member?.gender || '');
  const [birthday, setBirthday] = useState(member?.birthday || '');
  const [email, setEmail] = useState(member?.email || '');
  const [address, setAddress] = useState(member?.address || '');
  const [occupation, setOccupation] = useState((member as any)?.occupation || '');
  const [interests, setInterests] = useState<string[]>((member as any)?.interests || []);

  useEffect(() => {
    fetchMe().then(setMember).catch(() => {});
  }, []);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setGender(member.gender || '');
      setBirthday(member.birthday || '');
      setEmail(member.email || '');
      setAddress(member.address || '');
      setOccupation((member as any).occupation || '');
      setInterests((member as any).interests || []);
    }
  }, [member]);

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const showGenderSheet = () => {
    const handler = ActionSheet.show({
      actions: GENDER_OPTIONS.map((g) => ({ text: g.label, key: g.value })),
      cancelText: '取消',
      onAction: (action) => {
        if (action?.key) setGender(String(action.key));
        handler.close();
      },
    });
  };

  const genderLabel = GENDER_OPTIONS.find((g) => g.value === gender)?.label || '请选择';

  const handleSave = async () => {
    if (!name.trim()) { Toast.show('请输入昵称'); return; }
    setSaving(true);
    try {
      await updateProfile({
        name,
        gender,
        birthday,
        email,
        address,
        occupation,
        interests,
      } as any);
      Toast.show({ icon: 'success', content: '保存成功' });
      navigate(-1);
    } catch (e: any) {
      Toast.show({ icon: 'fail', content: e.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <NavBar title="完善资料" />

      {/* 提示条 */}
      <div className="notice-bar">
        <span>💡</span>
        <span>完善资料可获得 100 积分奖励</span>
      </div>

      {/* 头像区 */}
      <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto',
          overflow: 'hidden', border: '3px solid var(--primary)', position: 'relative',
        }}>
          <Img src={member?.avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="text-sm text-muted mt-8">点击修改</div>
      </div>

      {/* 表单 */}
      <div className="card" style={{ margin: '0 12px' }}>
        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">昵称</div>
            <input className="input" placeholder="请输入昵称" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }} onClick={showGenderSheet}>
          <div className="body">
            <div className="text-sm text-muted mb-8">性别</div>
            <div className="text-md">{genderLabel}</div>
          </div>
          <span className="arrow">›</span>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">生日</div>
            <input className="input" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">手机号</div>
            <input className="input" value={member?.phone || ''} readOnly style={{ background: '#f5f5f5' }} />
          </div>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">邮箱</div>
            <input className="input" type="email" placeholder="请输入邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">地址</div>
            <textarea className="input textarea" placeholder="请输入地址" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        <div className="list-item" style={{ padding: '12px 0' }}>
          <div className="body">
            <div className="text-sm text-muted mb-8">职业</div>
            <input className="input" placeholder="请输入职业" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </div>
        </div>

        <div style={{ padding: '12px 0' }}>
          <div className="text-sm text-muted mb-8">兴趣爱好</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTEREST_TAGS.map((tag) => (
              <span
                key={tag}
                className={`tag ${interests.includes(tag) ? '' : 'tag-gray'}`}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}
                onClick={() => toggleInterest(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div style={{ padding: '16px 12px' }}>
        <button className="btn btn-primary btn-block" disabled={saving} onClick={handleSave}>
          {saving ? '保存中…' : '保存'}
        </button>
      </div>
    </Page>
  );
}
