import { useState } from 'react';
import { Card, Input } from 'antd';
import PageHeader from '../../components/ui/PageHeader';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('Wedding Invitation');
  const [siteEmail, setSiteEmail] = useState('admin@wedding.vn');
  const [sitePhone, setSitePhone] = useState('0901 234 567');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <>
      <PageHeader title="Cài đặt" />

      <div style={{ maxWidth: 640 }}>
        <Card
          title={
            <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}>
              Thông tin hệ thống
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #E8E3DC' }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Tên website
            </label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Email
            </label>
            <Input value={siteEmail} onChange={(e) => setSiteEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Số điện thoại
            </label>
            <Input value={sitePhone} onChange={(e) => setSitePhone(e.target.value)} />
          </div>
        </Card>

        <Card
          title={
            <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}>
              Tài khoản admin
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #E8E3DC' }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Mật khẩu hiện tại
            </label>
            <Input.Password
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Mật khẩu mới
            </label>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Xác nhận mật khẩu mới
            </label>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <button
            type="button"
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#6E1515')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#8B1A1A')}
          >
            Đổi mật khẩu
          </button>
        </Card>
      </div>
    </>
  );
}
