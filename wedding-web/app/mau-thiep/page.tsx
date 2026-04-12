'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import TemplateFilter, {
  defaultFilters,
  type FilterState,
} from '@/components/templates/TemplateFilter';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { templateApi, type TemplateListParams } from '@/lib/api/template.api';
import { useDebounce } from '@/lib/hooks/useDebounce';

const LIMIT = 12;

export default function TemplateListPage() {
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo<TemplateListParams>(() => {
    const p: TemplateListParams = {
      page,
      limit: LIMIT,
      sort: filters.sort,
    };
    if (filters.category_id) p.category_id = filters.category_id;
    if (debouncedSearch) p.search = debouncedSearch;
    if (filters.has_video) p.has_video = true;
    return p;
  }, [page, filters, debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateApi.list(params).then((res) => res.data),
  });

  const templates = (data as any)?.items ?? [];
  const total = (data as any)?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters });
    setSearch('');
    setPage(1);
  };

  /* ───── styles ───── */

  const pageWrapperStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const heroStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '48px 24px 32px',
    maxWidth: '720px',
    margin: '0 auto',
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: '40px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    color: '#1F2937',
    margin: '0 0 12px 0',
    lineHeight: 1.2,
  };

  const heroSubStyle: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: 'var(--font-body)',
    color: '#6B7280',
    margin: '0 0 8px 0',
    lineHeight: 1.6,
  };

  const heroBadgeStyle: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    color: '#8B1A1A',
    fontWeight: 600,
    margin: 0,
  };

  const layoutStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 64px',
    display: 'flex',
    gap: '32px',
    flex: 1,
  };

  const sidebarDesktopStyle: React.CSSProperties = {
    flexShrink: 0,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const mobileSearchRowStyle: React.CSSProperties = {
    display: 'none',
    gap: '12px',
    marginBottom: '20px',
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '40px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: '#4B5563',
  };

  const mobileOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
    display: mobileFilterOpen ? 'block' : 'none',
  };

  const mobileDrawerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '300px',
    backgroundColor: '#FFFFFF',
    zIndex: 101,
    padding: '24px',
    overflowY: 'auto',
    transform: mobileFilterOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  };

  const mobileDrawerCloseStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: '#6B7280',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
  };

  return (
    <div style={pageWrapperStyle}>
      <Header />

      <style>{`
        @media (max-width: 768px) {
          .tpl-sidebar-desktop { display: none !important; }
          .tpl-mobile-search { display: flex !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={heroStyle}>
        <h1 style={heroTitleStyle}>Mẫu thiệp cưới đẹp</h1>
        <p style={heroSubStyle}>
          Chọn mẫu phù hợp với phong cách của bạn
        </p>
        {!isLoading && (
          <p style={heroBadgeStyle}>
            Đang hiển thị {total} mẫu thiệp
          </p>
        )}
      </div>

      {/* Main layout */}
      <div style={layoutStyle}>
        {/* Desktop sidebar */}
        <div className="tpl-sidebar-desktop" style={sidebarDesktopStyle}>
          <TemplateFilter filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Main content */}
        <div style={mainStyle}>
          {/* Mobile: search + filter toggle */}
          <div className="tpl-mobile-search" style={mobileSearchRowStyle}>
            <input
              type="text"
              placeholder="Tìm kiếm mẫu thiệp..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={searchInputStyle}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
            >
              Lọc
            </Button>
          </div>

          <TemplateGrid
            templates={templates}
            loading={isLoading}
            total={total}
            onClearFilters={handleClearFilters}
          />

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div style={paginationStyle}>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div style={mobileOverlayStyle} onClick={() => setMobileFilterOpen(false)} />
      <div style={mobileDrawerStyle}>
        <button
          style={mobileDrawerCloseStyle}
          onClick={() => setMobileFilterOpen(false)}
        >
          Đóng
        </button>
        <TemplateFilter filters={filters} onChange={handleFilterChange} />
      </div>

      <Footer />
    </div>
  );
}
