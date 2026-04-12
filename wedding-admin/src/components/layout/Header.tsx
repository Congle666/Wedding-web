import { useLocation } from 'react-router-dom';
import { Dropdown } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/ui.store';
import { getInitials } from '../../utils/helpers';

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/dashboard': ['Tổng quan'],
  '/templates': ['Mẫu thiệp'],
  '/templates/new': ['Mẫu thiệp', 'Thêm mới'],
  '/orders': ['Đơn hàng'],
  '/banners': ['Banner'],
  '/banners/new': ['Banner', 'Thêm mới'],
  '/reviews': ['Đánh giá'],
  '/users': ['Tài khoản'],
  '/settings': ['Cài đặt'],
};

export default function Header() {
  const { user, logout } = useAuth();
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const location = useLocation();

  const crumbs = BREADCRUMB_MAP[location.pathname] || (() => {
    if (location.pathname.startsWith('/templates/edit/')) return ['Mẫu thiệp', 'Chỉnh sửa'];
    if (location.pathname.startsWith('/orders/')) return ['Đơn hàng', 'Chi tiết'];
    if (location.pathname.startsWith('/banners/edit/')) return ['Banner', 'Chỉnh sửa'];
    return ['Tổng quan'];
  })();

  const dropdownItems = [
    { key: 'name', label: user?.full_name || 'Admin', disabled: true },
    { type: 'divider' as const },
    { key: 'logout', label: 'Đăng xuất', danger: true, onClick: logout },
  ];

  return (
    <>
      <style>{`
        .header-mobile-menu { display: block; }
        .header-breadcrumb { display: none; }
        .header-username { display: none; }
        @media (min-width: 640px) {
          .header-username { display: inline; }
        }
        @media (min-width: 1024px) {
          .header-mobile-menu { display: none; }
          .header-breadcrumb { display: flex; }
        }
      `}</style>
      <header style={{
        height: 64,
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #E8E3DC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="header-mobile-menu"
            onClick={() => setMobileSidebar(true)}
            style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: '#1A1A1A', cursor: 'pointer', padding: '4px 0' }}
          >
            Menu
          </button>

          <nav className="header-breadcrumb" style={{ alignItems: 'center', gap: 4, fontSize: 14 }}>
            {crumbs.map((crumb, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: '#9CA3AF', margin: '0 6px' }}>/</span>}
                <span style={{ color: i === crumbs.length - 1 ? '#1A1A1A' : '#6B6B6B', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FFF5F5',
              color: '#8B1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {getInitials(user?.full_name || '')}
            </div>
            <span className="header-username" style={{ fontSize: 14, fontWeight: 500 }}>
              {user?.full_name || 'Admin'}
            </span>
          </div>
        </Dropdown>
      </header>
    </>
  );
}
