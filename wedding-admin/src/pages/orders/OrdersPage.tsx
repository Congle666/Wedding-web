import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import type { OrderStatus } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import OrderFilter from './components/OrderFilter';
import OrderTable from './components/OrderTable';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, limit, selectedStatus, search],
    queryFn: () =>
      orderApi.list({
        page,
        limit,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      }),
  });

  // Fetch all orders for status counts (without pagination filter)
  const { data: allOrdersData } = useQuery({
    queryKey: ['orders-counts'],
    queryFn: () => orderApi.list({ limit: 9999 }),
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      paid: 0,
      published: 0,
      expired: 0,
      cancelled: 0,
    };
    if (allOrdersData?.data?.items) {
      for (const order of allOrdersData.data.items) {
        const s = order.status as OrderStatus;
        if (counts[s] !== undefined) {
          counts[s]++;
        }
      }
    }
    return counts;
  }, [allOrdersData]);

  const orders = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number, pageSize: number) => {
    setPage(newPage);
    setLimit(pageSize);
  }, []);

  // Filter by search locally if API doesn't support it
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.user?.email?.toLowerCase().includes(q) ||
        order.user?.full_name?.toLowerCase().includes(q),
    );
  }, [orders, search]);

  return (
    <div>
      <PageHeader title="Đơn hàng" subtitle={`Tổng cộng ${total} đơn hàng`} />

      <OrderFilter
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        selectedStatus={selectedStatus}
        statusCounts={statusCounts}
      />

      <OrderTable
        orders={filteredOrders}
        total={search ? filteredOrders.length : total}
        page={page}
        limit={limit}
        loading={isLoading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
