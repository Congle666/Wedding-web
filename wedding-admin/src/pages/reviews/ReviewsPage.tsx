import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs } from 'antd';
import toast from 'react-hot-toast';
import { reviewApi } from '../../api/review.api';
import PageHeader from '../../components/ui/PageHeader';
import ReviewCard from './components/ReviewCard';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const queryClient = useQueryClient();

  const { data: pendingRes, isLoading } = useQuery({
    queryKey: ['reviews-pending'],
    queryFn: () => reviewApi.listPending({ page: 1, limit: 50 }),
  });

  const pendingReviews = pendingRes?.data?.items || [];
  const pendingCount = pendingRes?.data?.total || 0;

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewApi.approve(id),
    onSuccess: () => {
      toast.success('Đã duyệt đánh giá');
      queryClient.invalidateQueries({ queryKey: ['reviews-pending'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-pending-reviews'] });
    },
    onError: () => {
      toast.error('Không thể duyệt đánh giá');
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const tabItems = [
    {
      key: 'pending',
      label: `Chờ duyệt (${pendingCount})`,
      children: (
        <div>
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40 }}>Đang tải...</p>
          ) : pendingReviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 40, fontSize: 14 }}>
              Không có đánh giá nào chờ duyệt
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  showActions
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'approved',
      label: 'Đã duyệt',
      children: (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 14, color: '#6B6B6B' }}>
            Các đánh giá đã duyệt sẽ hiển thị trên trang chi tiết mẫu thiệp
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Đánh giá" />
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </div>
    </>
  );
}
