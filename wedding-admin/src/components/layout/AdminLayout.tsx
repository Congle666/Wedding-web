import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

export default function AdminLayout() {
  const token = useAuthStore((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <style>{`
        .admin-sidebar {
          display: none;
          width: 260px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          border-right: 1px solid #E8E3DC;
          z-index: 100;
          background: #fff;
        }
        .admin-main {
          margin-left: 0;
          min-height: 100vh;
        }
        @media (min-width: 1024px) {
          .admin-sidebar { display: block; }
          .admin-main { margin-left: 260px; }
        }
        .admin-content {
          padding: 24px;
          background: #F8F7F5;
          min-height: calc(100vh - 64px);
        }
        @media (max-width: 640px) {
          .admin-content { padding: 12px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh' }}>
        <aside className="admin-sidebar">
          <Sidebar />
        </aside>

        <MobileSidebar />

        <div className="admin-main">
          <Header />
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
