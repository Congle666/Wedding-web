import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import viVN from 'antd/locale/vi_VN';

import ErrorBoundary from './components/ui/ErrorBoundary';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import TemplateFormPage from './pages/templates/TemplateFormPage';
import TemplateBuilderPage from './pages/templates/builder/TemplateBuilderPage';
import BuilderV2Page from './pages/templates/builder-v2/BuilderV2Page';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import BannersPage from './pages/banners/BannersPage';
import BannerFormPage from './pages/banners/BannerFormPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import CouponsPage from './pages/coupons/CouponsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#8B1A1A',
              borderRadius: 8,
              fontFamily: "'Inter', -apple-system, sans-serif",
            },
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/new" element={<TemplateFormPage />} />
                <Route path="/templates/edit/:id" element={<TemplateFormPage />} />
                <Route path="/templates/new/builder" element={<TemplateBuilderPage />} />
                <Route path="/templates/edit/:id/builder" element={<TemplateBuilderPage />} />
                <Route path="/templates/new/builder-v2" element={<BuilderV2Page />} />
                <Route path="/templates/edit/:id/builder-v2" element={<BuilderV2Page />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/banners" element={<BannersPage />} />
                <Route path="/banners/new" element={<BannerFormPage />} />
                <Route path="/banners/edit/:id" element={<BannerFormPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000, style: { borderRadius: 8, fontSize: 14 } }}
          />
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
