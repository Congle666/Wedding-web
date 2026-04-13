import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import TemplateFilter from './components/TemplateFilter';
import type { TemplateFilters } from './components/TemplateFilter';
import TemplateTable from './components/TemplateTable';
import { templateApi } from '../../api/template.api';

const defaultFilters: TemplateFilters = {
  search: '',
  category_id: '',
  status: '',
  sort: 'newest',
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TemplateFilters>(defaultFilters);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', page, filters],
    queryFn: () =>
      templateApi.list({
        page,
        limit: 10,
        search: filters.search || undefined,
        category_id: filters.category_id || undefined,
        sort: filters.sort,
        has_video: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : undefined,
      }),
  });

  const handleFiltersChange = useCallback((newFilters: TemplateFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleAdd = () => {
    navigate('/templates/new');
  };

  const handleOpenBuilder = () => {
    navigate('/templates/new/builder');
  };

  return (
    <>
      <PageHeader
        title="Mẫu thiệp"
        onAdd={handleAdd}
        addText="Thêm mẫu mới"
        extra={
          <button
            onClick={handleOpenBuilder}
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Tạo thiệp mới (Builder)
          </button>
        }
      />
      <TemplateFilter filters={filters} onChange={handleFiltersChange} />
      <TemplateTable
        data={data?.data}
        loading={isLoading}
        page={page}
        onPageChange={setPage}
        onAdd={handleAdd}
      />
    </>
  );
}
