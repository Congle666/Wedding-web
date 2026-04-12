import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'antd';
import { userApi } from '../../api/user.api';
import type { User, Order } from '../../types';
import { PROVIDER_LABELS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import UserTable from './components/UserTable';

interface UserWithOrderCount extends User {
  order_count: number;
}

const providerFilterOptions = [
  { value: '', label: 'Tất cả' },
  ...Object.entries(PROVIDER_LABELS).map(([value, label]) => ({ value, label })),
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users-orders'],
    queryFn: () => userApi.getOrdersForUsers({ page: 1, limit: 200 }),
  });

  const orders: Order[] = data?.data?.items || [];

  const users: UserWithOrderCount[] = useMemo(() => {
    const userMap = new Map<string, UserWithOrderCount>();
    for (const order of orders) {
      if (!order.user) continue;
      const existing = userMap.get(order.user.id);
      if (existing) {
        existing.order_count += 1;
      } else {
        userMap.set(order.user.id, {
          ...order.user,
          order_count: 1,
        });
      }
    }
    return Array.from(userMap.values());
  }, [orders]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchProvider = !providerFilter || u.provider === providerFilter;
      return matchSearch && matchProvider;
    });
  }, [users, search, providerFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <>
      <PageHeader title="Tài khoản" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ marginBottom: 16 }}>
        <SearchInput placeholder="Tìm theo tên hoặc email..." onSearch={handleSearch} />
        <Select
          value={providerFilter}
          onChange={setProviderFilter}
          options={providerFilterOptions}
          style={{ width: 160 }}
          placeholder="Đăng ký qua"
        />
      </div>

      <UserTable users={filteredUsers} loading={isLoading} />
    </>
  );
}
