import { useCallback } from 'react';
import { Select, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import SearchInput from '../../../components/ui/SearchInput';
import { templateApi } from '../../../api/template.api';

export interface TemplateFilters {
  search: string;
  category_id: number | string;
  status: string;
  sort: string;
}

interface TemplateFilterProps {
  filters: TemplateFilters;
  onChange: (filters: TemplateFilters) => void;
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'inactive', label: 'Đã ẩn' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
];

export default function TemplateFilter({ filters, onChange }: TemplateFilterProps) {
  const { data: categoriesRes } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templateApi.getCategories(),
  });

  const categories = categoriesRes?.data || [];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category_id !== '' ||
    filters.status !== '' ||
    filters.sort !== 'newest';

  const handleSearch = useCallback(
    (value: string) => {
      onChange({ ...filters, search: value });
    },
    [filters, onChange],
  );

  const handleClear = () => {
    onChange({ search: '', category_id: '', status: '', sort: 'newest' });
  };

  const selectStyle: React.CSSProperties = { minWidth: 160 };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}
    >
      <SearchInput placeholder="Tìm kiếm mẫu thiệp..." onSearch={handleSearch} />

      <Select
        value={filters.category_id || undefined}
        placeholder="Danh mục"
        allowClear
        onChange={(val) => onChange({ ...filters, category_id: val ?? '' })}
        style={selectStyle}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />

      <Select
        value={filters.status || undefined}
        placeholder="Trạng thái"
        allowClear
        onChange={(val) => onChange({ ...filters, status: val ?? '' })}
        style={selectStyle}
        options={statusOptions}
      />

      <Select
        value={filters.sort}
        onChange={(val) => onChange({ ...filters, sort: val })}
        style={selectStyle}
        options={sortOptions}
      />

      {hasActiveFilters && (
        <Button type="link" onClick={handleClear} style={{ color: '#8B1A1A', padding: 0 }}>
          Xoá bộ lọc
        </Button>
      )}
    </div>
  );
}
