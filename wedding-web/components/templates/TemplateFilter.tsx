'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { templateApi } from '@/lib/api/template.api';

export interface FilterState {
  category_id: string;
  price_range: string;
  has_video: boolean;
  sort: string;
}

export const defaultFilters: FilterState = {
  category_id: '',
  price_range: '',
  has_video: false,
  sort: 'newest',
};

interface TemplateFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const PRICE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'under_200k', label: 'Dưới 200.000 ₫' },
  { value: '200k_500k', label: '200.000 — 500.000 ₫' },
  { value: 'over_500k', label: 'Trên 500.000 ₫' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

export default function TemplateFilter({ filters, onChange }: TemplateFilterProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => templateApi.getCategories().then((res: any) => res.data),
  });

  const isAnyFilterActive =
    filters.category_id !== '' ||
    filters.price_range !== '' ||
    filters.has_video ||
    filters.sort !== 'newest';

  const handleCategoryChange = (catId: string) => {
    onChange({ ...filters, category_id: catId });
  };

  const handlePriceChange = (value: string) => {
    onChange({ ...filters, price_range: value });
  };

  const handleVideoChange = (checked: boolean) => {
    onChange({ ...filters, has_video: checked });
  };

  const handleSortChange = (value: string) => {
    onChange({ ...filters, sort: value });
  };

  const handleClear = () => {
    onChange({ ...defaultFilters });
  };

  const containerStyle: React.CSSProperties = {
    width: '260px',
    fontFamily: 'var(--font-body)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1F2937',
    margin: '0 0 24px 0',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 12px 0',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #EDE8E1',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4B5563',
    marginBottom: '8px',
    fontFamily: 'var(--font-body)',
  };

  const inputStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    accentColor: '#8B1A1A',
    cursor: 'pointer',
    margin: 0,
  };

  const clearBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    padding: 0,
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Bộ lọc</h3>

      {/* Danh mục */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Danh mục</p>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={filters.category_id === ''}
            onChange={() => handleCategoryChange('')}
            style={inputStyle}
          />
          Tất cả
        </label>
        {categories?.map((cat: any) => (
          <label key={cat.id} style={labelStyle}>
            <input
              type="checkbox"
              checked={filters.category_id === cat.id}
              onChange={() =>
                handleCategoryChange(filters.category_id === cat.id ? '' : cat.id)
              }
              style={inputStyle}
            />
            {cat.name}
          </label>
        ))}
      </div>

      {/* Giá thuê */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Giá thuê</p>
        {PRICE_OPTIONS.map((opt) => (
          <label key={opt.value} style={labelStyle}>
            <input
              type="radio"
              name="price_range"
              checked={filters.price_range === opt.value}
              onChange={() => handlePriceChange(opt.value)}
              style={inputStyle}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Tính năng */}
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Tính năng</p>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={filters.has_video}
            onChange={(e) => handleVideoChange(e.target.checked)}
            style={inputStyle}
          />
          Có video intro
        </label>
      </div>

      {/* Sắp xếp */}
      <div style={{ marginBottom: '24px' }}>
        <p style={sectionTitleStyle}>Sắp xếp</p>
        {SORT_OPTIONS.map((opt) => (
          <label key={opt.value} style={labelStyle}>
            <input
              type="radio"
              name="sort"
              checked={filters.sort === opt.value}
              onChange={() => handleSortChange(opt.value)}
              style={inputStyle}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Xoá bộ lọc */}
      {isAnyFilterActive && (
        <button style={clearBtnStyle} onClick={handleClear}>
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
