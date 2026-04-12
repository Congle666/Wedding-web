import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../../api/review.api';
import { orderApi } from '../../api/order.api';

interface MenuGroup {
  title: string;
  items: { key: string; label: string; badge?: number }[];
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: reviewsData } = useQuery({
    queryKey: ['sidebar-pending-reviews'],
    queryFn: () => reviewApi.listPending({ page: 1, limit: 1 }),
    refetchInterval: 60_000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['sidebar-pending-orders'],
    queryFn: () => orderApi.list({ page: 1, limit: 1, status: 'pending' }),
    refetchInterval: 60_000,
  });

  const pendingReviews = reviewsData?.data?.total || 0;
  const pendingOrders = ordersData?.data?.total || 0;

  const menuGroups: MenuGroup[] = [
    { title: 'Tổng quan', items: [{ key: '/dashboard', label: 'Tổng quan' }] },
    {
      title: 'Quản lý nội dung',
      items: [
        { key: '/templates', label: 'Mẫu thiệp' },
        { key: '/categories', label: 'Danh mục' },
        { key: '/orders', label: 'Đơn hàng', badge: pendingOrders || undefined },
        { key: '/banners', label: 'Banner' },
        { key: '/coupons', label: 'Mã giảm giá' },
        { key: '/reviews', label: 'Đánh giá', badge: pendingReviews || undefined },
      ],
    },
    { title: 'Người dùng', items: [{ key: '/users', label: 'Tài khoản' }] },
    { title: 'Hệ thống', items: [{ key: '/settings', label: 'Cài đặt' }] },
  ];

  const isActive = (key: string) => location.pathname === key || location.pathname.startsWith(key + '/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #E8E3DC' }}>
        <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 18, fontWeight: 700, color: '#8B1A1A' }}>Wedding Admin</p>
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{user?.full_name || 'Admin'}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>Quản trị viên</p>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }}>
        {menuGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', padding: '12px 12px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {group.title}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.key);
              return (
                <div
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: active ? '#8B1A1A' : '#6B6B6B',
                    fontWeight: active ? 500 : 400,
                    fontSize: 14,
                    background: active ? '#FFF5F5' : 'transparent',
                    borderLeft: active ? '3px solid #8B1A1A' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#F8F7F5';
                      e.currentTarget.style.color = '#1A1A1A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6B6B6B';
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '1px 8px',
                      borderRadius: 10,
                      background: '#FEF3C7',
                      color: '#92400E',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E8E3DC' }}>
        <div
          onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: '#6B6B6B', fontSize: 14 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#991B1B'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B6B'; }}
        >
          Đăng xuất
        </div>
      </div>
    </div>
  );
}
