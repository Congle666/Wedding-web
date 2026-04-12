import { Input } from 'antd';
import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  style?: React.CSSProperties;
}

export default function SearchInput({ placeholder, onSearch, style }: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <Input
      allowClear
      placeholder={placeholder || 'Tìm kiếm...'}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ width: 280, ...style }}
    />
  );
}
